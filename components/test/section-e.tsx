"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Volume2 } from "lucide-react"

const SENTENCES_E = [
  {
    sentence: "She _____ to the office every day by bus.",
    answer: "goes",
    audio: "She goes to the office every day by bus.",
  },
  {
    sentence: "They _____ finished their project last week.",
    answer: "have",
    audio: "They have finished their project last week.",
  },
  { sentence: "I _____ like to visit Paris someday.", answer: "would", audio: "I would like to visit Paris someday." },
  {
    sentence: "The _____ is very beautiful in spring.",
    answer: "weather",
    audio: "The weather is very beautiful in spring.",
  },
  {
    sentence: "He _____ working on this task for hours.",
    answer: "has been",
    audio: "He has been working on this task for hours.",
  },
  {
    sentence: "We _____ meet tomorrow at the conference.",
    answer: "will",
    audio: "We will meet tomorrow at the conference.",
  },
  {
    sentence: "The _____ of the presentation was excellent.",
    answer: "quality",
    audio: "The quality of the presentation was excellent.",
  },
  {
    sentence: "She _____ her keys in the office yesterday.",
    answer: "left",
    audio: "She left her keys in the office yesterday.",
  },
]

interface SectionEProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => Promise<Blob>
  onSaveResponse: (questionIndex: number) => void
}

export default function SectionE({ isRecording, onStartRecording, onStopRecording, onSaveResponse }: SectionEProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [recordedQuestions, setRecordedQuestions] = useState<number[]>([])
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const playAudio = async () => {
    setIsPlayingAudio(true)
    // Simulate audio playback
    const utterance = new SpeechSynthesisUtterance(SENTENCES_E[currentQuestion].audio)
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
    if (currentQuestion < SENTENCES_E.length - 1) {
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
        <h2 className="text-2xl font-bold text-black mb-2">Section E: Fill the Blanks</h2>
        <p className="text-gray-600">
          Listen to the sentence with a missing word, then repeat it with the correct word filled in.
        </p>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
        <p className="text-gray-700 mb-4 font-semibold">
          Sentence {currentQuestion + 1} of {SENTENCES_E.length}
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
          disabled={currentQuestion === SENTENCES_E.length - 1}
          className="bg-gray-200 hover:bg-gray-300 text-black"
        >
          Next Sentence
        </Button>
      </div>
    </div>
  )
}
