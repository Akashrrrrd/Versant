"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { getScoreFeedback, getScoreLevel, type SectionScore } from "@/lib/scoring"

interface TestResult {
  id: string
  name: string
  totalScore: number
  date: string
  sectionScores: SectionScore[]
}

export default function Results() {
  const [result, setResult] = useState<TestResult | null>(null)

  useEffect(() => {
    const sessions = JSON.parse(localStorage.getItem("testSessions") || "[]")
    if (sessions.length > 0) {
      const lastSession = sessions[sessions.length - 1]
      setResult({
        id: lastSession.id,
        name: lastSession.name,
        totalScore: lastSession.totalScore,
        date: lastSession.date,
        sectionScores: lastSession.sectionScores || [],
      })
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600"
    if (score >= 75) return "text-blue-600"
    if (score >= 65) return "text-yellow-600"
    if (score >= 55) return "text-orange-600"
    return "text-red-600"
  }

  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-600"
    if (score >= 75) return "bg-blue-600"
    if (score >= 65) return "bg-yellow-600"
    if (score >= 55) return "bg-orange-600"
    return "bg-red-600"
  }

  return (
    <main className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Test Results</h1>
          <p className="text-gray-600">Your comprehensive performance analysis</p>
        </div>

        {result && (
          <>
            {/* Overall Score Card */}
            <Card className="border-gray-200 bg-white shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-black">{result.name}</CardTitle>
                <CardDescription className="text-gray-600">{result.date}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-2 font-semibold">Overall Score</p>
                  <p className={`text-6xl font-bold ${getScoreColor(result.totalScore)}`}>{result.totalScore}%</p>
                  <p className={`text-lg font-semibold mt-2 ${getScoreColor(result.totalScore)}`}>
                    {getScoreLevel(result.totalScore)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700 text-center">{getScoreFeedback(result.totalScore)}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-semibold">Overall Progress</span>
                    <span className="text-gray-600">{result.totalScore}%</span>
                  </div>
                  <Progress value={result.totalScore} className={`h-3 ${getProgressColor(result.totalScore)}`} />
                </div>
              </CardContent>
            </Card>

            {/* Section Scores */}
            <Card className="border-gray-200 bg-white shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-black">Section-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.sectionScores.map((section) => (
                    <div key={section.section} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-black">Section {section.section}</h3>
                        <span className={`text-2xl font-bold ${getScoreColor(section.score)}`}>{section.score}%</span>
                      </div>
                      <Progress value={section.score} className={`h-2 mb-4 ${getProgressColor(section.score)}`} />

                      {/* Parameter Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Fluency</p>
                          <p className="text-lg font-bold text-black">{Math.round(section.parameters.fluency)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Pronunciation</p>
                          <p className="text-lg font-bold text-black">{Math.round(section.parameters.pronunciation)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Grammar</p>
                          <p className="text-lg font-bold text-black">{Math.round(section.parameters.grammar)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Vocabulary</p>
                          <p className="text-lg font-bold text-black">{Math.round(section.parameters.vocabulary)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded text-center">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Comprehension</p>
                          <p className="text-lg font-bold text-black">{Math.round(section.parameters.comprehension)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="border-gray-200 bg-white shadow-lg mb-6">
              <CardHeader>
                <CardTitle className="text-black">Test Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                    <p className="text-gray-600 text-sm font-semibold mb-1">Sections Completed</p>
                    <p className="text-3xl font-bold text-black">{result.sectionScores.length}/7</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                    <p className="text-gray-600 text-sm font-semibold mb-1">Total Questions</p>
                    <p className="text-3xl font-bold text-black">41</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
                    <p className="text-gray-600 text-sm font-semibold mb-1">Test Date</p>
                    <p className="text-lg font-bold text-black">{result.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/email-assessment" className="block">
                <Button className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold">
                  Take Email Writing Assessment
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-black hover:bg-gray-100 bg-white py-6 text-lg font-semibold"
                >
                  Back to Home
                </Button>
              </Link>
              <Link href="/test/setup" className="block">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-black hover:bg-gray-100 bg-white py-6 text-lg font-semibold"
                >
                  Take Another Communication Test
                </Button>
              </Link>
            </div>
          </>
        )}

        {!result && (
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 mb-4">No test results found. Take a test to see your results.</p>
              <Link href="/test/setup" className="block">
                <Button className="w-full bg-black hover:bg-gray-800 text-white">Start Test</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
