"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Volume2 } from "lucide-react"

const SENTENCES_D = [
  "Please listen carefully and repeat this sentence.",
  "Pronunciation is important for clear communication.",
  "The weather today is quite pleasant and sunny.",
  "I enjoy reading books in my free time.",
  "Success requires dedication and hard work.",
  "Learning new skills opens many opportunities.",
  "The meeting is scheduled for tomorrow at 10 AM.",
  "Can you help me with this project?",
  "Thank you for your time and attention.",
]

interface SectionDProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => Promise<Blob>
  onSaveResponse: (questionIndex: number) => void
}

export default function SectionD({ isRecording, onStartRecording, onStopRecording, onSaveResponse }: SectionDProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [recordedQuestions, setRecordedQuestions] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  const handleRecord = async () => {
    if (isRecording) {
      await onStopRecording()
      setRecordedQuestions([...recordedQuestions, currentQuestion])
      onSaveResponse(currentQuestion)
    } else {
      onStartRecording()
    }
  }

  const handlePlayAudio = () => {
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(SENTENCES_D[currentQuestion])
    utterance.rate = 0.9
    utterance.onend = () => setIsPlaying(false)
    window.speechSynthesis.speak(utterance)
  }

  const handleNext = () => {
    if (currentQuestion < SENTENCES_D.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-black mb-2">Section D: Listen and Repeat</h2>
        <p className="text-gray-600">Listen to the sentence and repeat it exactly as you hear it.</p>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-4 font-semibold">
          Sentence {currentQuestion + 1} of {SENTENCES_D.length}
        </p>
        <Button onClick={handlePlayAudio} disabled={isPlaying} className="bg-black hover:bg-gray-800 text-white mb-4">
          <Volume2 className="w-5 h-5 mr-2" />
          {isPlaying ? "Playing..." : "Play Audio"}
        </Button>
        <p className="text-gray-600 italic">Listen to the audio above and repeat the sentence</p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleRecord}
          className={`px-8 py-6 text-lg ${
            isRecording ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-800"
          } text-white`}
        >
          {isRecording ? (
            <>
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      </div>

      {recordedQuestions.includes(currentQuestion) && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-700 font-semibold">✓ Response recorded for this sentence</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
          className="border-gray-300 text-black hover:bg-gray-100 bg-white"
        >
          Previous Sentence
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentQuestion === SENTENCES_D.length - 1}
          className="bg-gray-200 hover:bg-gray-300 text-black"
        >
          Next Sentence
        </Button>
      </div>
    </div>
  )
}
