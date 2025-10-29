// Test session management with question set tracking
import { generateTestQuestions, type QuestionSet } from './question-bank'

export interface TestSession {
  id: string
  name: string
  status: 'not-started' | 'in-progress' | 'completed'
  totalScore?: number
  date: string
  sectionScores?: any[]
  responses?: any[]
  questionSets: { [section: string]: string } // Maps section to question set ID
  difficulty?: 'mixed' | 'easy' | 'medium' | 'hard'
}

export interface TestHistory {
  sessions: TestSession[]
  usedQuestionSets: string[] // Track which question sets have been used
  lastTestDate?: string
}

const STORAGE_KEY = 'versant_test_history'
const MAX_HISTORY_SIZE = 50 // Keep track of last 50 tests

export class TestSessionManager {
  private history: TestHistory

  constructor() {
    this.history = this.loadHistory()
  }

  private loadHistory(): TestHistory {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load test history:', error)
    }
    
    return {
      sessions: [],
      usedQuestionSets: []
    }
  }

  private saveHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.history))
    } catch (error) {
      console.warn('Failed to save test history:', error)
    }
  }

  createNewTestSession(difficulty: 'mixed' | 'easy' | 'medium' | 'hard' = 'mixed'): TestSession {
    // Get recently used question sets to avoid repetition
    const recentlyUsed = this.getRecentlyUsedQuestionSets()
    
    // Generate new question sets avoiding recently used ones
    const questionSets = generateTestQuestions(recentlyUsed)
    const questionSetIds = Object.fromEntries(
      Object.entries(questionSets).map(([section, set]) => [section, set.id])
    )

    const session: TestSession = {
      id: Date.now().toString(),
      name: `Mock Test - ${new Date().toLocaleDateString()}`,
      status: 'not-started',
      date: new Date().toISOString(),
      questionSets: questionSetIds,
      difficulty
    }

    // Add to history
    this.history.sessions.push(session)
    
    // Update used question sets
    Object.values(questionSetIds).forEach(setId => {
      if (!this.history.usedQuestionSets.includes(setId)) {
        this.history.usedQuestionSets.push(setId)
      }
    })

    // Keep history size manageable
    if (this.history.sessions.length > MAX_HISTORY_SIZE) {
      this.history.sessions = this.history.sessions.slice(-MAX_HISTORY_SIZE)
    }

    // Reset used question sets if we've used too many
    if (this.history.usedQuestionSets.length > 35) { // 5 sections × 7 sets = 35 total sets
      this.history.usedQuestionSets = this.history.usedQuestionSets.slice(-20) // Keep last 20
    }

    this.history.lastTestDate = new Date().toISOString()
    this.saveHistory()

    return session
  }

  updateTestSession(sessionId: string, updates: Partial<TestSession>): void {
    const sessionIndex = this.history.sessions.findIndex(s => s.id === sessionId)
    if (sessionIndex !== -1) {
      this.history.sessions[sessionIndex] = {
        ...this.history.sessions[sessionIndex],
        ...updates
      }
      this.saveHistory()
    }
  }

  getTestSession(sessionId: string): TestSession | null {
    return this.history.sessions.find(s => s.id === sessionId) || null
  }

  getAllTestSessions(): TestSession[] {
    return [...this.history.sessions].reverse() // Most recent first
  }

  getCompletedTestSessions(): TestSession[] {
    return this.history.sessions.filter(s => s.status === 'completed')
  }

  getTestStatistics() {
    const completed = this.getCompletedTestSessions()
    const totalTests = completed.length
    
    if (totalTests === 0) {
      return {
        totalTests: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        recentTrend: 'stable',
        improvementRate: 0
      }
    }

    const scores = completed.map(s => s.totalScore || 0)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalTests
    const highestScore = Math.max(...scores)
    const lowestScore = Math.min(...scores)

    // Calculate recent trend (last 5 tests vs previous 5)
    let recentTrend: 'improving' | 'declining' | 'stable' = 'stable'
    let improvementRate = 0

    if (totalTests >= 6) {
      const recent5 = scores.slice(-5)
      const previous5 = scores.slice(-10, -5)
      
      const recentAvg = recent5.reduce((sum, score) => sum + score, 0) / recent5.length
      const previousAvg = previous5.reduce((sum, score) => sum + score, 0) / previous5.length
      
      improvementRate = ((recentAvg - previousAvg) / previousAvg) * 100
      
      if (improvementRate > 2) recentTrend = 'improving'
      else if (improvementRate < -2) recentTrend = 'declining'
    }

    return {
      totalTests,
      averageScore: Math.round(averageScore),
      highestScore,
      lowestScore,
      recentTrend,
      improvementRate: Math.round(improvementRate)
    }
  }

  private getRecentlyUsedQuestionSets(): string[] {
    // Get question sets used in the last 5 tests to ensure better variety
    const recentSessions = this.history.sessions.slice(-5)
    const recentSets: string[] = []
    
    recentSessions.forEach(session => {
      if (session.questionSets) {
        Object.values(session.questionSets).forEach(setId => {
          if (!recentSets.includes(setId)) {
            recentSets.push(setId)
          }
        })
      }
    })
    
    return recentSets
  }

  getQuestionSetUsageStats() {
    const usage: { [setId: string]: number } = {}
    
    this.history.sessions.forEach(session => {
      Object.values(session.questionSets).forEach(setId => {
        usage[setId] = (usage[setId] || 0) + 1
      })
    })
    
    return usage
  }

  resetHistory(): void {
    this.history = {
      sessions: [],
      usedQuestionSets: []
    }
    this.saveHistory()
  }

  exportHistory(): string {
    return JSON.stringify(this.history, null, 2)
  }

  importHistory(historyJson: string): boolean {
    try {
      const imported = JSON.parse(historyJson)
      if (imported.sessions && Array.isArray(imported.sessions)) {
        this.history = imported
        this.saveHistory()
        return true
      }
    } catch (error) {
      console.error('Failed to import history:', error)
    }
    return false
  }

  // Get personalized question recommendations based on performance
  getPersonalizedQuestionSets(weakAreas: string[] = []): { [section: string]: string[] } {
    const usage = this.getQuestionSetUsageStats()
    const recommendations: { [section: string]: string[] } = {}
    
    // For each section, recommend less-used question sets
    const sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    
    sections.forEach(section => {
      const sectionSets = Object.keys(usage).filter(setId => setId.startsWith(`set_${section.toLowerCase()}`))
      
      // Sort by usage (ascending) to recommend less-used sets
      const sortedSets = sectionSets.sort((a, b) => (usage[a] || 0) - (usage[b] || 0))
      
      recommendations[section] = sortedSets.slice(0, 3) // Top 3 recommendations
    })
    
    return recommendations
  }

  // Check if user should get a different difficulty level
  shouldAdjustDifficulty(): { suggested: 'easy' | 'medium' | 'hard'; reason: string } | null {
    const stats = this.getTestStatistics()
    
    if (stats.totalTests < 3) return null // Need more data
    
    if (stats.averageScore >= 85 && stats.recentTrend === 'improving') {
      return {
        suggested: 'hard',
        reason: 'Your performance is excellent! Try harder questions for more challenge.'
      }
    }
    
    if (stats.averageScore <= 60 && stats.recentTrend === 'declining') {
      return {
        suggested: 'easy',
        reason: 'Consider starting with easier questions to build confidence.'
      }
    }
    
    if (stats.averageScore >= 70 && stats.averageScore < 85) {
      return {
        suggested: 'medium',
        reason: 'You\'re doing well! Medium difficulty questions will help you improve further.'
      }
    }
    
    return null
  }
}

// Singleton instance
let sessionManager: TestSessionManager | null = null

export function getTestSessionManager(): TestSessionManager {
  if (!sessionManager) {
    sessionManager = new TestSessionManager()
  }
  return sessionManager
}

// React hook for easy integration
export function useTestSessionManager() {
  const manager = getTestSessionManager()
  
  const createNewTest = (difficulty?: 'mixed' | 'easy' | 'medium' | 'hard') => {
    return manager.createNewTestSession(difficulty)
  }
  
  const updateTest = (sessionId: string, updates: Partial<TestSession>) => {
    manager.updateTestSession(sessionId, updates)
  }
  
  const getTest = (sessionId: string) => {
    return manager.getTestSession(sessionId)
  }
  
  const getAllTests = () => {
    return manager.getAllTestSessions()
  }
  
  const getStats = () => {
    return manager.getTestStatistics()
  }
  
  const getRecommendations = () => {
    return manager.getPersonalizedQuestionSets()
  }
  
  const getDifficultyAdvice = () => {
    return manager.shouldAdjustDifficulty()
  }
  
  return {
    createNewTest,
    updateTest,
    getTest,
    getAllTests,
    getStats,
    getRecommendations,
    getDifficultyAdvice,
    resetHistory: () => manager.resetHistory(),
    exportHistory: () => manager.exportHistory(),
    importHistory: (json: string) => manager.importHistory(json)
  }
}