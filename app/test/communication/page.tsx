"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Info } from "lucide-react"
import SectionA from "@/components/test/section-a"
import SectionB from "@/components/test/section-b"
import SectionC from "@/components/test/section-c"
import SectionD from "@/components/test/section-d"
import SectionE from "@/components/test/section-e"
import SectionF from "@/components/test/section-f"
import SectionG from "@/components/test/section-g"
import FreeRecording from "@/components/test/free-recording"
import { assessResponse, calculateSectionScore, calculateOverallScore, type SectionScore } from "@/lib/scoring"
import { useTestSessionManager } from "@/lib/test-session-manager"
import { getAllQuestionSets, getRandomQuestionSet } from "@/lib/question-bank"

type Section = "A" | "B" | "C" | "D" | "E" | "F" | "G"

interface TestResponse {
  section: Section
  questionIndex: number
  audioBlob: Blob
  timestamp: string
  userResponse: string // Simulated transcription
}

export default function CommunicationTest() {
  const router = useRouter()
  const [currentSection, setCurrentSection] = useState<Section>("A")
  const [responses, setResponses] = useState<TestResponse[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [currentTestSession, setCurrentTestSession] = useState<any>(null)
  const [questionSets, setQuestionSets] = useState<{ [key: string]: any }>({})
  const [showQuestionInfo, setShowQuestionInfo] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { createNewTest, updateTest, getStats, getDifficultyAdvice } = useTestSessionManager()

  const sections: Section[] = ["A", "B", "C", "D", "E", "F", "G"]
  const sectionIndex = sections.indexOf(currentSection)
  const progress = ((sectionIndex + 1) / sections.length) * 100

  useEffect(() => {
    initializeTest()
    initializeAudio()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  const initializeTest = () => {
    // Create a new test session with varied questions
    const testSession = createNewTest('mixed')
    setCurrentTestSession(testSession)
    
    // Load the question sets for this test
    const allSets = getAllQuestionSets()
    const selectedSets: { [key: string]: any } = {}
    
    Object.keys(testSession.questionSets).forEach(section => {
      const setId = testSession.questionSets[section]
      const sectionSets = allSets[section as keyof typeof allSets]
      const questionSet = sectionSets.find(set => set.id === setId)
      if (questionSet) {
        selectedSets[section] = questionSet
      }
    })
    
    setQuestionSets(selectedSets)
  }

  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
    } catch (error) {
      console.error("Audio initialization error:", error)
    }
  }

  const startRecording = () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.start()
      setIsRecording(true)
    }
  }

  const stopRecording = (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.ondataavailable = (event) => {
          resolve(event.data)
        }
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
    })
  }

  const handleSaveResponse = async (questionIndex: number) => {
    const audioBlob = await stopRecording()
    const simulatedTranscription = generateSimulatedResponse(currentSection, questionIndex)

    const newResponse: TestResponse = {
      section: currentSection,
      questionIndex,
      audioBlob,
      timestamp: new Date().toISOString(),
      userResponse: simulatedTranscription,
    }
    setResponses([...responses, newResponse])
  }

  const generateSimulatedResponse = (section: Section, questionIndex: number): string => {
    // Get the actual question from the current question set
    const sectionQuestionSet = questionSets[section]
    if (sectionQuestionSet && sectionQuestionSet.questions[questionIndex]) {
      const question = sectionQuestionSet.questions[questionIndex]
      
      // Generate a more realistic response based on the actual question
      const questionText = question.text.toLowerCase()
      
      // Simple response generation based on question content
      if (questionText.includes('yourself')) {
        return "I am a dedicated professional with strong communication skills and a passion for continuous learning and growth."
      } else if (questionText.includes('goal') || questionText.includes('future')) {
        return "My goal is to advance in my career while contributing meaningfully to an organization and developing my skills further."
      } else if (questionText.includes('company') || questionText.includes('join')) {
        return "I am interested in this opportunity because of the company's innovative approach and strong team culture."
      } else if (questionText.includes('challenge') || questionText.includes('difficult')) {
        return "I faced a challenging situation but managed it through effective planning, clear communication, and teamwork."
      } else if (questionText.includes('strength')) {
        return "My key strengths are communication, problem-solving, and adaptability in dynamic environments."
      } else if (questionText.includes('experience')) {
        return "I have gained valuable experience through various projects that have helped me develop both technical and interpersonal skills."
      }
    }
    
    // Fallback responses for different sections
    const fallbackResponses: Record<Section, string> = {
      A: "I am a motivated professional with strong communication skills and a commitment to excellence.",
      B: "I approach challenges systematically, focusing on clear communication and collaborative problem-solving.",
      C: "Communication is essential for success in any professional environment and requires continuous practice.",
      D: "Clear pronunciation and proper articulation are fundamental to effective verbal communication.",
      E: "Professional communication requires attention to grammar, vocabulary, and appropriate tone.",
      F: "Effective sentence construction demonstrates strong language skills and clear thinking.",
      G: "This topic is important because it affects many aspects of our daily lives and professional development."
    }

    return fallbackResponses[section] || "Response recorded successfully."
  }

  const handleNextSection = () => {
    const currentIndex = sections.indexOf(currentSection)
    if (currentIndex < sections.length - 1) {
      setCurrentSection(sections[currentIndex + 1])
    } else {
      // Test completed
      saveTestSession()
    }
  }

  const saveTestSession = async () => {
    const sectionScores: SectionScore[] = []

    // Group responses by section
    const responsesBySection: Record<Section, TestResponse[]> = {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: [],
      G: [],
    }

    responses.forEach((response) => {
      responsesBySection[response.section].push(response)
    })

    // Calculate score for each section using enhanced scoring
    for (const section of sections) {
      const sectionResponses = responsesBySection[section]
      if (sectionResponses.length > 0) {
        const avgParameters = {
          fluency: 0,
          pronunciation: 0,
          grammar: 0,
          vocabulary: 0,
          comprehension: 0,
        }

        // Use enhanced scoring with question context
        for (const response of sectionResponses) {
          const sectionQuestionSet = questionSets[section]
          const question = sectionQuestionSet?.questions[response.questionIndex]
          
          const params = await assessResponse(
            section, 
            response.userResponse,
            response.audioBlob,
            question?.expectedAnswer,
            question?.text
          )
          
          avgParameters.fluency += params.fluency
          avgParameters.pronunciation += params.pronunciation
          avgParameters.grammar += params.grammar
          avgParameters.vocabulary += params.vocabulary
          avgParameters.comprehension += params.comprehension
        }

        avgParameters.fluency /= sectionResponses.length
        avgParameters.pronunciation /= sectionResponses.length
        avgParameters.grammar /= sectionResponses.length
        avgParameters.vocabulary /= sectionResponses.length
        avgParameters.comprehension /= sectionResponses.length

        const score = calculateSectionScore(avgParameters)
        sectionScores.push({
          section,
          score,
          parameters: avgParameters,
          feedback: `Section ${section} performance with ${sectionQuestionSet?.name || 'standard'} questions`,
        })
      }
    }

    const overallScore = calculateOverallScore(sectionScores)

    // Update the test session
    if (currentTestSession) {
      updateTest(currentTestSession.id, {
        status: 'completed',
        totalScore: overallScore,
        sectionScores,
        responses
      })
    }

    // Also save to legacy format for compatibility
    const legacySession = {
      id: currentTestSession?.id || Date.now().toString(),
      name: `Mock Test - ${new Date().toLocaleDateString()}`,
      status: "completed" as const,
      totalScore: overallScore,
      date: new Date().toLocaleDateString(),
      sectionScores,
      responses,
    }

    const sessions = JSON.parse(localStorage.getItem("testSessions") || "[]")
    sessions.push(legacySession)
    localStorage.setItem("testSessions", JSON.stringify(sessions))

    router.push("/results")
  }

  const handleRegenerateQuestions = () => {
    // Generate new question sets
    const newTestSession = createNewTest('mixed')
    setCurrentTestSession(newTestSession)
    
    const allSets = getAllQuestionSets()
    const selectedSets: { [key: string]: any } = {}
    
    Object.keys(newTestSession.questionSets).forEach(section => {
      const setId = newTestSession.questionSets[section]
      const sectionSets = allSets[section as keyof typeof allSets]
      const questionSet = sectionSets.find(set => set.id === setId)
      if (questionSet) {
        selectedSets[section] = questionSet
      }
    })
    
    setQuestionSets(selectedSets)
    setResponses([]) // Clear previous responses
    setCurrentSection("A") // Reset to first section
  }

  const renderSection = () => {
    const props = {
      isRecording,
      onStartRecording: startRecording,
      onStopRecording: stopRecording,
      onSaveResponse: handleSaveResponse,
    }

    switch (currentSection) {
      case "A":
        return <SectionA {...props} />
      case "B":
        return <SectionB {...props} />
      case "C":
        return <SectionC {...props} />
      case "D":
        return <SectionD {...props} />
      case "E":
        return <SectionE {...props} />
      case "F":
        return <SectionF {...props} />
      case "G":
        return <SectionG {...props} />
      default:
        return null
    }
  }

  const stats = getStats()
  const difficultyAdvice = getDifficultyAdvice()

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-black">Communication Test</h1>
              {currentTestSession && (
                <p className="text-sm text-gray-600 mt-1">
                  Test ID: {currentTestSession.id} • Varied Questions Mode
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowQuestionInfo(!showQuestionInfo)}
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Info className="w-4 h-4 mr-1" />
                Question Info
              </Button>
              <Button
                onClick={handleRegenerateQuestions}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                New Questions
              </Button>
              <Badge variant="outline" className="text-gray-600">
                Section {currentSection}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>

        {/* Question Set Information */}
        {showQuestionInfo && questionSets[currentSection] && (
          <Card className="border-blue-200 bg-blue-50 mb-6">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Current Question Set: {questionSets[currentSection].name}
              </h3>
              <p className="text-blue-800 text-sm mb-3">
                {questionSets[currentSection].description}
              </p>
              <div className="flex flex-wrap gap-2">
                {questionSets[currentSection].questions.map((q: any, index: number) => (
                  <Badge
                    key={q.id}
                    variant={q.difficulty === 'easy' ? 'default' : q.difficulty === 'medium' ? 'secondary' : 'destructive'}
                    className="text-xs"
                  >
                    Q{index + 1}: {q.difficulty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Stats */}
        {stats.totalTests > 0 && (
          <Card className="border-gray-200 bg-gray-50 mb-6">
            <CardContent className="pt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Tests Completed: <strong>{stats.totalTests}</strong>
                </span>
                <span className="text-gray-600">
                  Average Score: <strong>{stats.averageScore}%</strong>
                </span>
                <span className="text-gray-600">
                  Trend: <strong className={
                    stats.recentTrend === 'improving' ? 'text-green-600' :
                    stats.recentTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }>{stats.recentTrend}</strong>
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Difficulty Advice */}
        {difficultyAdvice && (
          <Card className="border-yellow-200 bg-yellow-50 mb-6">
            <CardContent className="pt-4">
              <p className="text-yellow-800 text-sm">
                <strong>Suggestion:</strong> {difficultyAdvice.reason}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card className="border-gray-200 bg-white shadow-md mb-6">
          <CardContent className="pt-6">{renderSection()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={() => {
              const currentIndex = sections.indexOf(currentSection)
              if (currentIndex > 0) {
                setCurrentSection(sections[currentIndex - 1])
              }
            }}
            disabled={sectionIndex === 0}
            variant="outline"
            className="border-gray-300 text-black hover:bg-gray-100 bg-white"
          >
            Previous Section
          </Button>
          <Button onClick={handleNextSection} className="bg-black hover:bg-gray-800 text-white px-8">
            {sectionIndex === sections.length - 1 ? "Complete Test" : "Next Section"}
          </Button>
        </div>

        {/* Question Variety Info */}
        <Card className="border-green-200 bg-green-50 mt-6">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-green-900 mb-2">🎯 Varied Question System</h3>
            <p className="text-green-800 text-sm mb-2">
              This test uses different question sets each time to provide variety and prevent memorization.
            </p>
            <div className="text-xs text-green-700">
              <p>• <strong>5-7 different question sets</strong> per section</p>
              <p>• <strong>Smart rotation</strong> avoids recently used questions</p>
              <p>• <strong>Difficulty tracking</strong> suggests appropriate levels</p>
              <p>• <strong>Performance analysis</strong> based on actual responses</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
