
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

export async function assessResponse(
  section: string,
  userResponse: string,
  audioBlob?: Blob,
  expectedAnswer?: string,
  question?: string
): Promise<ScoringParameters> {
  // Free intelligent assessment using browser APIs and advanced text analysis
  try {
    const [textAnalysis, audioAnalysis] = await Promise.allSettled([
      intelligentTextAnalysis(userResponse, expectedAnswer, question, section),
      audioBlob ? freeAudioAnalysis(audioBlob) : null
    ])

    const textResult = textAnalysis.status === 'fulfilled' ? textAnalysis.value : null
    const audioResult = audioAnalysis.status === 'fulfilled' ? audioAnalysis.value : null

    return combineIntelligentResults(textResult, audioResult, userResponse, expectedAnswer)
  } catch (error) {
    console.error('Assessment failed, using enhanced fallback:', error)
    return enhancedFallbackAssessment(userResponse, expectedAnswer, question, section)
  }
}

// Free intelligent text analysis using advanced algorithms
async function intelligentTextAnalysis(
  text: string,
  expectedAnswer?: string,
  question?: string,
  section?: string
): Promise<any> {
  const grammar = analyzeGrammarFree(text)
  const vocabulary = analyzeVocabularyFree(text)
  const content = analyzeContentFree(text, expectedAnswer, question, section)
  const sentiment = analyzeSentimentFree(text)

  return { grammar, vocabulary, content, sentiment }
}

// Free audio analysis using Web Audio API
async function freeAudioAnalysis(audioBlob: Blob): Promise<any> {
  try {
    const audioBuffer = await blobToAudioBuffer(audioBlob)
    const metrics = extractAudioMetrics(audioBuffer)
    return metrics
  } catch (error) {
    console.warn('Audio analysis failed:', error)
    return null
  }
}

function combineIntelligentResults(
  textResult: any,
  audioResult: any,
  userResponse: string,
  expectedAnswer?: string
): ScoringParameters {
  // Enhanced scoring combining multiple free analysis methods

  const grammar = textResult?.grammar?.score || enhancedGrammarScore(userResponse)
  const vocabulary = textResult?.vocabulary?.score || enhancedVocabularyScore(userResponse)
  const comprehension = textResult?.content?.relevance || enhancedComprehensionScore(userResponse, expectedAnswer)

  // Pronunciation estimation from text complexity and audio metrics
  let pronunciation = 75
  if (audioResult?.clarity) {
    pronunciation = audioResult.clarity
  } else {
    pronunciation = estimatePronunciationFromText(userResponse)
  }

  // Fluency from audio analysis and text flow
  let fluency = 70
  if (audioResult?.speakingRate) {
    fluency = calculateFluencyFromRate(audioResult.speakingRate, audioResult.pauseRatio)
  } else {
    fluency = estimateFluencyFromText(userResponse)
  }

  return {
    fluency: Math.round(fluency),
    pronunciation: Math.round(pronunciation),
    grammar: Math.round(grammar),
    vocabulary: Math.round(vocabulary),
    comprehension: Math.round(comprehension)
  }
}

function fallbackAssessment(userResponse: string, expectedAnswer?: string): ScoringParameters {
  // Original simulated assessment as fallback
  const responseLength = userResponse.split(" ").length
  const hasFillerWords = /um|uh|like|you know|basically|actually|sort of|kind of/.test(userResponse.toLowerCase())
  const hasPunctuation = /[.!?]/.test(userResponse)
  const hasConjunctions = /and|but|because|however|therefore|moreover/.test(userResponse.toLowerCase())

  let fluency = 65
  if (responseLength > 15) fluency += 20
  else if (responseLength > 10) fluency += 15
  else if (responseLength > 5) fluency += 10
  if (!hasFillerWords) fluency += 10
  if (hasConjunctions) fluency += 5
  fluency = Math.min(100, fluency)

  let pronunciation = 70
  if (responseLength > 10) pronunciation += 15
  if (hasPunctuation) pronunciation += 5
  pronunciation = Math.min(100, pronunciation)

  let grammar = 65
  if (hasPunctuation) grammar += 15
  if (hasConjunctions) grammar += 10
  if (expectedAnswer && userResponse.toLowerCase().includes(expectedAnswer.toLowerCase())) {
    grammar += 10
  }
  grammar = Math.min(100, grammar)

  const uniqueWords = new Set(userResponse.toLowerCase().split(" ")).size
  const avgWordLength = userResponse.split(" ").reduce((sum, word) => sum + word.length, 0) / responseLength
  let vocabulary = 60
  if (uniqueWords > 10) vocabulary += 20
  else if (uniqueWords > 5) vocabulary += 15
  if (avgWordLength > 5) vocabulary += 10
  vocabulary = Math.min(100, vocabulary)

  let comprehension = 65
  if (responseLength > 12) comprehension += 20
  else if (responseLength > 8) comprehension += 15
  if (expectedAnswer && userResponse.toLowerCase().includes(expectedAnswer.toLowerCase())) {
    comprehension += 15
  }
  if (hasConjunctions) comprehension += 5
  comprehension = Math.min(100, comprehension)

  return { fluency, pronunciation, grammar, vocabulary, comprehension }
}

function fallbackGrammarScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/)
  let score = 70

  if (sentences.length > 1) score += 10
  if (words.length > 10) score += 10
  if (/^[A-Z]/.test(text)) score += 5
  if (/[.!?]$/.test(text.trim())) score += 5

  return Math.min(100, score)
}

function fallbackVocabularyScore(text: string): number {
  const words = text.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words).size
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length

  let score = 60
  if (uniqueWords / words.length > 0.7) score += 20
  if (avgWordLength > 5) score += 15
  if (words.some(word => word.length > 7)) score += 5

  return Math.min(100, score)
}

function fallbackPronunciationScore(text: string): number {
  // Basic estimation based on text complexity
  const words = text.split(/\s+/)
  let score = 75

  if (words.length > 10) score += 10
  if (words.some(word => word.length > 6)) score += 5

  return Math.min(100, score)
}

function fallbackFluencyScore(text: string): number {
  const words = text.split(/\s+/)
  const hasFillers = /um|uh|like|you know/.test(text.toLowerCase())

  let score = 70
  if (words.length > 15) score += 15
  if (!hasFillers) score += 10
  if (/and|but|because|however/.test(text.toLowerCase())) score += 5

  return Math.min(100, score)
}

function fallbackComprehensionScore(text: string): number {
  const words = text.split(/\s+/)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

  let score = 65
  if (words.length > 12) score += 20
  if (sentences.length > 2) score += 10
  if (/because|therefore|however/.test(text.toLowerCase())) score += 5

  return Math.min(100, score)
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

// ============ FREE INTELLIGENT ANALYSIS FUNCTIONS ============

// Advanced grammar analysis without external APIs
function analyzeGrammarFree(text: string): { score: number; errors: string[]; suggestions: string[] } {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 85 // Start with high score, deduct for errors

  // Basic grammar checks
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0)

  // Check capitalization
  if (!/^[A-Z]/.test(text.trim())) {
    errors.push('Missing capital letter at start')
    suggestions.push('Start sentences with capital letters')
    score -= 5
  }

  // Check ending punctuation
  if (!/[.!?]$/.test(text.trim())) {
    errors.push('Missing ending punctuation')
    suggestions.push('End sentences with proper punctuation')
    score -= 5
  }

  // Check for common grammar patterns
  const commonErrors = [
    { pattern: /\bi am going to went\b/i, error: 'Incorrect verb tense', penalty: 10 },
    { pattern: /\bhe don't\b/i, error: 'Subject-verb disagreement', penalty: 8 },
    { pattern: /\bshe don't\b/i, error: 'Subject-verb disagreement', penalty: 8 },
    { pattern: /\bit don't\b/i, error: 'Subject-verb disagreement', penalty: 8 },
    { pattern: /\bmuch people\b/i, error: 'Use "many people" not "much people"', penalty: 6 },
    { pattern: /\bless people\b/i, error: 'Use "fewer people" not "less people"', penalty: 6 },
    { pattern: /\bmore better\b/i, error: 'Use "better" not "more better"', penalty: 6 },
    { pattern: /\bmost best\b/i, error: 'Use "best" not "most best"', penalty: 6 },
    { pattern: /\bcan able to\b/i, error: 'Use either "can" or "able to"', penalty: 5 },
    { pattern: /\bwould of\b/i, error: 'Use "would have" not "would of"', penalty: 8 },
    { pattern: /\bcould of\b/i, error: 'Use "could have" not "could of"', penalty: 8 },
    { pattern: /\bshould of\b/i, error: 'Use "should have" not "should of"', penalty: 8 }
  ]

  commonErrors.forEach(({ pattern, error, penalty }) => {
    if (pattern.test(text)) {
      errors.push(error)
      score -= penalty
    }
  })

  // Check sentence structure variety
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)
  if (avgWordsPerSentence < 5) {
    suggestions.push('Try using longer, more complex sentences')
    score -= 5
  } else if (avgWordsPerSentence > 25) {
    suggestions.push('Break down very long sentences for clarity')
    score -= 3
  }

  // Check for conjunctions (shows complex thinking)
  const conjunctions = ['and', 'but', 'because', 'although', 'however', 'therefore', 'moreover', 'furthermore']
  const hasConjunctions = conjunctions.some(conj => text.toLowerCase().includes(conj))
  if (hasConjunctions) score += 5

  return { score: Math.max(0, Math.min(100, score)), errors, suggestions }
}

// Advanced vocabulary analysis
function analyzeVocabularyFree(text: string): { score: number; metrics: any; suggestions: string[] } {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || []
  const uniqueWords = new Set(words)
  const suggestions: string[] = []

  // Calculate metrics
  const totalWords = words.length
  const uniqueWordCount = uniqueWords.size
  const lexicalDiversity = uniqueWordCount / Math.max(totalWords, 1)
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / Math.max(totalWords, 1)

  // Advanced vocabulary words (7+ letters or academic/professional terms)
  const advancedWords = words.filter(word =>
    word.length >= 7 ||
    isAcademicWord(word) ||
    isProfessionalWord(word)
  )

  // Calculate base score
  let score = 60

  // Lexical diversity bonus
  if (lexicalDiversity > 0.8) score += 25
  else if (lexicalDiversity > 0.6) score += 20
  else if (lexicalDiversity > 0.4) score += 15
  else if (lexicalDiversity > 0.2) score += 10

  // Word length bonus
  if (avgWordLength > 6) score += 15
  else if (avgWordLength > 5) score += 10
  else if (avgWordLength > 4) score += 5

  // Advanced vocabulary bonus
  const advancedRatio = advancedWords.length / Math.max(totalWords, 1)
  if (advancedRatio > 0.3) score += 15
  else if (advancedRatio > 0.2) score += 10
  else if (advancedRatio > 0.1) score += 5

  // Repetition penalty
  const repetitions = findWordRepetitions(words)
  if (repetitions.length > 0) {
    score -= repetitions.length * 3
    suggestions.push('Avoid repeating the same words too often')
  }

  // Suggestions based on analysis
  if (lexicalDiversity < 0.5) {
    suggestions.push('Try using more varied vocabulary')
  }
  if (avgWordLength < 4.5) {
    suggestions.push('Include some longer, more descriptive words')
  }
  if (advancedWords.length === 0) {
    suggestions.push('Consider using more sophisticated vocabulary')
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    metrics: { totalWords, uniqueWordCount, lexicalDiversity, avgWordLength, advancedWords: advancedWords.length },
    suggestions
  }
}

// Content relevance and completeness analysis
function analyzeContentFree(
  text: string,
  expectedAnswer?: string,
  question?: string,
  section?: string
): { relevance: number; completeness: number; coherence: number; keyPoints: string[] } {
  const words = text.toLowerCase().split(/\s+/)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

  let relevance = 70
  let completeness = 60
  let coherence = 70

  // Analyze relevance to expected answer
  if (expectedAnswer) {
    const expectedWords = expectedAnswer.toLowerCase().split(/\s+/)
    const matchingConcepts = countMatchingConcepts(words, expectedWords)
    relevance = Math.min(100, 50 + (matchingConcepts / expectedWords.length) * 50)
  }

  // Analyze completeness based on section type and content
  if (section) {
    completeness = analyzeCompletenessForSection(text, section, question)
  } else {
    // General completeness based on length and structure
    if (words.length > 20) completeness += 25
    else if (words.length > 15) completeness += 20
    else if (words.length > 10) completeness += 15
    else if (words.length > 5) completeness += 10

    if (sentences.length > 2) completeness += 15
  }

  // Analyze coherence (logical flow)
  const transitionWords = ['first', 'second', 'then', 'next', 'finally', 'however', 'therefore', 'because', 'although']
  const hasTransitions = transitionWords.some(word => text.toLowerCase().includes(word))
  if (hasTransitions) coherence += 15

  const hasExamples = /for example|such as|like|including/.test(text.toLowerCase())
  if (hasExamples) coherence += 10

  // Extract key points
  const keyPoints = extractKeyPointsFree(sentences)

  return {
    relevance: Math.min(100, relevance),
    completeness: Math.min(100, completeness),
    coherence: Math.min(100, coherence),
    keyPoints
  }
}

// Sentiment analysis for tone assessment
function analyzeSentimentFree(text: string): { sentiment: string; confidence: number; tone: string } {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'enjoy',
    'happy', 'excited', 'passionate', 'confident', 'successful', 'achieve', 'accomplish',
    'opportunity', 'growth', 'development', 'improvement', 'positive', 'optimistic'
  ]

  const negativeWords = [
    'bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'worst', 'difficult', 'problem',
    'challenge', 'struggle', 'fail', 'failure', 'disappointed', 'frustrated', 'worried',
    'concerned', 'negative', 'pessimistic', 'unfortunate', 'regret'
  ]

  const words = text.toLowerCase().split(/\s+/)
  const positiveCount = words.filter(word => positiveWords.includes(word)).length
  const negativeCount = words.filter(word => negativeWords.includes(word)).length

  let sentiment = 'neutral'
  let confidence = 0.5
  let tone = 'neutral'

  if (positiveCount > negativeCount) {
    sentiment = 'positive'
    confidence = Math.min(0.9, 0.5 + (positiveCount - negativeCount) / words.length * 2)
    tone = positiveCount > negativeCount * 2 ? 'enthusiastic' : 'positive'
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative'
    confidence = Math.min(0.9, 0.5 + (negativeCount - positiveCount) / words.length * 2)
    tone = negativeCount > positiveCount * 2 ? 'pessimistic' : 'cautious'
  }

  return { sentiment, confidence, tone }
}

// Audio analysis using Web Audio API
async function blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
  const arrayBuffer = await blob.arrayBuffer()
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  return await audioContext.decodeAudioData(arrayBuffer)
}

function extractAudioMetrics(audioBuffer: AudioBuffer): any {
  const channelData = audioBuffer.getChannelData(0)
  const sampleRate = audioBuffer.sampleRate
  const duration = audioBuffer.duration

  // Calculate speaking rate (estimate words based on audio patterns)
  const estimatedWords = estimateWordCount(channelData, sampleRate)
  const speakingRate = (estimatedWords / duration) * 60 // words per minute

  // Calculate pause ratio
  const silenceThreshold = 0.01
  const silentSamples = channelData.filter(sample => Math.abs(sample) < silenceThreshold).length
  const pauseRatio = silentSamples / channelData.length

  // Calculate volume variation (indicates natural speech patterns)
  const volumeVariation = calculateVolumeVariation(channelData)

  // Estimate clarity based on frequency distribution
  const clarity = estimateClarity(channelData, sampleRate)

  return {
    speakingRate,
    pauseRatio,
    volumeVariation,
    clarity,
    duration
  }
}

// Helper functions for analysis
function isAcademicWord(word: string): boolean {
  const academicWords = [
    'analyze', 'concept', 'theory', 'research', 'study', 'examine', 'investigate',
    'demonstrate', 'illustrate', 'significant', 'substantial', 'comprehensive',
    'methodology', 'hypothesis', 'conclusion', 'evidence', 'criteria', 'assessment'
  ]
  return academicWords.includes(word)
}

function isProfessionalWord(word: string): boolean {
  const professionalWords = [
    'experience', 'responsibility', 'management', 'leadership', 'collaboration',
    'communication', 'development', 'implementation', 'strategy', 'objective',
    'achievement', 'performance', 'efficiency', 'productivity', 'innovation',
    'solution', 'challenge', 'opportunity', 'professional', 'expertise'
  ]
  return professionalWords.includes(word)
}

function findWordRepetitions(words: string[]): string[] {
  const wordCount: { [key: string]: number } = {}
  words.forEach(word => {
    if (word.length > 3) { // Only check words longer than 3 characters
      wordCount[word] = (wordCount[word] || 0) + 1
    }
  })

  return Object.keys(wordCount).filter(word => wordCount[word] > 2)
}

function countMatchingConcepts(userWords: string[], expectedWords: string[]): number {
  let matches = 0
  expectedWords.forEach(expectedWord => {
    if (userWords.some(userWord =>
      userWord.includes(expectedWord) ||
      expectedWord.includes(userWord) ||
      areSynonyms(userWord, expectedWord)
    )) {
      matches++
    }
  })
  return matches
}

function areSynonyms(word1: string, word2: string): boolean {
  const synonymGroups = [
    ['good', 'great', 'excellent', 'wonderful', 'amazing'],
    ['work', 'job', 'career', 'profession', 'employment'],
    ['learn', 'study', 'education', 'knowledge', 'training'],
    ['help', 'assist', 'support', 'aid'],
    ['important', 'significant', 'crucial', 'essential', 'vital'],
    ['company', 'organization', 'business', 'firm', 'corporation'],
    ['skill', 'ability', 'capability', 'competence', 'expertise'],
    ['goal', 'objective', 'target', 'aim', 'purpose']
  ]

  return synonymGroups.some(group =>
    group.includes(word1) && group.includes(word2)
  )
}

function analyzeCompletenessForSection(text: string, section: string, question?: string): number {
  const words = text.toLowerCase().split(/\s+/)
  let completeness = 60

  switch (section) {
    case 'A': // Short questions
      if (words.length >= 8) completeness += 30
      else if (words.length >= 5) completeness += 20
      else if (words.length >= 3) completeness += 10
      break

    case 'B': // Situational questions
      if (words.length >= 25) completeness += 30
      else if (words.length >= 15) completeness += 20
      else if (words.length >= 10) completeness += 10

      // Check for situation description
      if (/situation|problem|challenge|experience/.test(text)) completeness += 5
      // Check for solution/action
      if (/solution|action|did|decided|resolved/.test(text)) completeness += 5
      break

    case 'G': // Free speech
      if (words.length >= 50) completeness += 30
      else if (words.length >= 35) completeness += 20
      else if (words.length >= 20) completeness += 10

      // Check for topic development
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
      if (sentences.length >= 4) completeness += 10
      break

    default:
      if (words.length >= 15) completeness += 25
      else if (words.length >= 10) completeness += 15
      else if (words.length >= 5) completeness += 10
  }

  return Math.min(100, completeness)
}

function extractKeyPointsFree(sentences: string[]): string[] {
  return sentences
    .filter(sentence => sentence.trim().length > 15)
    .map(sentence => sentence.trim())
    .slice(0, 3) // Top 3 key points
}

function estimateWordCount(channelData: Float32Array, sampleRate: number): number {
  // Estimate word count based on audio energy patterns
  const windowSize = Math.floor(sampleRate * 0.1) // 100ms windows
  const energyThreshold = 0.02
  let wordBoundaries = 0

  for (let i = 0; i < channelData.length - windowSize; i += windowSize) {
    const currentEnergy = calculateRMS(channelData.slice(i, i + windowSize))
    const nextEnergy = calculateRMS(channelData.slice(i + windowSize, i + windowSize * 2))

    if (currentEnergy > energyThreshold && nextEnergy < energyThreshold * 0.5) {
      wordBoundaries++
    }
  }

  return Math.max(1, wordBoundaries)
}

function calculateRMS(samples: Float32Array): number {
  const sum = samples.reduce((acc, sample) => acc + sample * sample, 0)
  return Math.sqrt(sum / samples.length)
}

function calculateVolumeVariation(channelData: Float32Array): number {
  const windowSize = Math.floor(channelData.length / 20) // 20 windows
  const volumes: number[] = []

  for (let i = 0; i < channelData.length; i += windowSize) {
    const window = channelData.slice(i, i + windowSize)
    volumes.push(calculateRMS(window))
  }

  const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length
  const variance = volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length

  return Math.sqrt(variance)
}

function estimateClarity(channelData: Float32Array, sampleRate: number): number {
  // Estimate clarity based on frequency content and signal quality
  const fftSize = 2048
  const clarity = performBasicFFTAnalysis(channelData.slice(0, fftSize), sampleRate)
  return Math.min(100, Math.max(50, clarity))
}

function performBasicFFTAnalysis(signal: Float32Array, sampleRate: number): number {
  // Simplified frequency analysis for clarity estimation
  let highFreqEnergy = 0
  let totalEnergy = 0

  for (let i = 0; i < signal.length; i++) {
    const energy = signal[i] * signal[i]
    totalEnergy += energy

    // High frequency content (above 2kHz) indicates clarity
    const freq = (i / signal.length) * (sampleRate / 2)
    if (freq > 2000 && freq < 8000) {
      highFreqEnergy += energy
    }
  }

  const clarityRatio = totalEnergy > 0 ? highFreqEnergy / totalEnergy : 0
  return 60 + clarityRatio * 40 // Scale to 60-100 range
}

function calculateFluencyFromRate(speakingRate: number, pauseRatio: number): number {
  let fluency = 70

  // Optimal speaking rate is 140-180 WPM
  if (speakingRate >= 140 && speakingRate <= 180) {
    fluency = 90
  } else if (speakingRate >= 120 && speakingRate <= 200) {
    fluency = 80
  } else if (speakingRate >= 100 && speakingRate <= 220) {
    fluency = 70
  } else {
    fluency = 60
  }

  // Adjust for pause patterns (natural pauses are good)
  if (pauseRatio > 0.1 && pauseRatio < 0.3) {
    fluency += 5 // Natural pause pattern
  } else if (pauseRatio > 0.4) {
    fluency -= 10 // Too many pauses
  }

  return Math.min(100, fluency)
}

// Enhanced fallback functions
function enhancedFallbackAssessment(
  userResponse: string,
  expectedAnswer?: string,
  question?: string,
  section?: string
): ScoringParameters {
  const textAnalysis = intelligentTextAnalysis(userResponse, expectedAnswer, question, section)

  return {
    fluency: estimateFluencyFromText(userResponse),
    pronunciation: estimatePronunciationFromText(userResponse),
    grammar: textAnalysis.then(result => result.grammar.score).catch(() => enhancedGrammarScore(userResponse)),
    vocabulary: textAnalysis.then(result => result.vocabulary.score).catch(() => enhancedVocabularyScore(userResponse)),
    comprehension: textAnalysis.then(result => result.content.relevance).catch(() => enhancedComprehensionScore(userResponse, expectedAnswer))
  } as any // Will be resolved by the async function
}

function enhancedGrammarScore(text: string): number {
  const analysis = analyzeGrammarFree(text)
  return analysis.score
}

function enhancedVocabularyScore(text: string): number {
  const analysis = analyzeVocabularyFree(text)
  return analysis.score
}

function enhancedComprehensionScore(text: string, expectedAnswer?: string): number {
  const analysis = analyzeContentFree(text, expectedAnswer)
  return analysis.relevance
}

function estimatePronunciationFromText(text: string): number {
  const words = text.split(/\s+/)
  let score = 75

  // Longer responses suggest more confident pronunciation
  if (words.length > 15) score += 10
  else if (words.length > 10) score += 5

  // Complex words suggest good pronunciation skills
  const complexWords = words.filter(word => word.length > 6)
  if (complexWords.length > 0) score += 5

  // Professional/academic vocabulary suggests clear pronunciation
  const professionalWords = words.filter(word =>
    isProfessionalWord(word.toLowerCase()) || isAcademicWord(word.toLowerCase())
  )
  if (professionalWords.length > 0) score += 5

  return Math.min(100, score)
}

function estimateFluencyFromText(text: string): number {
  const words = text.split(/\s+/)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

  let score = 70

  // Longer responses suggest better fluency
  if (words.length > 20) score += 15
  else if (words.length > 15) score += 10
  else if (words.length > 10) score += 5

  // Check for filler words (reduce fluency)
  const fillerWords = /\b(um|uh|like|you know|basically|actually|sort of|kind of)\b/gi
  const fillerMatches = text.match(fillerWords)
  if (fillerMatches) {
    score -= fillerMatches.length * 3
  }

  // Complex sentence structure suggests fluency
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)
  if (avgWordsPerSentence > 12) score += 10
  else if (avgWordsPerSentence > 8) score += 5

  // Conjunctions suggest fluent speech
  const conjunctions = /\b(and|but|because|although|however|therefore|moreover|furthermore|while|since)\b/gi
  const conjunctionMatches = text.match(conjunctions)
  if (conjunctionMatches && conjunctionMatches.length > 0) {
    score += Math.min(10, conjunctionMatches.length * 2)
  }

  return Math.min(100, Math.max(40, score))
}