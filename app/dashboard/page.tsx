"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface TestSession {
  id: string
  name: string
  status: "completed" | "in-progress" | "not-started"
  score?: number
  date?: string
}

export default function Dashboard() {
  const [userName, setUserName] = useState("")
  const [testSessions, setTestSessions] = useState<TestSession[]>([])

  useEffect(() => {
    const name = localStorage.getItem("userName")
    setUserName(name || "User")

    // Load test sessions from localStorage
    const sessions = localStorage.getItem("testSessions")
    if (sessions) {
      setTestSessions(JSON.parse(sessions))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userId")
    localStorage.removeItem("userName")
    window.location.href = "/"
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Placement Test Platform</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
          >
            Logout
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome, {userName}!</h2>
          <p className="text-slate-400">Practice your communication skills with our mock placement tests</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-700 bg-slate-800 hover:bg-slate-750 transition">
            <CardHeader>
              <CardTitle className="text-white">Start New Test</CardTitle>
              <CardDescription className="text-slate-400">Begin a new communication assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/test/setup">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Start Test</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Test Statistics</CardTitle>
              <CardDescription className="text-slate-400">Your performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Tests Completed:</span>
                  <span className="font-bold text-white">
                    {testSessions.filter((s) => s.status === "completed").length}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Average Score:</span>
                  <span className="font-bold text-white">
                    {testSessions.filter((s) => s.score).length > 0
                      ? (
                          testSessions.reduce((sum, s) => sum + (s.score || 0), 0) /
                          testSessions.filter((s) => s.score).length
                        ).toFixed(1)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {testSessions.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Previous Tests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testSessions.map((session) => (
                <Card key={session.id} className="border-slate-700 bg-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{session.name}</CardTitle>
                    <CardDescription className="text-slate-400">{session.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          session.status === "completed"
                            ? "bg-green-900 text-green-200"
                            : session.status === "in-progress"
                              ? "bg-yellow-900 text-yellow-200"
                              : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {session.status}
                      </span>
                      {session.score && <span className="text-white font-bold">{session.score}%</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
