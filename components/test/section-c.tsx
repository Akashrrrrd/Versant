"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

const SENTENCES_C = [
  "The quick brown fox jumps over the lazy dog.",
  "Communication is the key to success in any organization.",
  "Practice makes perfect when learning a new language.",
  "Time management is essential for productivity.",
  "Teamwork makes the dream work.",
  "Innovation drives progress in technology.",
  "Continuous learning is vital for career growth.",
  "Effective listening is as important as speaking.",
  "Confidence comes from preparation and practice.",
  "Networking opens doors to new opportunities.",
  "Adaptability is crucial in a changing world.",
  "Feedback helps us improve and grow professionally.",
]

interface SectionCProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => Promise<Blob>
  onSaveResponse: (questionIndex: number) => void
}

export default function SectionC({ isRecording, onStartRecording, onStopRecording, onSaveResponse }: SectionCProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [recordedQuestions, setRecordedQuestions] = useState<number[]>([])

  const handleRecord = async () => {
    if (isRecording) {
      await onStopRecording()
      setRecordedQuestions([...recordedQuestions, currentQuestion])
      onSaveResponse(currentQuestion)
    } else {
      onStartRecording()
    }
  }

  const handleNext = () => {
    if (currentQuestion < SENTENCES_C.length - 1) {
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
        <h2 className="text-2xl font-bold text-black mb-2">Section C: Read and Speak</h2>
        <p className="text-gray-600">Read the sentence displayed and record yourself speaking it clearly.</p>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-2 font-semibold">
          Sentence {currentQuestion + 1} of {SENTENCES_C.length}
        </p>
        <p className="text-xl text-black font-semibold">{SENTENCES_C[currentQuestion]}</p>
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
          disabled={currentQuestion === SENTENCES_C.length - 1}
          className="bg-gray-200 hover:bg-gray-300 text-black"
        >
          Next Sentence
        </Button>
      </div>
    </div>
  )
}
