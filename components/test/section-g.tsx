"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Square } from "lucide-react"

const TOPICS_G = ["Importance of Sports in day-to-day life"]

interface SectionGProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => Promise<Blob>
  onSaveResponse: (questionIndex: number) => void
}

export default function SectionG({ isRecording, onStartRecording, onStopRecording, onSaveResponse }: SectionGProps) {
  const [currentTopic] = useState(0)
  const [prepTime, setPrepTime] = useState(30)
  const [talkTime, setTalkTime] = useState(45)
  const [phase, setPhase] = useState<"prep" | "talk" | "completed">("prep")
  const [hasRecorded, setHasRecorded] = useState(false)

  useEffect(() => {
    if (phase === "prep" && prepTime > 0) {
      const timer = setTimeout(() => setPrepTime(prepTime - 1), 1000)
      return () => clearTimeout(timer)
    } else if (phase === "prep" && prepTime === 0) {
      setPhase("talk")
      onStartRecording()
    }
  }, [prepTime, phase, onStartRecording])

  useEffect(() => {
    if (phase === "talk" && talkTime > 0) {
      const timer = setTimeout(() => setTalkTime(talkTime - 1), 1000)
      return () => clearTimeout(timer)
    } else if (phase === "talk" && talkTime === 0) {
      onStopRecording()
      setPhase("completed")
      setHasRecorded(true)
      onSaveResponse(currentTopic)
    }
  }, [talkTime, phase, onStopRecording, currentTopic, onSaveResponse])

  const handleManualStop = async () => {
    await onStopRecording()
    setPhase("completed")
    setHasRecorded(true)
    onSaveResponse(currentTopic)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-2">Section G: Free Speech</h2>
        <p className="text-gray-600">Prepare for 30 seconds, then speak for 45 seconds on the given topic.</p>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
        <p className="text-lg text-black font-semibold mb-4">Topic:</p>
        <p className="text-2xl text-black font-bold">{TOPICS_G[currentTopic]}</p>
      </div>

      <div className="bg-gray-100 p-8 rounded-lg text-center border border-gray-200">
        {phase === "prep" && (
          <div>
            <p className="text-gray-700 mb-4 font-semibold">Preparation Time</p>
            <p className="text-6xl font-bold text-black">{prepTime}</p>
            <p className="text-gray-600 mt-4">Think about what you want to say...</p>
          </div>
        )}
        {phase === "talk" && (
          <div>
            <p className="text-gray-700 mb-4 font-semibold">Speaking Time</p>
            <p className="text-6xl font-bold text-black">{talkTime}</p>
            <p className="text-gray-600 mt-4">Recording in progress...</p>
          </div>
        )}
        {phase === "completed" && (
          <div>
            <p className="text-gray-700 mb-4 font-semibold">Recording Complete</p>
            <p className="text-2xl text-black font-bold">✓ Your response has been recorded</p>
          </div>
        )}
      </div>

      {phase === "talk" && (
        <div className="flex justify-center">
          <Button onClick={handleManualStop} className="px-8 py-6 text-lg bg-red-600 hover:bg-red-700 text-white">
            <Square className="w-5 h-5 mr-2" />
            Stop Recording
          </Button>
        </div>
      )}

      {hasRecorded && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-700 font-semibold">✓ Your free speech response has been recorded and saved</p>
        </div>
      )}
    </div>
  )
}
