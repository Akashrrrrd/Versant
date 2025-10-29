export interface ScoringParameters {
  fluency: number // 0-100: Smoothness and natural rhythm
  pronunciation: number // 0-100: Clarity and accuracy
  grammar: number // 0-100: Correct tense, verbs, prepositions
  vocabulary: number // 0-100: Variety and appropriateness
  comprehension: number // 0-100: Understanding and relevance
}

export interface SectionScore {
  section: string
  score: number
  parameters: ScoringParameters
  feedback: string
}

export interface TestResult {
  id: string
  name: string
  totalScore: number
  date: string
  sectionScores: SectionScore[]
  responses: any[]
}

export function calculateSectionScore(parameters: ScoringParameters): number {
  // Weighted average: all parameters equally weighted
  return Math.round(
    (parameters.fluency +
      parameters.pronunciation +
      parameters.grammar +
      parameters.vocabulary +
      parameters.comprehension) /
      5,
  )
}

export function calculateOverallScore(sectionScores: SectionScore[]): number {
  if (sectionScores.length === 0) return 0
  const total = sectionScores.reduce((sum, section) => sum + section.score, 0)
  return Math.round(total / sectionScores.length)
}

export function generateFeedback(parameters: ScoringParameters): string {
  const scores = [
    { name: "Fluency", score: parameters.fluency },
    { name: "Pronunciation", score: parameters.pronunciation },
    { name: "Grammar", score: parameters.grammar },
    { name: "Vocabulary", score: parameters.vocabulary },
    { name: "Comprehension", score: parameters.comprehension },
  ]

  const strengths = scores.filter((s) => s.score >= 80).map((s) => s.name)
  const weaknesses = scores.filter((s) => s.score < 60).map((s) => s.name)

  let feedback = ""

  if (strengths.length > 0) {
    feedback += `Strengths: ${strengths.join(", ")}. `
  }

  if (weaknesses.length > 0) {
    feedback += `Areas to improve: ${weaknesses.join(", ")}. `
  }

  if (feedback === "") {
    feedback = "Good overall performance. Keep practicing to improve further."
  }

  return feedback
}

export function assessResponse(section: string, userResponse: string, expectedAnswer?: string): ScoringParameters {
  // Simulate assessment based on response characteristics
  // In production, this would use speech-to-text and advanced NLP

  const responseLength = userResponse.split(" ").length
  const hasFillerWords = /um|uh|like|you know|basically|actually|sort of|kind of/.test(userResponse.toLowerCase())
  const hasPunctuation = /[.!?]/.test(userResponse)
  const hasConjunctions = /and|but|because|however|therefore|moreover/.test(userResponse.toLowerCase())

  // Fluency: based on response length, filler words, and flow
  let fluency = 65
  if (responseLength > 15) fluency += 20
  else if (responseLength > 10) fluency += 15
  else if (responseLength > 5) fluency += 10
  if (!hasFillerWords) fluency += 10
  if (hasConjunctions) fluency += 5
  fluency = Math.min(100, fluency)

  // Pronunciation: simulated based on response clarity and structure
  let pronunciation = 70
  if (responseLength > 10) pronunciation += 15
  if (hasPunctuation) pronunciation += 5
  pronunciation = Math.min(100, pronunciation)

  // Grammar: check for basic grammar patterns
  let grammar = 65
  if (hasPunctuation) grammar += 15
  if (hasConjunctions) grammar += 10
  if (expectedAnswer && userResponse.toLowerCase().includes(expectedAnswer.toLowerCase())) {
    grammar += 10
  }
  grammar = Math.min(100, grammar)

  // Vocabulary: based on response variety and complexity
  const uniqueWords = new Set(userResponse.toLowerCase().split(" ")).size
  const avgWordLength = userResponse.split(" ").reduce((sum, word) => sum + word.length, 0) / responseLength
  let vocabulary = 60
  if (uniqueWords > 10) vocabulary += 20
  else if (uniqueWords > 5) vocabulary += 15
  if (avgWordLength > 5) vocabulary += 10
  vocabulary = Math.min(100, vocabulary)

  // Comprehension: based on relevance and completeness
  let comprehension = 65
  if (responseLength > 12) comprehension += 20
  else if (responseLength > 8) comprehension += 15
  if (expectedAnswer && userResponse.toLowerCase().includes(expectedAnswer.toLowerCase())) {
    comprehension += 15
  }
  if (hasConjunctions) comprehension += 5
  comprehension = Math.min(100, comprehension)

  return {
    fluency,
    pronunciation,
    grammar,
    vocabulary,
    comprehension,
  }
}

export function getScoreFeedback(score: number): string {
  if (score >= 85) return "Excellent performance! You are very well-prepared for the placement test."
  if (score >= 75) return "Very good! Your communication skills are strong. Keep practicing to reach excellence."
  if (score >= 65) return "Good effort! You have solid fundamentals. Focus on improving weak areas."
  if (score >= 55) return "Fair performance. Dedicate more time to practice and improvement."
  return "Keep practicing! Focus on all areas of communication skills."
}

export function getScoreLevel(score: number): string {
  if (score >= 85) return "Excellent"
  if (score >= 75) return "Very Good"
  if (score >= 65) return "Good"
  if (score >= 55) return "Fair"
  return "Needs Improvement"
}
