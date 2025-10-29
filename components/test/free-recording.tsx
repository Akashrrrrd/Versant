"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Square, Volume2, Loader2, CheckCircle2 } from "lucide-react"
import { useFreeSpeechRecognition, EnhancedFreeSpeechRecognition } from "@/lib/free-speech-recognition"

interface FreeRecordingProps {
  question: string
  expectedAnswer?: string
  timeLimit?: number // in seconds
  section?: string
  onComplete: (audioBlob: Blob, transcription: string, metrics: any) => void
  onCancel?: () => void
}

export default function FreeRecording({
  question,
  expectedAnswer,
  timeLimit = 30,
  section,
  onComplete,
  onCancel
}: FreeRecordingProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [showTranscript, setShowTranscript] = useState(true)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const enhancedRecognitionRef = useRef<EnhancedFreeSpeechRecognition | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Free speech recognition using browser API
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    isListening,
    error: sttError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useFreeSpeechRecognition({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1
  })

  useEffect(() => {
    initializeAudio()
    return cleanup
  }, [])

  useEffect(() => {
    if (isRecording && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0 && isRecording) {
      handleStopRecording()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isRecording, timeRemaining])

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      })
      
      streamRef.current = stream

      // Setup media recorder for audio capture
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Initialize enhanced speech recognition with audio analysis
      enhancedRecognitionRef.current = new EnhancedFreeSpeechRecognition({
        language: 'en-US',
        continuous: true,
        interimResults: true
      })
      
      await enhancedRecognitionRef.current.initializeAudioAnalysis()

      // Monitor audio levels
      monitorAudioLevel()
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }

  const monitorAudioLevel = () => {
    if (!streamRef.current) return

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const analyser = audioContext.createAnalyser()
    const microphone = audioContext.createMediaStreamSource(streamRef.current)
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    
    microphone.connect(analyser)
    analyser.fftSize = 256

    const updateLevel = () => {
      if (!isRecording) return

      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setAudioLevel(Math.min(100, (average / 128) * 100))
      
      requestAnimationFrame(updateLevel)
    }
    
    updateLevel()
  }

  const handleStartRecording = async () => {
    if (!mediaRecorderRef.current || !isSupported) return

    setIsRecording(true)
    setRecordingStatus('recording')
    setTimeRemaining(timeLimit)
    audioChunksRef.current = []
    resetTranscript()

    // Start audio recording
    mediaRecorderRef.current.start(100) // Record in 100ms chunks
    
    // Start speech recognition
    try {
      await startListening()
    } catch (error) {
      console.warn('Speech recognition failed to start:', error)
    }
  }

  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current) return

    setIsRecording(false)
    setRecordingStatus('processing')

    // Stop recording
    mediaRecorderRef.current.stop()
    
    // Stop speech recognition
    stopListening()

    // Get audio metrics if available
    const audioMetrics = enhancedRecognitionRef.current?.getAudioMetrics() || {
      volume: audioLevel,
      speakingTime: timeLimit - timeRemaining,
      silenceTime: timeRemaining,
      clarity: 75
    }

    // Create audio blob
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    
    // Get final transcription
    const fullTranscription = finalTranscript + (interimTranscript ? ' ' + interimTranscript : '')

    // Complete the recording
    onComplete(audioBlob, fullTranscription, {
      audioMetrics,
      duration: timeLimit - timeRemaining,
      wordCount: fullTranscription.split(' ').length,
      confidence: 0.85 // Estimated confidence
    })

    setRecordingStatus('idle')
  }

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    if (audioLevelIntervalRef.current) {
      clearTimeout(audioLevelIntervalRef.current)
    }
    enhancedRecognitionRef.current?.cleanup()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressColor = () => {
    if (timeRemaining <= 5) return 'bg-red-500'
    if (timeRemaining <= 10) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getAudioLevelColor = () => {
    if (audioLevel < 20) return 'bg-gray-400'
    if (audioLevel < 50) return 'bg-yellow-400'
    if (audioLevel < 80) return 'bg-green-400'
    return 'bg-green-600'
  }

  const currentTranscript = finalTranscript + (interimTranscript ? ' ' + interimTranscript : '')

  return (
    <div className="space-y-6">
      {/* Question Display */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <p className="text-lg font-semibold text-black mb-2">Question:</p>
          <p className="text-xl text-gray-800">{question}</p>
          {expectedAnswer && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Expected elements:</strong> {expectedAnswer}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Recording Interface */}
      <Card className="border-gray-200 bg-white">
        <CardContent className="pt-6 space-y-6">
          {/* Timer and Progress */}
          <div className="text-center">
            <div className="text-4xl font-bold text-black mb-2">
              {formatTime(timeRemaining)}
            </div>
            <Progress 
              value={(timeRemaining / timeLimit) * 100} 
              className={`h-2 ${getProgressColor()}`}
            />
          </div>

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">Audio Level</p>
              <div className="flex items-center justify-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-500" />
                <div className="flex-1 max-w-xs bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-200 ${getAudioLevelColor()}`}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500">{Math.round(audioLevel)}%</span>
              </div>
            </div>
          )}

          {/* Speech Recognition Status */}
          {isSupported ? (
            <div className="flex items-center justify-center space-x-2 text-sm">
              {isListening ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-600">Speech recognition active</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="text-gray-600">Speech recognition ready</span>
                </>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-center">
              <p className="text-yellow-800 text-sm">
                Speech recognition not supported in this browser. Audio will still be recorded.
              </p>
            </div>
          )}

          {/* Real-time Transcription */}
          {showTranscript && currentTranscript && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 font-semibold">Live Transcription:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-xs"
                >
                  Hide
                </Button>
              </div>
              <p className="text-gray-800 min-h-[2rem]">
                <span className="text-black">{finalTranscript}</span>
                <span className="text-gray-500 italic">{interimTranscript}</span>
              </p>
              <div className="mt-2 text-xs text-gray-500">
                Words: {currentTranscript.split(' ').filter(w => w.length > 0).length}
              </div>
            </div>
          )}

          {!showTranscript && currentTranscript && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTranscript(true)}
                className="text-sm text-gray-600"
              >
                Show Transcription ({currentTranscript.split(' ').filter(w => w.length > 0).length} words)
              </Button>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex justify-center space-x-4">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                disabled={recordingStatus === 'processing'}
                className="px-8 py-6 text-lg bg-green-600 hover:bg-green-700 text-white"
              >
                {recordingStatus === 'processing' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                className="px-8 py-6 text-lg bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}

            {onCancel && (
              <Button
                onClick={onCancel}
                variant="outline"
                disabled={isRecording}
                className="px-6 py-6 text-lg border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {sttError && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> {sttError}
              </p>
            </div>
          )}

          {recordingStatus === 'recording' && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
              <p className="text-green-800 font-semibold">🔴 Recording in progress...</p>
              <p className="text-green-600 text-sm">Speak clearly and at a normal pace</p>
            </div>
          )}

          {recordingStatus === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <p className="text-blue-800 font-semibold">Processing your response...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-gray-200 bg-blue-50">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Recording Tips:</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Speak clearly and at a normal pace</li>
            <li>• Ensure you're in a quiet environment</li>
            <li>• Keep your microphone at a consistent distance</li>
            <li>• Watch the audio level indicator to ensure proper volume</li>
            {isSupported && <li>• Your speech is being transcribed in real-time for feedback</li>}
            <li>• The system analyzes your grammar, vocabulary, and fluency automatically</li>
          </ul>
        </CardContent>
      </Card>

      {/* Browser Compatibility Note */}
      {!isSupported && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Audio Recording Available</h3>
                <p className="text-orange-800 text-sm">
                  Your browser supports audio recording. For the best experience with real-time transcription, 
                  try using Chrome, Edge, or Safari.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}