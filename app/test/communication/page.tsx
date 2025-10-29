"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import SectionA from "@/components/test/section-a"
import SectionB from "@/components/test/section-b"
import SectionC from "@/components/test/section-c"
import SectionD from "@/components/test/section-d"
import SectionE from "@/components/test/section-e"
import SectionF from "@/components/test/section-f"
import SectionG from "@/components/test/section-g"
import { assessResponse, calculateSectionScore, calculateOverallScore, type SectionScore } from "@/lib/scoring"

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const sections: Section[] = ["A", "B", "C", "D", "E", "F", "G"]
  const sectionIndex = sections.indexOf(currentSection)
  const progress = ((sectionIndex + 1) / sections.length) * 100

  useEffect(() => {
    initializeAudio()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

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
    // Simulate different response qualities for demo purposes
    const responses: Record<Section, string[]> = {
      A: [
        "I am a dedicated professional with strong communication skills and a passion for learning.",
        "My goal is to advance in my career and contribute meaningfully to an organization.",
        "I am interested in this company because of its innovative approach and strong team culture.",
      ],
      B: [
        "I faced a challenging project deadline but managed it through effective planning and teamwork.",
        "I handle stress by staying organized, taking breaks, and maintaining a positive attitude.",
        "My key strengths are communication, problem-solving, and adaptability in dynamic environments.",
      ],
      C: [
        "The quick brown fox jumps over the lazy dog.",
        "Communication is the key to success in any organization.",
        "Practice makes perfect when learning a new language.",
      ],
      D: [
        "Please listen carefully and repeat this sentence.",
        "Pronunciation is important for clear communication.",
        "The weather today is quite pleasant and sunny.",
      ],
      E: [
        "She goes to the office every day by bus.",
        "They have finished their project last week.",
        "I would like to visit Paris someday.",
      ],
      F: ["She goes to school every day.", "They have completed the project.", "He does not like coffee."],
      G: [
        "Sports play a vital role in maintaining physical health and mental well-being. Regular exercise through sports improves cardiovascular fitness and builds strength. Additionally, sports foster teamwork, discipline, and confidence in individuals.",
      ],
    }

    return responses[section]?.[questionIndex] || "Response recorded."
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

  const saveTestSession = () => {
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

    // Calculate score for each section
    sections.forEach((section) => {
      const sectionResponses = responsesBySection[section]
      if (sectionResponses.length > 0) {
        const avgParameters = {
          fluency: 0,
          pronunciation: 0,
          grammar: 0,
          vocabulary: 0,
          comprehension: 0,
        }

        sectionResponses.forEach((response) => {
          const params = assessResponse(section, response.userResponse)
          avgParameters.fluency += params.fluency
          avgParameters.pronunciation += params.pronunciation
          avgParameters.grammar += params.grammar
          avgParameters.vocabulary += params.vocabulary
          avgParameters.comprehension += params.comprehension
        })

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
          feedback: `Section ${section} performance`,
        })
      }
    })

    const overallScore = calculateOverallScore(sectionScores)

    const testSession = {
      id: Date.now().toString(),
      name: `Mock Test - ${new Date().toLocaleDateString()}`,
      status: "completed" as const,
      totalScore: overallScore,
      date: new Date().toLocaleDateString(),
      sectionScores,
      responses,
    }

    const sessions = JSON.parse(localStorage.getItem("testSessions") || "[]")
    sessions.push(testSession)
    localStorage.setItem("testSessions", JSON.stringify(sessions))

    router.push("/results")
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

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-black">Communication Test</h1>
            <span className="text-gray-600 font-semibold">Section {currentSection}</span>
          </div>
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>

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
      </div>
    </main>
  )
}
