"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, RefreshCw } from "lucide-react"
import { getRandomQuestionSet, SECTION_A_QUESTIONS, type QuestionSet } from "@/lib/question-bank"
import FreeRecording from "./free-recording"

interface SectionAProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => Promise<Blob>
  onSaveResponse: (questionIndex: number) => void
}

export default function SectionA({ isRecording, onStartRecording, onStopRecording, onSaveResponse }: SectionAProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [recordedQuestions, setRecordedQuestions] = useState<number[]>([])
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null)
  const [useEnhancedRecording, setUseEnhancedRecording] = useState(false)

  useEffect(() => {
    // Load a random question set on component mount
    const randomSet = getRandomQuestionSet(SECTION_A_QUESTIONS)
    setQuestionSet(randomSet)
  }, [])

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
    if (questionSet && currentQuestion < questionSet.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleNewQuestionSet = () => {
    const newSet = getRandomQuestionSet(SECTION_A_QUESTIONS)
    setQuestionSet(newSet)
    setCurrentQuestion(0)
    setRecordedQuestions([])
  }

  const handleEnhancedRecordingComplete = (audioBlob: Blob, transcription: string, metrics: any) => {
    // Handle the enhanced recording completion
    setRecordedQuestions([...recordedQuestions, currentQuestion])
    onSaveResponse(currentQuestion)
    
    // Store the transcription and metrics for scoring
    const questionData = {
      questionIndex: currentQuestion,
      audioBlob,
      transcription,
      metrics,
      questionText: questionSet?.questions[currentQuestion]?.text,
      expectedAnswer: questionSet?.questions[currentQuestion]?.expectedAnswer
    }
    
    // You can store this data for later scoring
    console.log('Enhanced recording completed:', questionData)
  }

  if (!questionSet) {
    return <div className="text-center">Loading questions...</div>
  }

  const currentQuestionData = questionSet.questions[currentQuestion]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-black mb-2">Section A: Short Questions</h2>
          <p className="text-gray-600">Answer each question in a single sentence. You have 30 seconds per question.</p>
          <p className="text-sm text-blue-600 mt-1">
            <strong>Question Set:</strong> {questionSet.name} - {questionSet.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleNewQuestionSet}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            New Questions
          </Button>
          <Button
            onClick={() => setUseEnhancedRecording(!useEnhancedRecording)}
            variant="outline"
            size="sm"
            className={useEnhancedRecording ? "bg-green-50 border-green-300 text-green-700" : "border-gray-300"}
          >
            {useEnhancedRecording ? "Enhanced Mode" : "Basic Mode"}
          </Button>
        </div>
      </div>

      {useEnhancedRecording ? (
        <FreeRecording
          question={currentQuestionData.text}
          expectedAnswer={currentQuestionData.expectedAnswer}
          timeLimit={currentQuestionData.timeLimit || 30}
          section="A"
          onComplete={handleEnhancedRecordingComplete}
        />
      ) : (
        <>
          <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-700 font-semibold">
                Question {currentQuestion + 1} of {questionSet.questions.length}
              </p>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                currentQuestionData.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                currentQuestionData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentQuestionData.difficulty}
              </span>
            </div>
            <p className="text-xl text-black font-semibold mb-2">{currentQuestionData.text}</p>
            {currentQuestionData.expectedAnswer && (
              <p className="text-sm text-gray-600">
                <strong>Expected elements:</strong> {currentQuestionData.expectedAnswer}
              </p>
            )}
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
              disabled={currentQuestion === questionSet.questions.length - 1}
              className="bg-gray-200 hover:bg-gray-300 text-black"
            >
              Next Question
            </Button>
          </div>
        </>
      )}

      {/* Question Set Information */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">About This Question Set:</h3>
        <p className="text-blue-800 text-sm mb-2">{questionSet.description}</p>
        <div className="flex flex-wrap gap-2">
          {questionSet.questions.map((q, index) => (
            <span
              key={q.id}
              className={`px-2 py-1 rounded text-xs ${
                index === currentQuestion
                  ? 'bg-blue-600 text-white'
                  : recordedQuestions.includes(index)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Q{index + 1}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
