"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const router = useRouter()

  const handleStartTest = () => {
    router.push("/test/setup")
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-gray-200 bg-white shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-3xl text-black">Placement Test</CardTitle>
            <CardDescription className="text-gray-600">Communication Assessment Platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-center">
              <p className="text-gray-700">
                Test your communication skills with our comprehensive assessment platform.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-left text-sm text-gray-600">
                <p className="font-semibold text-black">Test Includes:</p>
                <ul className="space-y-1 ml-4">
                  <li>• 7 sections covering different communication skills</li>
                  <li>• Audio recording and voice analysis</li>
                  <li>• Detailed performance scoring</li>
                  <li>• Comprehensive feedback</li>
                </ul>
              </div>
            </div>
            <Button
              onClick={handleStartTest}
              className="w-full bg-black hover:bg-gray-800 text-white py-6 text-lg font-semibold"
            >
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
