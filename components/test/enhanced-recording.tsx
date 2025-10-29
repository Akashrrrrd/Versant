"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Mic, Square, Volume2, Loader2 } from "lucide-react"
import { useRealTimeSTT } from "@/lib/real-time-stt"
import { AudioAnalyzer } from "@/lib/speech-analysis"

interface EnhancedRecordingProps {
  question: string
  expectedAnswer?: string
  timeLimit?: number // in seconds
  onComplete: (audioBlob: Blob, transcription: string, metrics: any) => void
  onCancel?: () => void
}

export default function EnhancedRecording({
  question,
  expectedAnswer,
  timeLimit = 30,
  onComplete,
  onCancel
}: EnhancedRecordingProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'processing'>('idle')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Real-time speech-to-text
  const {
    isListening,
    interimText,
    finalText,
    error: sttError,
    startListening,
    stopListening,
    clearText
  } = useRealTimeSTT({
    provider: 'google', // or 'azure', 'aws'
    realTimeProvider: 'webspeech', // fallback to WebSpeech API
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_STT_API_KEY || '',
    language: 'en-US',
    enableWordTimings: true,
    enableProfanityFilter: false
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

      // Initialize audio analyzer
      audioAnalyzerRef.current = new AudioAnalyzer()
      await audioAnalyzerRef.current.initialize(stream)

      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      // Monitor audio levels
      monitorAudioLevel()
    } catch (error) {
      console.error('Failed to initialize audio:', error)
    }
  }

  const monitorAudioLevel = () => {
    if (!audioAnalyzerRef.current) return

    const updateLevel = () => {
      // This would be implemented in the AudioAnalyzer class
      // For now, simulate audio level
      if (isRecording) {
        setAudioLevel(Math.random() * 100)
      }
      
      if (isRecording) {
        requestAnimationFrame(updateLevel)
      }
    }
    
    updateLevel()
  }

  const handleStartRecording = async () => {
    if (!mediaRecorderRef.current || !audioAnalyzerRef.current) return

    setIsRecording(true)
    setRecordingStatus('recording')
    setTimeRemaining(timeLimit)
    audioChunksRef.current = []
    clearText()

    // Start recording
    mediaRecorderRef.current.start(100) // Record in 100ms chunks
    
    // Start audio analysis
    audioAnalyzerRef.current.startAnalysis()
    
    // Start real-time transcription
    await startListening()
  }

  const handleStopRecording = async () => {
    if (!mediaRecorderRef.current || !audioAnalyzerRef.current) return

    setIsRecording(false)
    setRecordingStatus('processing')

    // Stop recording
    mediaRecorderRef.current.stop()
    
    // Stop audio analysis
    const audioMetrics = audioAnalyzerRef.current.stopAnalysis()
    
    // Stop transcription
    stopListening()

    // Create audio blob
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    
    // Get final transcription (combine final + interim text)
    const fullTranscription = finalText + (interimText ? ' ' + interimText : '')

    // Complete the recording
    onComplete(audioBlob, fullTranscription, {
      audioMetrics,
      duration: timeLimit - timeRemaining,
      audioLevel: audioLevel
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
                <Progress value={audioLevel} className="h-2 flex-1 max-w-xs" />
                <span className="text-sm text-gray-500">{Math.round(audioLevel)}%</span>
              </div>
            </div>
          )}

          {/* Real-time Transcription */}
          {(finalText || interimText) && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-2">Live Transcription:</p>
              <p className="text-gray-800">
                <span className="text-black">{finalText}</span>
                <span className="text-gray-500 italic">{interimText}</span>
              </p>
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
                <strong>Transcription Note:</strong> {sttError}
              </p>
            </div>
          )}

          {recordingStatus === 'recording' && (
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
              <p className="text-green-800 font-semibold">🔴 Recording in progress...</p>
              <p className="text-green-600 text-sm">Speak clearly and at a normal pace</p>
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
            <li>• You can see your speech being transcribed in real-time</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}