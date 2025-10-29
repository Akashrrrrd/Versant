// Free speech recognition using browser Web Speech API
export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  alternatives?: string[]
}

export interface SpeechRecognitionConfig {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

export class FreeSpeechRecognition {
  private recognition: any
  private isListening = false
  private config: SpeechRecognitionConfig
  private finalTranscript = ''
  private interimTranscript = ''

  constructor(config: SpeechRecognitionConfig = {}) {
    this.config = {
      language: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 3,
      ...config
    }
    
    this.initializeRecognition()
  }

  private initializeRecognition(): void {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser')
      return
    }

    this.recognition = new SpeechRecognition()
    this.setupRecognition()
  }

  private setupRecognition(): void {
    if (!this.recognition) return

    // Configure recognition
    this.recognition.continuous = this.config.continuous
    this.recognition.interimResults = this.config.interimResults
    this.recognition.lang = this.config.language
    this.recognition.maxAlternatives = this.config.maxAlternatives

    // Event handlers
    this.recognition.onstart = () => {
      this.isListening = true
      this.config.onStart?.()
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.config.onEnd?.()
    }

    this.recognition.onerror = (event: any) => {
      const errorMessage = this.getErrorMessage(event.error)
      this.config.onError?.(errorMessage)
    }

    this.recognition.onresult = (event: any) => {
      this.processResults(event.results)
    }
  }

  private processResults(results: any): void {
    let interimTranscript = ''
    let finalTranscript = ''

    for (let i = 0; i < results.length; i++) {
      const result = results[i]
      const transcript = result[0].transcript
      const confidence = result[0].confidence

      if (result.isFinal) {
        finalTranscript += transcript
        this.finalTranscript += transcript
      } else {
        interimTranscript += transcript
      }

      // Get alternatives if available
      const alternatives: string[] = []
      for (let j = 1; j < Math.min(result.length, this.config.maxAlternatives || 1); j++) {
        alternatives.push(result[j].transcript)
      }

      // Call result callback
      this.config.onResult?.({
        transcript: result.isFinal ? finalTranscript : interimTranscript,
        confidence: confidence || 0.8, // Default confidence if not provided
        isFinal: result.isFinal,
        alternatives
      })
    }

    this.interimTranscript = interimTranscript
  }

  private getErrorMessage(error: string): string {
    const errorMessages: { [key: string]: string } = {
      'no-speech': 'No speech detected. Please try speaking again.',
      'audio-capture': 'Audio capture failed. Please check your microphone.',
      'not-allowed': 'Microphone access denied. Please allow microphone access.',
      'network': 'Network error occurred. Please check your connection.',
      'service-not-allowed': 'Speech recognition service not allowed.',
      'bad-grammar': 'Grammar error in speech recognition.',
      'language-not-supported': 'Language not supported.'
    }

    return errorMessages[error] || `Speech recognition error: ${error}`
  }

  startListening(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'))
        return
      }

      if (this.isListening) {
        resolve()
        return
      }

      try {
        this.finalTranscript = ''
        this.interimTranscript = ''
        this.recognition.start()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  abort(): void {
    if (this.recognition && this.isListening) {
      this.recognition.abort()
    }
  }

  getFinalTranscript(): string {
    return this.finalTranscript
  }

  getInterimTranscript(): string {
    return this.interimTranscript
  }

  getFullTranscript(): string {
    return this.finalTranscript + (this.interimTranscript ? ' ' + this.interimTranscript : '')
  }

  isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  }

  isCurrentlyListening(): boolean {
    return this.isListening
  }

  // Static method to check browser support
  static isSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  }
}

// React hook for easy integration
export function useFreeSpeechRecognition(config: SpeechRecognitionConfig = {}) {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  
  const recognitionRef = useRef<FreeSpeechRecognition | null>(null)

  useEffect(() => {
    const recognition = new FreeSpeechRecognition({
      ...config,
      onResult: (result) => {
        if (result.isFinal) {
          setTranscript(prev => prev + result.transcript)
          setInterimTranscript('')
        } else {
          setInterimTranscript(result.transcript)
        }
        config.onResult?.(result)
      },
      onError: (error) => {
        setError(error)
        setIsListening(false)
        config.onError?.(error)
      },
      onStart: () => {
        setIsListening(true)
        setError(null)
        config.onStart?.()
      },
      onEnd: () => {
        setIsListening(false)
        config.onEnd?.()
      }
    })

    recognitionRef.current = recognition
    setIsSupported(recognition.isSupported())

    return () => {
      recognition.stopListening()
    }
  }, [])

  const startListening = async () => {
    if (recognitionRef.current) {
      try {
        await recognitionRef.current.startListening()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start listening')
      }
    }
  }

  const stopListening = () => {
    recognitionRef.current?.stopListening()
  }

  const resetTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
  }

  return {
    transcript,
    interimTranscript,
    finalTranscript: transcript,
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  }
}

// Enhanced speech recognition with audio analysis
export class EnhancedFreeSpeechRecognition extends FreeSpeechRecognition {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private microphone: MediaStreamAudioSourceNode | null = null
  private dataArray: Uint8Array | null = null
  private stream: MediaStream | null = null
  
  private audioMetrics = {
    volume: 0,
    frequency: 0,
    clarity: 0,
    speakingTime: 0,
    silenceTime: 0
  }

  async initializeAudioAnalysis(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.analyser = this.audioContext.createAnalyser()
      this.microphone = this.audioContext.createMediaStreamSource(this.stream)
      
      this.microphone.connect(this.analyser)
      this.analyser.fftSize = 2048
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
      
      this.startAudioAnalysis()
    } catch (error) {
      console.error('Failed to initialize audio analysis:', error)
    }
  }

  private startAudioAnalysis(): void {
    if (!this.analyser || !this.dataArray) return

    const analyze = () => {
      if (!this.isCurrentlyListening()) return

      this.analyser!.getByteFrequencyData(this.dataArray!)
      
      // Calculate volume (RMS)
      const sum = this.dataArray!.reduce((acc, val) => acc + val * val, 0)
      this.audioMetrics.volume = Math.sqrt(sum / this.dataArray!.length)
      
      // Calculate dominant frequency
      let maxIndex = 0
      let maxValue = 0
      for (let i = 0; i < this.dataArray!.length; i++) {
        if (this.dataArray![i] > maxValue) {
          maxValue = this.dataArray![i]
          maxIndex = i
        }
      }
      this.audioMetrics.frequency = (maxIndex / this.dataArray!.length) * (this.audioContext!.sampleRate / 2)
      
      // Update speaking/silence time
      if (this.audioMetrics.volume > 30) {
        this.audioMetrics.speakingTime += 0.1
      } else {
        this.audioMetrics.silenceTime += 0.1
      }
      
      // Calculate clarity based on frequency distribution
      this.audioMetrics.clarity = this.calculateClarity()
      
      requestAnimationFrame(analyze)
    }
    
    analyze()
  }

  private calculateClarity(): number {
    if (!this.dataArray) return 0
    
    // Clarity based on frequency distribution and consistency
    const highFreqEnergy = this.dataArray.slice(100, 300).reduce((sum, val) => sum + val, 0)
    const totalEnergy = this.dataArray.reduce((sum, val) => sum + val, 0)
    
    return totalEnergy > 0 ? (highFreqEnergy / totalEnergy) * 100 : 0
  }

  getAudioMetrics() {
    return { ...this.audioMetrics }
  }

  cleanup(): void {
    this.stopListening()
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
    }
    
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}

// Import statement fix for React
import { useState, useEffect, useRef } from 'react'