// Speech-to-Text API integrations
export interface TranscriptionResult {
  text: string
  confidence: number
  words: WordTiming[]
  alternatives?: string[]
}

export interface WordTiming {
  word: string
  startTime: number
  endTime: number
  confidence: number
}

export interface STTConfig {
  provider: 'google' | 'azure' | 'aws'
  apiKey: string
  language: string
  enableWordTimings: boolean
  enableProfanityFilter: boolean
}

export class SpeechToTextService {
  private config: STTConfig

  constructor(config: STTConfig) {
    this.config = config
  }

  async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    switch (this.config.provider) {
      case 'google':
        return this.transcribeWithGoogle(audioBlob)
      case 'azure':
        return this.transcribeWithAzure(audioBlob)
      case 'aws':
        return this.transcribeWithAWS(audioBlob)
      default:
        throw new Error('Unsupported STT provider')
    }
  }

  private async transcribeWithGoogle(audioBlob: Blob): Promise<TranscriptionResult> {
    const audioBase64 = await this.blobToBase64(audioBlob)
    
    const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: this.config.language,
          enableWordTimeOffsets: this.config.enableWordTimings,
          profanityFilter: this.config.enableProfanityFilter,
          enableAutomaticPunctuation: true,
          model: 'latest_long'
        },
        audio: {
          content: audioBase64
        }
      })
    })

    const result = await response.json()
    
    if (!result.results || result.results.length === 0) {
      return {
        text: '',
        confidence: 0,
        words: []
      }
    }

    const recognition = result.results[0]
    const alternative = recognition.alternatives[0]

    return {
      text: alternative.transcript,
      confidence: alternative.confidence,
      words: alternative.words?.map((word: any) => ({
        word: word.word,
        startTime: parseFloat(word.startTime?.replace('s', '') || '0'),
        endTime: parseFloat(word.endTime?.replace('s', '') || '0'),
        confidence: word.confidence || 1
      })) || [],
      alternatives: recognition.alternatives.slice(1).map((alt: any) => alt.transcript)
    }
  }

  private async transcribeWithAzure(audioBlob: Blob): Promise<TranscriptionResult> {
    // Azure Speech Service implementation
    const formData = new FormData()
    formData.append('audio', audioBlob)

    const response = await fetch(`https://${this.config.apiKey}.cognitiveservices.azure.com/speechtotext/v3.1/transcriptions`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.config.apiKey,
        'Content-Type': 'audio/wav'
      },
      body: audioBlob
    })

    const result = await response.json()
    
    return {
      text: result.DisplayText || '',
      confidence: result.Confidence || 0,
      words: result.NBest?.[0]?.Words?.map((word: any) => ({
        word: word.Word,
        startTime: word.Offset / 10000000, // Convert from 100ns to seconds
        endTime: (word.Offset + word.Duration) / 10000000,
        confidence: word.Confidence
      })) || []
    }
  }

  private async transcribeWithAWS(audioBlob: Blob): Promise<TranscriptionResult> {
    // AWS Transcribe implementation would go here
    // This requires AWS SDK setup and S3 upload for longer audio files
    throw new Error('AWS Transcribe implementation not yet available')
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }
}

// Web Speech API fallback for real-time transcription
export class WebSpeechSTT {
  private recognition: any
  private isListening = false
  private onResult?: (text: string, isFinal: boolean) => void
  private onError?: (error: string) => void

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.setupRecognition()
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'

    this.recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (this.onResult) {
        this.onResult(finalTranscript || interimTranscript, !!finalTranscript)
      }
    }

    this.recognition.onerror = (event: any) => {
      if (this.onError) {
        this.onError(event.error)
      }
    }
  }

  startListening(onResult: (text: string, isFinal: boolean) => void, onError?: (error: string) => void): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported')
      return
    }

    this.onResult = onResult
    this.onError = onError
    this.isListening = true
    this.recognition.start()
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  isSupported(): boolean {
    return !!this.recognition
  }
}