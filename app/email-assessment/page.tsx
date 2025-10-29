"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

interface EmailPrompt {
  id: number
  title: string
  scenario: string
  requirements: string[]
}

const EMAIL_PROMPTS: EmailPrompt[] = [
  {
    id: 1,
    title: "Professional Inquiry",
    scenario:
      "You want to inquire about a job opening at a company. Write a professional email to the HR department expressing your interest.",
    requirements: [
      "Clear subject line",
      "Professional greeting",
      "Mention specific position",
      "Highlight relevant skills",
      "Professional closing",
    ],
  },
  {
    id: 2,
    title: "Meeting Request",
    scenario:
      "You need to schedule a meeting with your manager to discuss your project progress. Write an email requesting a meeting.",
    requirements: [
      "Clear purpose statement",
      "Suggested time options",
      "Brief agenda",
      "Professional tone",
      "Polite closing",
    ],
  },
  {
    id: 3,
    title: "Complaint Resolution",
    scenario: "You received a defective product from a vendor. Write a professional email to resolve the issue.",
    requirements: [
      "Specific issue description",
      "Order/reference details",
      "Proposed solution",
      "Professional tone",
      "Clear call to action",
    ],
  },
]

interface EmailScore {
  clarity: number
  professionalism: number
  structure: number
  grammar: number
  effectiveness: number
}

export default function EmailAssessment() {
  const [currentPrompt, setCurrentPrompt] = useState(0)
  const [emailContent, setEmailContent] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<EmailScore | null>(null)

  const assessEmail = (content: string): EmailScore => {
    const wordCount = content.split(" ").length
    const hasGreeting = /dear|hello|hi/i.test(content)
    const hasClosing = /regards|sincerely|best|thanks/i.test(content)
    const hasPunctuation = (content.match(/[.!?]/g) || []).length > 3
    const sentences = content.split(/[.!?]/).filter((s) => s.trim().length > 0)
    const avgSentenceLength = wordCount / Math.max(sentences.length, 1)

    let clarity = 60
    if (wordCount > 50) clarity += 15
    if (wordCount > 100) clarity += 10
    if (hasPunctuation) clarity += 10
    clarity = Math.min(100, clarity)

    let professionalism = 60
    if (hasGreeting) professionalism += 15
    if (hasClosing) professionalism += 15
    if (!/lol|omg|btw/i.test(content)) professionalism += 10
    professionalism = Math.min(100, professionalism)

    let structure = 60
    if (hasGreeting && hasClosing) structure += 20
    if (sentences.length > 3) structure += 15
    if (avgSentenceLength > 10 && avgSentenceLength < 25) structure += 5
    structure = Math.min(100, structure)

    let grammar = 65
    if (hasPunctuation) grammar += 15
    if (!/\s{2,}/.test(content)) grammar += 10
    if (!/[A-Z]{2,}/.test(content.slice(0, 50))) grammar += 5
    grammar = Math.min(100, grammar)

    let effectiveness = 60
    if (wordCount > 80) effectiveness += 15
    if (sentences.length > 4) effectiveness += 15
    if (hasGreeting && hasClosing) effectiveness += 10
    effectiveness = Math.min(100, effectiveness)

    return {
      clarity,
      professionalism,
      structure,
      grammar,
      effectiveness,
    }
  }

  const handleSubmit = () => {
    if (emailContent.trim().length < 20) {
      alert("Please write a more substantial email (at least 20 characters)")
      return
    }

    const emailScore = assessEmail(emailContent)
    setScore(emailScore)
    setSubmitted(true)
  }

  const handleNext = () => {
    if (currentPrompt < EMAIL_PROMPTS.length - 1) {
      setCurrentPrompt(currentPrompt + 1)
      setEmailContent("")
      setSubmitted(false)
      setScore(null)
    }
  }

  const handlePrevious = () => {
    if (currentPrompt > 0) {
      setCurrentPrompt(currentPrompt - 1)
      setEmailContent("")
      setSubmitted(false)
      setScore(null)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getAverageScore = (): number => {
    if (!score) return 0
    return Math.round(
      (score.clarity + score.professionalism + score.structure + score.grammar + score.effectiveness) / 5,
    )
  }

  const prompt = EMAIL_PROMPTS[currentPrompt]

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Email Writing Assessment</h1>
          <p className="text-gray-600">Demonstrate your professional email writing skills</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-semibold">
              Prompt {currentPrompt + 1} of {EMAIL_PROMPTS.length}
            </span>
            <span className="text-gray-600">{Math.round(((currentPrompt + 1) / EMAIL_PROMPTS.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all"
              style={{ width: `${((currentPrompt + 1) / EMAIL_PROMPTS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Prompt Card */}
        <Card className="border-gray-200 bg-white shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="text-black">{prompt.title}</CardTitle>
            <CardDescription className="text-gray-600">{prompt.scenario}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
              <p className="text-gray-700 font-semibold mb-3">Requirements:</p>
              <ul className="space-y-2">
                {prompt.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-black font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Email Input */}
        {!submitted && (
          <Card className="border-gray-200 bg-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-black">Write Your Email</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Write your professional email here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                className="min-h-64 border-gray-300 text-black placeholder:text-gray-400 focus:border-black"
              />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-gray-600 text-sm">{emailContent.length} characters</span>
                <Button onClick={handleSubmit} className="bg-black hover:bg-gray-800 text-white">
                  Submit Email
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Display */}
        {submitted && score && (
          <Card className="border-gray-200 bg-white shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="text-black">Assessment Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <p className="text-gray-600 mb-2 font-semibold">Overall Score</p>
                <p className={`text-5xl font-bold ${getScoreColor(getAverageScore())}`}>{getAverageScore()}%</p>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-gray-50 p-3 rounded text-center border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Clarity</p>
                  <p className={`text-lg font-bold ${getScoreColor(score.clarity)}`}>{score.clarity}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Professionalism</p>
                  <p className={`text-lg font-bold ${getScoreColor(score.professionalism)}`}>
                    {score.professionalism}%
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Structure</p>
                  <p className={`text-lg font-bold ${getScoreColor(score.structure)}`}>{score.structure}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Grammar</p>
                  <p className={`text-lg font-bold ${getScoreColor(score.grammar)}`}>{score.grammar}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded text-center border border-gray-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Effectiveness</p>
                  <p className={`text-lg font-bold ${getScoreColor(score.effectiveness)}`}>{score.effectiveness}%</p>
                </div>
              </div>

              {/* Feedback */}
              {getAverageScore() >= 75 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Excellent email! Your writing demonstrates strong professional communication skills.
                  </AlertDescription>
                </Alert>
              )}
              {getAverageScore() >= 60 && getAverageScore() < 75 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    Good effort! Consider improving structure and professionalism for better results.
                  </AlertDescription>
                </Alert>
              )}
              {getAverageScore() < 60 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    Keep practicing! Focus on professional tone, structure, and clarity in your emails.
                  </AlertDescription>
                </Alert>
              )}

              {/* Your Email Display */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 font-semibold mb-2">Your Email:</p>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">{emailContent}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between gap-4 mb-6">
          <Button
            onClick={handlePrevious}
            disabled={currentPrompt === 0}
            variant="outline"
            className="border-gray-300 text-black hover:bg-gray-100 bg-white"
          >
            Previous Prompt
          </Button>
          {submitted ? (
            <Button onClick={handleNext} className="bg-black hover:bg-gray-800 text-white">
              {currentPrompt === EMAIL_PROMPTS.length - 1 ? "Finish Assessment" : "Next Prompt"}
            </Button>
          ) : (
            <div />
          )}
        </div>

        {/* Completion Message */}
        {submitted && currentPrompt === EMAIL_PROMPTS.length - 1 && (
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black mb-2">Assessment Complete!</h2>
              <p className="text-gray-600 mb-6">
                You have successfully completed the email writing assessment. Your results have been saved.
              </p>
              <Link href="/" className="block">
                <Button className="w-full bg-black hover:bg-gray-800 text-white">Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
