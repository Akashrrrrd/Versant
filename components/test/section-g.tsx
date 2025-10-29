"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Square, RefreshCw } from "lucide-react"
import { getRandomQuestionSet, SECTION_G_QUESTIONS, type QuestionSet } from "@/lib/question-bank"
import FreeRecording from "./free-recording"

interface SectionGProps {
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => Promise<Blob>
  onSaveResponse: (questionIndex: number) => void
}

export default function SectionG({ isRecording, onStartRecording, onStopRecording, onSaveResponse }: SectionGProps) {
  const [currentTopic, setCurrentTopic] = useState(0)
  const [prepTime, setPrepTime] = useState(30)
  const [talkTime, setTalkTime] = useState(45)
  const [phase, setPhase] = useState<"prep" | "talk" | "completed">("prep")
  const [hasRecorded, setHasRecorded] = useState(false)
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null)
  const [useEnhancedRecording, setUseEnhancedRecording] = useState(false)

  useEffect(() => {
    // Load a random question set on component mount
    const randomSet = getRandomQuestionSet(SECTION_G_QUESTIONS)
    setQuestionSet(randomSet)
  }, [])

  useEffect(() => {
    if (phase === "prep" && prepTime > 0) {
      const timer = setTimeout(() => setPrepTime(prepTime - 1), 1000)
      return () => clearTimeout(timer)
    } else if (phase === "prep" && prepTime === 0) {
      setPhase("talk")
      if (!useEnhancedRecording) {
        onStartRecording()
      }
    }
  }, [prepTime, phase, onStartRecording, useEnhancedRecording])

  useEffect(() => {
    if (phase === "talk" && talkTime > 0 && !useEnhancedRecording) {
      const timer = setTimeout(() => setTalkTime(talkTime - 1), 1000)
      return () => clearTimeout(timer)
    } else if (phase === "talk" && talkTime === 0 && !useEnhancedRecording) {
      onStopRecording()
      setPhase("completed")
      setHasRecorded(true)
      onSaveResponse(currentTopic)
    }
  }, [talkTime, phase, onStopRecording, currentTopic, onSaveResponse, useEnhancedRecording])

  const handleManualStop = async () => {
    await onStopRecording()
    setPhase("completed")
    setHasRecorded(true)
    onSaveResponse(currentTopic)
  }

  // Topics are now automatically selected - no manual regeneration needed

  const handleNextTopic = () => {
    if (questionSet && currentTopic < questionSet.questions.length - 1) {
      setCurrentTopic(currentTopic + 1)
      setPrepTime(30)
      setTalkTime(45)
      setPhase("prep")
      setHasRecorded(false)
    }
  }

  const handleEnhancedRecordingComplete = (audioBlob: Blob, transcription: string, metrics: any) => {
    setPhase("completed")
    setHasRecorded(true)
    onSaveResponse(currentTopic)
    
    // Store the transcription and metrics for scoring
    const topicData = {
      topicIndex: currentTopic,
      audioBlob,
      transcription,
      metrics,
      topicText: questionSet?.questions[currentTopic]?.text,
      expectedAnswer: questionSet?.questions[currentTopic]?.expectedAnswer
    }
    
    console.log('Enhanced free speech completed:', topicData)
  }

  if (!questionSet) {
    return <div className="text-center">Loading topics...</div>
  }

  const currentTopicData = questionSet.questions[currentTopic]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-black mb-2">Section G: Free Speech</h2>
          <p className="text-gray-600">Prepare for 30 seconds, then speak for 45 seconds on the given topic.</p>
          <p className="text-sm text-blue-600 mt-1">
            <strong>Topic Set:</strong> {questionSet.name} - {questionSet.description}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setUseEnhancedRecording(!useEnhancedRecording)}
            variant="outline"
            size="sm"
            className={useEnhancedRecording ? "bg-green-50 border-green-300 text-green-700" : "border-gray-300"}
          >
            {useEnhancedRecording ? "Enhanced Mode" : "Basic Mode"}
          </Button>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
            Auto-Selected Topics
          </span>
        </div>
      </div>

      <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <p className="text-lg text-black font-semibold">
            Topic {currentTopic + 1} of {questionSet.questions.length}:
          </p>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            currentTopicData.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
            currentTopicData.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {currentTopicData.difficulty}
          </span>
        </div>
        <p className="text-2xl text-black font-bold mb-2">{currentTopicData.text}</p>
        {currentTopicData.expectedAnswer && (
          <p className="text-sm text-gray-600">
            <strong>Consider discussing:</strong> {currentTopicData.expectedAnswer}
          </p>
        )}
      </div>

      {useEnhancedRecording && phase === "prep" ? (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
          <p className="text-blue-800 font-semibold mb-2">Enhanced Mode: Preparation Time</p>
          <p className="text-4xl font-bold text-blue-900 mb-2">{prepTime}</p>
          <p className="text-blue-700">Think about what you want to say...</p>
          <p className="text-sm text-blue-600 mt-2">Recording will start automatically when preparation time ends</p>
        </div>
      ) : useEnhancedRecording && phase === "talk" ? (
        <FreeRecording
          question={currentTopicData.text}
          expectedAnswer={currentTopicData.expectedAnswer}
          timeLimit={45}
          section="G"
          onComplete={handleEnhancedRecordingComplete}
        />
      ) : (
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
      )}

      {phase === "talk" && !useEnhancedRecording && (
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
          {currentTopic < questionSet.questions.length - 1 && (
            <Button
              onClick={handleNextTopic}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              Try Next Topic
            </Button>
          )}
        </div>
      )}

      {/* Topic Set Information */}
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">Available Topics in This Set:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {questionSet.questions.map((topic, index) => (
            <div
              key={topic.id}
              className={`p-2 rounded text-sm border ${
                index === currentTopic
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-purple-800 border-purple-200'
              }`}
            >
              <span className="font-medium">Topic {index + 1}:</span> {topic.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
