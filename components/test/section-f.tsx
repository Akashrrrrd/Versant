"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Volume2 } from "lucide-react"

const SENTENCES_F = [
  {
    incorrect: "She go to school every day.",
    correct: "She goes to school every day.",
    audio: "She go to school every day.",
  },
  {
    incorrect: "They has completed the project.",
    correct: "They have completed the project.",
    audio: "They has completed the project.",
  },
  { incorrect: "He dont like coffee.", correct: "He does not like coffee.", audio: "He dont like coffee." },
]

interface SectionFProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => Promise<Blob>
  onSaveResponse: (questionIndex: number) => void
}

export default function SectionF({ isRecording, onStartRecording, onStopRecording, onSaveResponse }: SectionFProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [recordedQuestions, setRecordedQuestions] = useState<number[]>([])
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const playAudio = async () => {
    setIsPlayingAudio(true)
    // Simulate audio playback
    const utterance = new SpeechSynthesisUtterance(SENTENCES_F[currentQuestion].audio)
    utterance.rate = 0.9
    utterance.onend = () => setIsPlayingAudio(false)
    window.speechSynthesis.speak(utterance)
  }

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
    if (currentQuestion < SENTENCES_F.length - 1) {
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
        <h2 className="text-2xl font-bold text-black mb-2">Section F: Correct the Sentence</h2>
        <p className="text-gray-600">Listen to the incorrect sentence and repeat it in the correct form.</p>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-4 font-semibold">
          Sentence {currentQuestion + 1} of {SENTENCES_F.length}
        </p>
        <div className="flex justify-center mb-4">
          <Button
            onClick={playAudio}
            disabled={isPlayingAudio}
            className="bg-black hover:bg-gray-800 text-white px-8 py-4"
          >
            <Volume2 className="w-5 h-5 mr-2" />
            {isPlayingAudio ? "Playing..." : "Play Audio"}
          </Button>
        </div>
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
          disabled={currentQuestion === SENTENCES_F.length - 1}
          className="bg-gray-200 hover:bg-gray-300 text-black"
        >
          Next Sentence
        </Button>
      </div>
    </div>
  )
}
