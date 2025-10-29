// Real-time Speech-to-Text with multiple provider support
import { SpeechToTextService, WebSpeechSTT, type STTConfig, type TranscriptionResult } from './speech-to-text'

export interface RealTimeSTTConfig extends STTConfig {
  realTimeProvider: 'webspeech' | 'google-streaming' | 'azure-streaming'
  onInterimResult?: (text: string) => void
  onFinalResult?: (text: string) => void
  onError?: (error: string) => void
}

export class RealTimeSpeechToText {
  private config: RealTimeSTTConfig
  private webSpeechSTT?: WebSpeechSTT
  private isListening = false
  private mediaRecorder?: MediaRecorder
  private audioChunks: Blob[] = []
  private streamingConnection?: WebSocket

  constructor(config: RealTimeSTTConfig) {
    this.config = config
    this.initializeProvider()
  }

  private initializeProvider(): void {
    switch (this.config.realTimeProvider) {
      case 'webspeech':
        this.webSpeechSTT = new WebSpeechSTT()
        break
      case 'google-streaming':
        this.initializeGoogleStreaming()
        break
      case 'azure-streaming':
        this.initializeAzureStreaming()
        break
    }
  }

  async startListening(): Promise<void> {
    if (this.isListening) return

    this.isListening = true

    switch (this.config.realTimeProvider) {
      case 'webspeech':
        this.startWebSpeechListening()
        break
      case 'google-streaming':
        await this.startGoogleStreaming()
        break
      case 'azure-streaming':
        await this.startAzureStreaming()
        break
    }
  }

  stopListening(): void {
    if (!this.isListening) return

    this.isListening = false

    switch (this.config.realTimeProvider) {
      case 'webspeech':
        this.webSpeechSTT?.stopListening()
        break
      case 'google-streaming':
        this.stopGoogleStreaming()
        break
      case 'azure-streaming':
        this.stopAzureStreaming()
        break
    }
  }

  private startWebSpeechListening(): void {
    if (!this.webSpeechSTT?.isSupported()) {
      this.config.onError?.('Web Speech API not supported')
      return
    }

    this.webSpeechSTT.startListening(
      (text: string, isFinal: boolean) => {
        if (isFinal) {
          this.config.onFinalResult?.(text)
        } else {
          this.config.onInterimResult?.(text)
        }
      },
      (error: string) => {
        this.config.onError?.(error)
      }
    )
  }

  private initializeGoogleStreaming(): void {
    // Google Cloud Speech-to-Text Streaming API setup
    // This requires a WebSocket connection to Google's streaming endpoint
  }

  private async startGoogleStreaming(): Promise<void> {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup WebSocket connection to Google Cloud Speech
      const wsUrl = `wss://speech.googleapis.com/v1/speech:streamingrecognize?key=${this.config.apiKey}`
      this.streamingConnection = new WebSocket(wsUrl)

      this.streamingConnection.onopen = () => {
        // Send initial configuration
        const config = {
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: this.config.language,
            enableAutomaticPunctuation: true,
            interimResults: true
          }
        }
        this.streamingConnection?.send(JSON.stringify(config))
      }

      this.streamingConnection.onmessage = (event) => {
        const response = JSON.parse(event.data)
        if (response.results) {
          const result = response.results[0]
          const transcript = result.alternatives[0].transcript
          
          if (result.isFinal) {
            this.config.onFinalResult?.(transcript)
          } else {
            this.config.onInterimResult?.(transcript)
          }
        }
      }

      this.streamingConnection.onerror = (error) => {
        this.config.onError?.('Google Streaming error: ' + error)
      }

      // Setup audio streaming
      this.setupAudioStreaming(stream)
    } catch (error) {
      this.config.onError?.('Failed to start Google streaming: ' + error)
    }
  }

  private setupAudioStreaming(stream: MediaStream): void {
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && this.streamingConnection?.readyState === WebSocket.OPEN) {
        // Convert blob to base64 and send to streaming API
        const reader = new FileReader()
        reader.onload = () => {
          const base64Audio = (reader.result as string).split(',')[1]
          this.streamingConnection?.send(JSON.stringify({
            audioContent: base64Audio
          }))
        }
        reader.readAsDataURL(event.data)
      }
    }

    // Send audio chunks every 250ms
    this.mediaRecorder.start(250)
  }

  private stopGoogleStreaming(): void {
    this.mediaRecorder?.stop()
    this.streamingConnection?.close()
  }

  private initializeAzureStreaming(): void {
    // Azure Speech Service streaming setup
  }

  private async startAzureStreaming(): Promise<void> {
    try {
      // Azure Cognitive Services Speech SDK would be used here
      // This is a simplified WebSocket implementation
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const region = 'eastus' // Your Azure region
      const wsUrl = `wss://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`
      
      this.streamingConnection = new WebSocket(wsUrl, [], {
        headers: {
          'Ocp-Apim-Subscription-Key': this.config.apiKey,
          'X-ConnectionId': this.generateConnectionId()
        }
      } as any)

      this.streamingConnection.onopen = () => {
        // Send configuration message
        const configMessage = {
          context: {
            system: {
              version: '1.0.0'
            },
            os: {
              platform: 'Browser',
              name: 'Browser',
              version: '1.0.0'
            },
            device: {
              manufacturer: 'Browser',
              model: 'Browser',
              version: '1.0.0'
            }
          }
        }
        this.streamingConnection?.send(JSON.stringify(configMessage))
      }

      this.streamingConnection.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data)
          if (response.RecognitionStatus === 'Success') {
            const transcript = response.DisplayText
            this.config.onFinalResult?.(transcript)
          } else if (response.RecognitionStatus === 'Intermediate') {
            this.config.onInterimResult?.(response.DisplayText)
          }
        } catch (error) {
          console.error('Azure streaming response error:', error)
        }
      }

      this.streamingConnection.onerror = (error) => {
        this.config.onError?.('Azure streaming error: ' + error)
      }

      this.setupAudioStreaming(stream)
    } catch (error) {
      this.config.onError?.('Failed to start Azure streaming: ' + error)
    }
  }

  private stopAzureStreaming(): void {
    this.mediaRecorder?.stop()
    this.streamingConnection?.close()
  }

  private generateConnectionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  isSupported(): boolean {
    switch (this.config.realTimeProvider) {
      case 'webspeech':
        return this.webSpeechSTT?.isSupported() || false
      case 'google-streaming':
      case 'azure-streaming':
        return 'WebSocket' in window && 'MediaRecorder' in window
      default:
        return false
    }
  }
}

// Usage example component
export function useRealTimeSTT(config: RealTimeSTTConfig) {
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText] = useState('')
  const [finalText, setFinalText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sttRef = useRef<RealTimeSpeechToText | null>(null)

  useEffect(() => {
    sttRef.current = new RealTimeSpeechToText({
      ...config,
      onInterimResult: (text) => {
        setInterimText(text)
        config.onInterimResult?.(text)
      },
      onFinalResult: (text) => {
        setFinalText(prev => prev + ' ' + text)
        setInterimText('')
        config.onFinalResult?.(text)
      },
      onError: (error) => {
        setError(error)
        setIsListening(false)
        config.onError?.(error)
      }
    })

    return () => {
      sttRef.current?.stopListening()
    }
  }, [])

  const startListening = async () => {
    if (sttRef.current?.isSupported()) {
      setError(null)
      setIsListening(true)
      await sttRef.current.startListening()
    } else {
      setError('Speech recognition not supported')
    }
  }

  const stopListening = () => {
    sttRef.current?.stopListening()
    setIsListening(false)
  }

  const clearText = () => {
    setFinalText('')
    setInterimText('')
  }

  return {
    isListening,
    interimText,
    finalText,
    error,
    startListening,
    stopListening,
    clearText,
    isSupported: sttRef.current?.isSupported() || false
  }
}