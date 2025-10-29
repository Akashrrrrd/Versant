"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, Volume2 } from "lucide-react"

export default function TestSetup() {
  const router = useRouter()
  const [cameraStatus, setCameraStatus] = useState<"checking" | "ready" | "error">("checking")
  const [micStatus, setMicStatus] = useState<"checking" | "ready" | "error">("checking")
  const [voiceDetected, setVoiceDetected] = useState(false)
  const [testingVoice, setTestingVoice] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    checkDevices()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const checkDevices = async () => {
    try {
      // Check camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraStatus("ready")
      stream.getTracks().forEach((track) => track.stop())

      // Check microphone
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = audioStream

      // Setup audio analysis for voice detection
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext

      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(audioStream)
      source.connect(analyser)
      analyserRef.current = analyser

      setMicStatus("ready")
      detectVoice()
    } catch (error) {
      console.error("Device check error:", error)
      if ((error as any).name === "NotAllowedError") {
        setCameraStatus("error")
        setMicStatus("error")
      } else if ((error as any).name === "NotFoundError") {
        setCameraStatus("error")
      }
    }
  }

  const detectVoice = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    const average = dataArray.reduce((a, b) => a + b) / dataArray.length
    setVoiceDetected(average > 30)

    animationFrameRef.current = requestAnimationFrame(detectVoice)
  }

  const handleTestVoice = async () => {
    setTestingVoice(true)
    // Simulate voice testing for 3 seconds
    setTimeout(() => {
      setTestingVoice(false)
    }, 3000)
  }

  const handleStartTest = () => {
    if (cameraStatus === "ready" && micStatus === "ready") {
      // Stop the preview stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      router.push("/test/communication")
    }
  }

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Test Setup</h1>
          <p className="text-gray-600">Verify your camera and microphone before starting</p>
        </div>

        <div className="space-y-6">
          {/* Camera Check */}
          <Card className="border-gray-200 bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                {cameraStatus === "checking" && <Loader2 className="w-5 h-5 animate-spin text-gray-600" />}
                {cameraStatus === "ready" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {cameraStatus === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
                Camera Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cameraStatus === "checking" && <p className="text-gray-600">Checking camera access...</p>}
              {cameraStatus === "ready" && (
                <div>
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black mb-4" />
                  <p className="text-green-600 font-semibold">✓ Camera is ready</p>
                </div>
              )}
              {cameraStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Camera access denied. Please allow camera access in your browser settings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Microphone Check */}
          <Card className="border-gray-200 bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                {micStatus === "checking" && <Loader2 className="w-5 h-5 animate-spin text-gray-600" />}
                {micStatus === "ready" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {micStatus === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}
                Microphone Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              {micStatus === "checking" && <p className="text-gray-600">Checking microphone access...</p>}
              {micStatus === "ready" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 mb-3 font-semibold">Voice Detection Test:</p>
                    <p className="text-gray-600 mb-2">Speak something to test your microphone:</p>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full transition-colors ${
                          voiceDetected ? "bg-green-600" : "bg-gray-300"
                        }`}
                      />
                      <span className="text-gray-700">
                        {voiceDetected ? "Voice detected ✓" : "Waiting for voice..."}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={handleTestVoice}
                    disabled={testingVoice}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {testingVoice ? "Testing..." : "Test Voice Detection"}
                  </Button>
                  <p className="text-green-600 font-semibold">✓ Microphone is ready</p>
                </div>
              )}
              {micStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Microphone access denied. Please allow microphone access in your browser settings.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="border-gray-200 bg-gray-50 shadow-md">
            <CardHeader>
              <CardTitle className="text-black">Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 space-y-2">
              <p>• The test consists of 7 sections with different question types</p>
              <p>• You will have 30 seconds to prepare for the free speech section</p>
              <p>• All your responses will be recorded and analyzed</p>
              <p>• Make sure you're in a quiet environment</p>
              <p>• Keep your camera and microphone on throughout the test</p>
              <p>
                • Your performance will be scored on: Fluency, Pronunciation, Grammar, Vocabulary, and Comprehension
              </p>
            </CardContent>
          </Card>

          {/* Start Button */}
          <Button
            onClick={handleStartTest}
            disabled={cameraStatus !== "ready" || micStatus !== "ready"}
            className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {cameraStatus !== "ready" || micStatus !== "ready" ? "Waiting for devices..." : "Start Test"}
          </Button>
        </div>
      </div>
    </main>
  )
}
