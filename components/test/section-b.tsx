"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

const CONVERSATIONS_B = [
  {
    scenario: 'Interviewer: "Tell me about a challenge you faced at work."',
    response: "Respond appropriately to this question.",
  },
  { scenario: 'Interviewer: "How do you handle stress?"', response: "Provide your response." },
  { scenario: 'Interviewer: "What are your strengths?"', response: "Describe your strengths." },
  { scenario: 'Interviewer: "Where do you see yourself in 5 years?"', response: "Share your vision." },
  { scenario: 'Interviewer: "Do you have any questions for us?"', response: "Ask a relevant question." },
]

interface SectionBProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => Promise<Blob>
  onSaveResponse: (questionIndex: number) => void
}

export default function SectionB({ isRecording, onStartRecording, onStopRecording, onSaveResponse }: SectionBProps) {
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
    if (currentQuestion < CONVERSATIONS_B.length - 1) {
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
        <h2 className="text-2xl font-bold text-black mb-2">Section B: Conversation</h2>
        <p className="text-gray-600">Listen to the interviewer and respond appropriately.</p>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-2 font-semibold">
          Question {currentQuestion + 1} of {CONVERSATIONS_B.length}
        </p>
        <p className="text-lg text-black font-semibold mb-4">{CONVERSATIONS_B[currentQuestion].scenario}</p>
        <p className="text-gray-600 italic">{CONVERSATIONS_B[currentQuestion].response}</p>
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
          <p className="text-green-700 font-semibold">✓ Response recorded for this question</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          variant="outline"
          className="border-gray-300 text-black hover:bg-gray-100 bg-white"
        >
          Previous Question
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentQuestion === CONVERSATIONS_B.length - 1}
          className="bg-gray-200 hover:bg-gray-300 text-black"
        >
          Next Question
        </Button>
      </div>
    </div>
  )
}
