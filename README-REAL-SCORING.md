# Real Speech Scoring Implementation

This document explains how to implement real speech analysis and scoring in your Versant Practice application.

## Overview

The application now includes comprehensive real-time speech analysis with:

1. **Speech-to-Text APIs** (Google Cloud Speech, Azure Speech, AWS Transcribe)
2. **Audio Analysis** for pronunciation and fluency
3. **NLP Processing** for grammar and vocabulary assessment
4. **Real-time Audio Processing** for pause detection, speaking rate, etc.

## Architecture

```
Audio Input → Real-time STT → Audio Analysis → NLP Analysis → Combined Scoring
     ↓              ↓              ↓              ↓              ↓
  MediaRecorder  Transcription  Audio Metrics  Grammar/Vocab  Final Score
```

## Setup Instructions

### 1. API Keys Configuration

Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Required API keys:
- **Google Cloud Speech API**: For speech-to-text transcription
- **SpeechAce API**: For pronunciation analysis
- **OpenAI API**: For advanced NLP analysis
- **LanguageTool API**: For grammar checking

### 2. Google Cloud Speech Setup

1. Create a Google Cloud project
2. Enable the Speech-to-Text API
3. Create a service account and download credentials
4. Add your API key to `.env.local`

```javascript
// Example usage
const sttService = new SpeechToTextService({
  provider: 'google',
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_STT_API_KEY,
  language: 'en-US',
  enableWordTimings: true,
  enableProfanityFilter: false
})
```

### 3. SpeechAce Pronunciation Analysis

1. Sign up at [SpeechAce](https://www.speechace.co/)
2. Get your API key
3. Add to environment variables

```javascript
const pronunciationAnalyzer = new PronunciationAnalyzer(
  process.env.NEXT_PUBLIC_SPEECHACE_API_KEY,
  'speechace'
)
```

### 4. Azure Speech Service (Alternative)

1. Create Azure Cognitive Services resource
2. Get subscription key and region
3. Configure in environment

## Implementation Details

### Real-time Speech-to-Text

The `RealTimeSpeechToText` class provides multiple provider support:

```typescript
const realTimeSTT = new RealTimeSpeechToText({
  provider: 'google',
  realTimeProvider: 'webspeech', // fallback
  apiKey: 'your-api-key',
  language: 'en-US',
  onInterimResult: (text) => console.log('Interim:', text),
  onFinalResult: (text) => console.log('Final:', text),
  onError: (error) => console.error('STT Error:', error)
})
```

### Audio Analysis

The `AudioAnalyzer` class processes real-time audio for:
- Speaking rate (words per minute)
- Pause detection and analysis
- Volume variation
- Speech/silence ratio

```typescript
const audioAnalyzer = new AudioAnalyzer()
await audioAnalyzer.initialize(mediaStream)
audioAnalyzer.startAnalysis()

// Get metrics when done
const metrics = audioAnalyzer.stopAnalysis()
```

### Pronunciation Analysis

Multiple providers supported:

```typescript
// SpeechAce (recommended)
const analysis = await pronunciationAnalyzer.analyzePronunciation(
  audioBlob, 
  referenceText, 
  'en'
)

// Returns detailed phoneme-level feedback
console.log(analysis.overallScore) // 0-100
console.log(analysis.detailedFeedback) // Per-word analysis
```

### NLP Analysis

Comprehensive text analysis:

```typescript
const nlpAnalyzer = new NLPAnalyzer(
  languageToolApiKey,
  openaiApiKey
)

const [grammar, vocabulary, content] = await Promise.all([
  nlpAnalyzer.analyzeGrammar(text),
  nlpAnalyzer.analyzeVocabulary(text),
  nlpAnalyzer.analyzeContent(text, expectedAnswer, question)
])
```

### Enhanced Recording Component

Use the new `EnhancedRecording` component for better user experience:

```tsx
<EnhancedRecording
  question="Tell me about yourself"
  expectedAnswer="professional background, skills, goals"
  timeLimit={30}
  onComplete={(audioBlob, transcription, metrics) => {
    // Process the recording with real analysis
    handleRealScoring(audioBlob, transcription, metrics)
  }}
/>
```

## Scoring Algorithm

The new scoring system combines multiple analysis results:

```typescript
async function assessResponse(
  section: string,
  userResponse: string,
  audioBlob?: Blob,
  expectedAnswer?: string,
  question?: string
): Promise<ScoringParameters> {
  // 1. NLP Analysis (grammar, vocabulary, content)
  const nlpResult = await assessWithNLP(userResponse, expectedAnswer, question)
  
  // 2. Pronunciation Analysis (if audio available)
  const pronunciationResult = audioBlob ? 
    await assessWithPronunciation(audioBlob, userResponse) : null
  
  // 3. Audio Analysis (speaking rate, pauses, etc.)
  const audioResult = await assessWithAudioAnalysis(audioBlob)
  
  // 4. Combine all results
  return combineAssessmentResults(nlpResult, pronunciationResult, audioResult)
}
```

## Performance Considerations

### Optimization Tips

1. **Chunked Processing**: Process audio in small chunks for real-time feedback
2. **Caching**: Cache API responses for repeated content
3. **Fallbacks**: Always provide fallback scoring when APIs fail
4. **Rate Limiting**: Implement proper rate limiting for API calls

### Error Handling

```typescript
try {
  const result = await sttService.transcribeAudio(audioBlob)
} catch (error) {
  // Fallback to simulated scoring
  console.warn('STT failed, using fallback:', error)
  return fallbackAssessment(userResponse)
}
```

## Testing

### Unit Tests

Test individual components:

```typescript
// Test pronunciation analysis
const mockAudioBlob = new Blob(['mock audio'], { type: 'audio/wav' })
const result = await pronunciationAnalyzer.analyzePronunciation(
  mockAudioBlob, 
  'hello world'
)
expect(result.overallScore).toBeGreaterThan(0)
```

### Integration Tests

Test the complete flow:

```typescript
// Test complete assessment pipeline
const assessment = await assessResponse(
  'A',
  'I am a software developer',
  mockAudioBlob,
  'professional background'
)
expect(assessment.grammar).toBeGreaterThan(50)
```

## Deployment

### Environment Variables

Ensure all API keys are properly set in production:

```bash
# Vercel deployment
vercel env add NEXT_PUBLIC_GOOGLE_STT_API_KEY
vercel env add NEXT_PUBLIC_SPEECHACE_API_KEY
# ... other keys
```

### CORS Configuration

Configure CORS for API endpoints:

```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ]
  },
}
```

## Cost Optimization

### API Usage Monitoring

1. **Google Cloud Speech**: ~$0.006 per 15 seconds
2. **SpeechAce**: ~$0.01 per assessment
3. **OpenAI**: ~$0.002 per 1K tokens

### Optimization Strategies

1. Use shorter audio clips for practice
2. Implement client-side pre-filtering
3. Cache common assessments
4. Use free tiers effectively

## Troubleshooting

### Common Issues

1. **Microphone Access**: Ensure HTTPS for production
2. **API Rate Limits**: Implement exponential backoff
3. **Audio Format**: Ensure compatible formats (WebM, WAV)
4. **CORS Errors**: Configure proper headers

### Debug Mode

Enable debug logging:

```typescript
const sttService = new SpeechToTextService({
  // ... config
  debug: process.env.NODE_ENV === 'development'
})
```

## Next Steps

1. **Machine Learning**: Train custom models for domain-specific scoring
2. **Advanced Analytics**: Add detailed performance tracking
3. **Adaptive Testing**: Adjust difficulty based on performance
4. **Multi-language Support**: Extend to other languages

## Support

For implementation help:
1. Check the example components in `/components/test/`
2. Review the library files in `/lib/`
3. Test with the enhanced recording component
4. Monitor API usage and costs

The system now provides real, accurate speech assessment instead of simulated scoring!