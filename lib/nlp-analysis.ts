// NLP Analysis for grammar, vocabulary, and content assessment
export interface GrammarAnalysis {
  score: number // 0-100
  errors: GrammarError[]
  suggestions: string[]
  complexity: number // sentence complexity score
}

export interface GrammarError {
  type: 'grammar' | 'spelling' | 'punctuation' | 'syntax'
  message: string
  position: { start: number; end: number }
  suggestions: string[]
  severity: 'low' | 'medium' | 'high'
}

export interface VocabularyAnalysis {
  score: number // 0-100
  uniqueWords: number
  totalWords: number
  averageWordLength: number
  complexWords: string[]
  readabilityScore: number
  lexicalDiversity: number
}

export interface ContentAnalysis {
  relevance: number // 0-100 - how relevant to the question
  completeness: number // 0-100 - how complete the answer is
  coherence: number // 0-100 - logical flow
  keyPoints: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}

export class NLPAnalyzer {
  private grammarApiKey: string
  private openaiApiKey?: string

  constructor(grammarApiKey: string, openaiApiKey?: string) {
    this.grammarApiKey = grammarApiKey
    this.openaiApiKey = openaiApiKey
  }

  async analyzeGrammar(text: string): Promise<GrammarAnalysis> {
    try {
      // Using LanguageTool API for grammar checking
      const response = await fetch('https://api.languagetool.org/v2/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          language: 'en-US',
          enabledOnly: 'false'
        })
      })

      const result = await response.json()
      
      const errors: GrammarError[] = result.matches?.map((match: any) => ({
        type: this.categorizeError(match.rule.category.id),
        message: match.message,
        position: { start: match.offset, end: match.offset + match.length },
        suggestions: match.replacements?.map((r: any) => r.value) || [],
        severity: this.getSeverity(match.rule.category.id)
      })) || []

      const score = this.calculateGrammarScore(text, errors)
      const complexity = this.calculateComplexity(text)

      return {
        score,
        errors,
        suggestions: this.generateGrammarSuggestions(errors),
        complexity
      }
    } catch (error) {
      console.error('Grammar analysis failed:', error)
      return this.fallbackGrammarAnalysis(text)
    }
  }

  async analyzeVocabulary(text: string): Promise<VocabularyAnalysis> {
    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    const uniqueWords = new Set(words).size
    const totalWords = words.length
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / totalWords

    // Complex words (3+ syllables or 7+ characters)
    const complexWords = words.filter(word => 
      word.length >= 7 || this.estimateSyllables(word) >= 3
    )

    const lexicalDiversity = uniqueWords / totalWords
    const readabilityScore = this.calculateReadabilityScore(text)
    
    const score = this.calculateVocabularyScore({
      uniqueWords,
      totalWords,
      averageWordLength,
      complexWords: complexWords.length,
      lexicalDiversity,
      readabilityScore
    })

    return {
      score,
      uniqueWords,
      totalWords,
      averageWordLength,
      complexWords: [...new Set(complexWords)],
      readabilityScore,
      lexicalDiversity
    }
  }

  async analyzeContent(text: string, expectedAnswer?: string, question?: string): Promise<ContentAnalysis> {
    if (this.openaiApiKey && question) {
      return this.analyzeContentWithAI(text, question, expectedAnswer)
    }
    
    return this.analyzeContentBasic(text, expectedAnswer)
  }

  private async analyzeContentWithAI(text: string, question: string, expectedAnswer?: string): Promise<ContentAnalysis> {
    try {
      const prompt = `
        Analyze this response to the question: "${question}"
        Response: "${text}"
        ${expectedAnswer ? `Expected elements: "${expectedAnswer}"` : ''}
        
        Rate the response on:
        1. Relevance (0-100): How well does it answer the question?
        2. Completeness (0-100): How complete is the answer?
        3. Coherence (0-100): How logical and well-structured is it?
        
        Also identify:
        - Key points mentioned
        - Overall sentiment (positive/neutral/negative)
        
        Respond in JSON format:
        {
          "relevance": number,
          "completeness": number,
          "coherence": number,
          "keyPoints": string[],
          "sentiment": string
        }
      `

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        })
      })

      const result = await response.json()
      const analysis = JSON.parse(result.choices[0].message.content)
      
      return analysis
    } catch (error) {
      console.error('AI content analysis failed:', error)
      return this.analyzeContentBasic(text, expectedAnswer)
    }
  }

  private analyzeContentBasic(text: string, expectedAnswer?: string): ContentAnalysis {
    const words = text.toLowerCase().split(/\s+/)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    let relevance = 60
    let completeness = 50
    let coherence = 60

    // Basic relevance check
    if (expectedAnswer) {
      const expectedWords = expectedAnswer.toLowerCase().split(/\s+/)
      const matchingWords = expectedWords.filter(word => 
        words.some(w => w.includes(word) || word.includes(w))
      )
      relevance = Math.min(100, 40 + (matchingWords.length / expectedWords.length) * 60)
    }

    // Completeness based on length and structure
    if (words.length > 20) completeness += 30
    else if (words.length > 10) completeness += 20
    else if (words.length > 5) completeness += 10

    if (sentences.length > 2) completeness += 20

    // Coherence based on connectors and structure
    const connectors = ['because', 'therefore', 'however', 'moreover', 'furthermore', 'additionally']
    const hasConnectors = connectors.some(connector => text.toLowerCase().includes(connector))
    if (hasConnectors) coherence += 20

    if (sentences.length > 1) coherence += 10

    return {
      relevance: Math.min(100, relevance),
      completeness: Math.min(100, completeness),
      coherence: Math.min(100, coherence),
      keyPoints: this.extractKeyPoints(text),
      sentiment: this.analyzeSentiment(text)
    }
  }

  private categorizeError(categoryId: string): GrammarError['type'] {
    if (categoryId.includes('GRAMMAR')) return 'grammar'
    if (categoryId.includes('TYPOS')) return 'spelling'
    if (categoryId.includes('PUNCTUATION')) return 'punctuation'
    return 'syntax'
  }

  private getSeverity(categoryId: string): GrammarError['severity'] {
    if (categoryId.includes('GRAMMAR')) return 'high'
    if (categoryId.includes('STYLE')) return 'low'
    return 'medium'
  }

  private calculateGrammarScore(text: string, errors: GrammarError[]): number {
    const words = text.split(/\s+/).length
    const errorPenalty = errors.reduce((penalty, error) => {
      switch (error.severity) {
        case 'high': return penalty + 10
        case 'medium': return penalty + 5
        case 'low': return penalty + 2
        default: return penalty
      }
    }, 0)

    const baseScore = 100
    const penaltyPerWord = errorPenalty / Math.max(words, 1) * 10
    return Math.max(0, Math.min(100, baseScore - penaltyPerWord))
  }

  private calculateComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.split(/\s+/)
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)
    
    // Complexity based on sentence length and vocabulary
    let complexity = 50
    if (avgWordsPerSentence > 15) complexity += 30
    else if (avgWordsPerSentence > 10) complexity += 20
    else if (avgWordsPerSentence > 7) complexity += 10

    return Math.min(100, complexity)
  }

  private calculateVocabularyScore(metrics: {
    uniqueWords: number
    totalWords: number
    averageWordLength: number
    complexWords: number
    lexicalDiversity: number
    readabilityScore: number
  }): number {
    let score = 50

    // Lexical diversity bonus
    if (metrics.lexicalDiversity > 0.7) score += 25
    else if (metrics.lexicalDiversity > 0.5) score += 15
    else if (metrics.lexicalDiversity > 0.3) score += 10

    // Average word length bonus
    if (metrics.averageWordLength > 6) score += 15
    else if (metrics.averageWordLength > 5) score += 10
    else if (metrics.averageWordLength > 4) score += 5

    // Complex words bonus
    const complexWordRatio = metrics.complexWords / metrics.totalWords
    if (complexWordRatio > 0.3) score += 10
    else if (complexWordRatio > 0.2) score += 5

    return Math.min(100, score)
  }

  private calculateReadabilityScore(text: string): number {
    // Simplified Flesch Reading Ease
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const words = text.split(/\s+/).length
    const syllables = text.split(/\s+/).reduce((count, word) => count + this.estimateSyllables(word), 0)

    if (sentences === 0 || words === 0) return 0

    const avgSentenceLength = words / sentences
    const avgSyllablesPerWord = syllables / words

    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
  }

  private estimateSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    const vowels = word.match(/[aeiouy]+/g)
    let syllableCount = vowels ? vowels.length : 1
    
    if (word.endsWith('e')) syllableCount--
    if (syllableCount === 0) syllableCount = 1
    
    return syllableCount
  }

  private generateGrammarSuggestions(errors: GrammarError[]): string[] {
    const suggestions = []
    
    if (errors.some(e => e.type === 'grammar')) {
      suggestions.push('Review basic grammar rules for tenses and sentence structure')
    }
    
    if (errors.some(e => e.type === 'spelling')) {
      suggestions.push('Use spell-check tools and practice common word spellings')
    }
    
    if (errors.some(e => e.type === 'punctuation')) {
      suggestions.push('Pay attention to proper punctuation usage')
    }

    return suggestions
  }

  private extractKeyPoints(text: string): string[] {
    // Simple key point extraction based on sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    return sentences
      .filter(sentence => sentence.trim().length > 20)
      .map(sentence => sentence.trim())
      .slice(0, 3) // Top 3 key points
  }

  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'enjoy']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'horrible', 'worst', 'difficult', 'problem']
    
    const words = text.toLowerCase().split(/\s+/)
    const positiveCount = words.filter(word => positiveWords.includes(word)).length
    const negativeCount = words.filter(word => negativeWords.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private fallbackGrammarAnalysis(text: string): GrammarAnalysis {
    // Basic grammar analysis without external API
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.split(/\s+/)
    
    const errors: GrammarError[] = []
    
    // Basic checks
    if (!text.match(/^[A-Z]/)) {
      errors.push({
        type: 'grammar',
        message: 'Sentence should start with a capital letter',
        position: { start: 0, end: 1 },
        suggestions: [text.charAt(0).toUpperCase() + text.slice(1)],
        severity: 'medium'
      })
    }

    const score = Math.max(50, 100 - (errors.length * 10))
    
    return {
      score,
      errors,
      suggestions: ['Consider using grammar checking tools for detailed analysis'],
      complexity: this.calculateComplexity(text)
    }
  }
}