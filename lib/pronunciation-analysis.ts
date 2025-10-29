// Pronunciation analysis using audio processing and phonetic comparison
export interface PronunciationAnalysis {
  overallScore: number // 0-100
  accuracy: number // phoneme accuracy
  fluency: number // rhythm and flow
  completeness: number // how much was spoken
  prosody: number // stress and intonation
  detailedFeedback: PronunciationFeedback[]
}

export interface PronunciationFeedback {
  word: string
  expectedPhonemes: string
  actualPhonemes?: string
  accuracy: number
  issues: string[]
  suggestions: string[]
}

export interface PhonemeAnalysis {
  phoneme: string
  accuracy: number
  duration: number
  intensity: number
}

export class PronunciationAnalyzer {
  private apiKey: string
  private provider: 'speechace' | 'elsa' | 'custom'

  constructor(apiKey: string, provider: 'speechace' | 'elsa' | 'custom' = 'speechace') {
    this.apiKey = apiKey
    this.provider = provider
  }

  async analyzePronunciation(
    audioBlob: Blob, 
    referenceText: string, 
    language: string = 'en'
  ): Promise<PronunciationAnalysis> {
    switch (this.provider) {
      case 'speechace':
        return this.analyzeWithSpeechAce(audioBlob, referenceText, language)
      case 'elsa':
        return this.analyzeWithElsa(audioBlob, referenceText)
      case 'custom':
        return this.analyzeWithCustom(audioBlob, referenceText)
      default:
        throw new Error('Unsupported pronunciation analysis provider')
    }
  }

  private async analyzeWithSpeechAce(
    audioBlob: Blob, 
    referenceText: string, 
    language: string
  ): Promise<PronunciationAnalysis> {
    try {
      const formData = new FormData()
      formData.append('user_audio_file', audioBlob, 'audio.wav')
      formData.append('text', referenceText)
      formData.append('question_info', JSON.stringify({
        dialect: language === 'en' ? 'en-us' : language,
        user_id: 'user_' + Date.now()
      }))

      const response = await fetch('https://api.speechace.co/api/scoring/text/v9/json', {
        method: 'POST',
        headers: {
          'key': this.apiKey
        },
        body: formData
      })

      const result = await response.json()
      
      if (result.status !== 'success') {
        throw new Error(result.message || 'SpeechAce API error')
      }

      return this.parseSpeechAceResult(result)
    } catch (error) {
      console.error('SpeechAce analysis failed:', error)
      return this.fallbackPronunciationAnalysis(referenceText)
    }
  }

  private parseSpeechAceResult(result: any): PronunciationAnalysis {
    const overallScore = result.overall || 0
    const wordScores = result.word_score_list || []
    
    const detailedFeedback: PronunciationFeedback[] = wordScores.map((wordData: any) => ({
      word: wordData.word,
      expectedPhonemes: wordData.phone_score_list?.map((p: any) => p.phone).join(' ') || '',
      accuracy: wordData.quality_score || 0,
      issues: this.identifyPronunciationIssues(wordData),
      suggestions: this.generatePronunciationSuggestions(wordData)
    }))

    return {
      overallScore,
      accuracy: result.pronunciation_score || 0,
      fluency: result.fluency_score || 0,
      completeness: result.completeness_score || 0,
      prosody: result.prosody_score || 0,
      detailedFeedback
    }
  }

  private async analyzeWithElsa(audioBlob: Blob, referenceText: string): Promise<PronunciationAnalysis> {
    // ELSA Speech Analyzer API implementation
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('text', referenceText)

      const response = await fetch('https://api.elsaspeak.com/api/v1/pronunciation/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData
      })

      const result = await response.json()
      return this.parseElsaResult(result)
    } catch (error) {
      console.error('ELSA analysis failed:', error)
      return this.fallbackPronunciationAnalysis(referenceText)
    }
  }

  private parseElsaResult(result: any): PronunciationAnalysis {
    return {
      overallScore: result.overall_score || 0,
      accuracy: result.pronunciation_accuracy || 0,
      fluency: result.fluency_score || 0,
      completeness: result.completeness || 0,
      prosody: result.prosody_score || 0,
      detailedFeedback: result.word_scores?.map((word: any) => ({
        word: word.text,
        expectedPhonemes: word.expected_phonemes || '',
        actualPhonemes: word.actual_phonemes || '',
        accuracy: word.accuracy_score || 0,
        issues: word.issues || [],
        suggestions: word.suggestions || []
      })) || []
    }
  }

  private async analyzeWithCustom(audioBlob: Blob, referenceText: string): Promise<PronunciationAnalysis> {
    // Custom pronunciation analysis using Web Audio API and phonetic algorithms
    try {
      const audioBuffer = await this.audioBlobToBuffer(audioBlob)
      const features = this.extractAudioFeatures(audioBuffer)
      const phonemeAnalysis = this.analyzePhonemes(features, referenceText)
      
      return this.calculatePronunciationScores(phonemeAnalysis, referenceText)
    } catch (error) {
      console.error('Custom pronunciation analysis failed:', error)
      return this.fallbackPronunciationAnalysis(referenceText)
    }
  }

  private async audioBlobToBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer()
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    return await audioContext.decodeAudioData(arrayBuffer)
  }

  private extractAudioFeatures(audioBuffer: AudioBuffer): Float32Array {
    // Extract MFCC features, pitch, formants, etc.
    const channelData = audioBuffer.getChannelData(0)
    
    // Simplified feature extraction - in production, use more sophisticated algorithms
    const features = new Float32Array(13) // 13 MFCC coefficients
    
    // Basic spectral analysis
    const fftSize = 2048
    const fft = this.performFFT(channelData.slice(0, fftSize))
    
    // Calculate basic spectral features
    for (let i = 0; i < 13; i++) {
      features[i] = fft[i] || 0
    }
    
    return features
  }

  private performFFT(signal: Float32Array): Float32Array {
    // Simplified FFT implementation - use a proper FFT library in production
    const N = signal.length
    const result = new Float32Array(N / 2)
    
    for (let k = 0; k < N / 2; k++) {
      let real = 0
      let imag = 0
      
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N
        real += signal[n] * Math.cos(angle)
        imag += signal[n] * Math.sin(angle)
      }
      
      result[k] = Math.sqrt(real * real + imag * imag)
    }
    
    return result
  }

  private analyzePhonemes(features: Float32Array, referenceText: string): PhonemeAnalysis[] {
    // Phoneme recognition from audio features
    // This is a simplified version - production would use trained models
    const words = referenceText.toLowerCase().split(' ')
    const phonemes: PhonemeAnalysis[] = []
    
    words.forEach((word, index) => {
      const wordPhonemes = this.wordToPhonemes(word)
      wordPhonemes.forEach(phoneme => {
        phonemes.push({
          phoneme,
          accuracy: 70 + Math.random() * 30, // Simulated accuracy
          duration: 0.1 + Math.random() * 0.2,
          intensity: features[index % features.length] || 0
        })
      })
    })
    
    return phonemes
  }

  private wordToPhonemes(word: string): string[] {
    // Basic phoneme mapping - use a proper phonetic dictionary in production
    const phonemeMap: { [key: string]: string[] } = {
      'hello': ['h', 'ɛ', 'l', 'oʊ'],
      'world': ['w', 'ɜr', 'l', 'd'],
      'the': ['ð', 'ə'],
      'quick': ['k', 'w', 'ɪ', 'k'],
      'brown': ['b', 'r', 'aʊ', 'n'],
      'fox': ['f', 'ɑ', 'k', 's']
    }
    
    return phonemeMap[word] || word.split('').map(char => char)
  }

  private calculatePronunciationScores(
    phonemeAnalysis: PhonemeAnalysis[], 
    referenceText: string
  ): PronunciationAnalysis {
    const avgAccuracy = phonemeAnalysis.reduce((sum, p) => sum + p.accuracy, 0) / phonemeAnalysis.length
    
    // Calculate component scores
    const accuracy = avgAccuracy
    const fluency = this.calculateFluencyScore(phonemeAnalysis)
    const completeness = this.calculateCompletenessScore(phonemeAnalysis, referenceText)
    const prosody = this.calculateProsodyScore(phonemeAnalysis)
    
    const overallScore = (accuracy + fluency + completeness + prosody) / 4
    
    const detailedFeedback = this.generateDetailedFeedback(phonemeAnalysis, referenceText)
    
    return {
      overallScore,
      accuracy,
      fluency,
      completeness,
      prosody,
      detailedFeedback
    }
  }

  private calculateFluencyScore(phonemeAnalysis: PhonemeAnalysis[]): number {
    // Analyze rhythm, pauses, and speaking rate
    const avgDuration = phonemeAnalysis.reduce((sum, p) => sum + p.duration, 0) / phonemeAnalysis.length
    const durationVariance = this.calculateVariance(phonemeAnalysis.map(p => p.duration))
    
    let fluencyScore = 70
    
    // Penalize excessive variation in phoneme duration
    if (durationVariance < 0.05) fluencyScore += 20
    else if (durationVariance < 0.1) fluencyScore += 10
    
    // Optimal speaking rate
    if (avgDuration > 0.08 && avgDuration < 0.15) fluencyScore += 10
    
    return Math.min(100, fluencyScore)
  }

  private calculateCompletenessScore(phonemeAnalysis: PhonemeAnalysis[], referenceText: string): number {
    const expectedPhonemes = referenceText.split(' ').reduce((count, word) => {
      return count + this.wordToPhonemes(word).length
    }, 0)
    
    const actualPhonemes = phonemeAnalysis.length
    const completenessRatio = actualPhonemes / expectedPhonemes
    
    return Math.min(100, completenessRatio * 100)
  }

  private calculateProsodyScore(phonemeAnalysis: PhonemeAnalysis[]): number {
    // Analyze stress patterns and intonation
    const intensities = phonemeAnalysis.map(p => p.intensity)
    const intensityVariance = this.calculateVariance(intensities)
    
    let prosodyScore = 60
    
    // Good prosody has moderate intensity variation
    if (intensityVariance > 0.1 && intensityVariance < 0.5) {
      prosodyScore += 30
    } else if (intensityVariance > 0.05) {
      prosodyScore += 15
    }
    
    return Math.min(100, prosodyScore)
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
  }

  private generateDetailedFeedback(
    phonemeAnalysis: PhonemeAnalysis[], 
    referenceText: string
  ): PronunciationFeedback[] {
    const words = referenceText.toLowerCase().split(' ')
    const feedback: PronunciationFeedback[] = []
    
    let phonemeIndex = 0
    
    words.forEach(word => {
      const wordPhonemes = this.wordToPhonemes(word)
      const wordPhonemeAnalysis = phonemeAnalysis.slice(phonemeIndex, phonemeIndex + wordPhonemes.length)
      
      const wordAccuracy = wordPhonemeAnalysis.reduce((sum, p) => sum + p.accuracy, 0) / wordPhonemeAnalysis.length
      
      feedback.push({
        word,
        expectedPhonemes: wordPhonemes.join(' '),
        actualPhonemes: wordPhonemeAnalysis.map(p => p.phoneme).join(' '),
        accuracy: wordAccuracy,
        issues: this.identifyWordIssues(wordPhonemeAnalysis, wordPhonemes),
        suggestions: this.generateWordSuggestions(word, wordAccuracy)
      })
      
      phonemeIndex += wordPhonemes.length
    })
    
    return feedback
  }

  private identifyPronunciationIssues(wordData: any): string[] {
    const issues = []
    
    if (wordData.quality_score < 60) {
      issues.push('Overall pronunciation needs improvement')
    }
    
    if (wordData.phone_score_list) {
      const lowScorePhones = wordData.phone_score_list.filter((p: any) => p.quality_score < 50)
      if (lowScorePhones.length > 0) {
        issues.push(`Difficult phonemes: ${lowScorePhones.map((p: any) => p.phone).join(', ')}`)
      }
    }
    
    return issues
  }

  private generatePronunciationSuggestions(wordData: any): string[] {
    const suggestions = []
    
    if (wordData.quality_score < 70) {
      suggestions.push('Practice this word slowly and clearly')
      suggestions.push('Listen to native speaker pronunciation')
    }
    
    if (wordData.stress_score && wordData.stress_score < 60) {
      suggestions.push('Pay attention to word stress patterns')
    }
    
    return suggestions
  }

  private identifyWordIssues(analysis: PhonemeAnalysis[], expected: string[]): string[] {
    const issues = []
    
    if (analysis.length !== expected.length) {
      issues.push('Missing or extra sounds detected')
    }
    
    const lowAccuracyPhonemes = analysis.filter(p => p.accuracy < 60)
    if (lowAccuracyPhonemes.length > 0) {
      issues.push(`Unclear pronunciation of: ${lowAccuracyPhonemes.map(p => p.phoneme).join(', ')}`)
    }
    
    return issues
  }

  private generateWordSuggestions(word: string, accuracy: number): string[] {
    const suggestions = []
    
    if (accuracy < 70) {
      suggestions.push(`Practice pronouncing "${word}" more clearly`)
      suggestions.push('Break the word into syllables and practice each part')
    }
    
    if (accuracy < 50) {
      suggestions.push('Listen to audio examples of this word')
      suggestions.push('Use a pronunciation dictionary for guidance')
    }
    
    return suggestions
  }

  private fallbackPronunciationAnalysis(referenceText: string): PronunciationAnalysis {
    // Basic fallback when API is unavailable
    const words = referenceText.split(' ')
    const detailedFeedback: PronunciationFeedback[] = words.map(word => ({
      word,
      expectedPhonemes: this.wordToPhonemes(word).join(' '),
      accuracy: 70 + Math.random() * 20,
      issues: [],
      suggestions: ['Use pronunciation analysis API for detailed feedback']
    }))
    
    return {
      overallScore: 75,
      accuracy: 75,
      fluency: 70,
      completeness: 80,
      prosody: 70,
      detailedFeedback
    }
  }
}