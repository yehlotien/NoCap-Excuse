import { useState } from 'react'

const STEPS = { IDLE: 'idle', LOADING_EXCUSES: 'loading_excuses', EXCUSES: 'excuses', LOADING_STORY: 'loading_story', STORY: 'story' }

export default function App() {
  const [situation, setSituation] = useState('')
  const [excuses, setExcuses] = useState([])
  const [selectedExcuse, setSelectedExcuse] = useState(null)
  const [story, setStory] = useState('')
  const [step, setStep] = useState(STEPS.IDLE)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const generateExcuses = async () => {
    if (!situation.trim()) return
    setError(null)
    setStep(STEPS.LOADING_EXCUSES)
    setExcuses([])
    setSelectedExcuse(null)
    setStory('')
    try {
      const res = await fetch('/generate-excuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation }),
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setExcuses(data.excuses)
      setStep(STEPS.EXCUSES)
    } catch (e) {
      setError('Something went wrong. Make sure the backend is running!')
      setStep(STEPS.IDLE)
    }
  }

  const selectExcuse = async (excuse) => {
    setSelectedExcuse(excuse)
    setStep(STEPS.LOADING_STORY)
    setError(null)
    try {
      const res = await fetch('/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedExcuse: excuse }),
      })
      if (!res.ok) throw new Error('Server error')
      const data = await res.json()
      setStory(data.story)
      setStep(STEPS.STORY)
    } catch (e) {
      setError('Failed to generate story.')
      setStep(STEPS.EXCUSES)
    }
  }

  const reset = () => {
    setStep(STEPS.IDLE)
    setSituation('')
    setExcuses([])
    setSelectedExcuse(null)
    setStory('')
    setError(null)
  }

  const tryAgain = () => {
    setStep(STEPS.EXCUSES)
    setStory('')
    setSelectedExcuse(null)
  }

  const copyStory = async () => {
    await navigator.clipboard.writeText(story)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isLoading = step === STEPS.LOADING_EXCUSES || step === STEPS.LOADING_STORY

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="mb-12 fade-up">
          <h1 className="font-display text-5xl font-extrabold tracking-tight mb-2">
            NoCap Excuse 😭
          </h1>
          <p className="text-sm text-stone-400 font-light">
            Drop your situation. Get your alibi. No cap.
          </p>
        </div>

        {/* Input */}
        <div className="mb-6 fade-up">
          <textarea
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm resize-none focus:outline-none focus:border-stone-400 transition-colors placeholder:text-stone-300 min-h-[96px]"
            placeholder="e.g. I missed my friend's birthday dinner..."
            value={situation}
            onChange={e => setSituation(e.target.value)}
            disabled={isLoading}
            onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) generateExcuses() }}
          />
          <button
            onClick={generateExcuses}
            disabled={isLoading || !situation.trim()}
            className="mt-3 w-full font-display font-semibold text-sm bg-stone-900 text-white rounded-xl py-3 px-6 hover:bg-stone-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {step === STEPS.LOADING_EXCUSES ? (
              <><span className="spinner" /> Cooking up excuses...</>
            ) : (
              '✨ Generate Excuses'
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600 fade-up">
            {error}
          </div>
        )}

        {/* Excuses list */}
        {(step === STEPS.EXCUSES || step === STEPS.LOADING_STORY || step === STEPS.STORY) && excuses.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-3">
              Pick your poison ☠️
            </p>
            <div className="flex flex-col gap-2">
              {excuses.map((excuse, i) => (
                <button
                  key={i}
                  onClick={() => selectExcuse(excuse)}
                  disabled={step === STEPS.LOADING_STORY}
                  className={`excuse-card rounded-xl px-4 py-3 text-left text-sm fade-up-d${i + 1} ${selectedExcuse === excuse ? 'selected' : ''}`}
                >
                  <span className="opacity-40 text-xs mr-2 font-display">{String(i + 1).padStart(2, '0')}</span>
                  {excuse}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Story loading */}
        {step === STEPS.LOADING_STORY && (
          <div className="flex items-center gap-3 text-sm text-stone-400 fade-up py-4">
            <span className="spinner" />
            Crafting your masterpiece...
          </div>
        )}

        {/* Story output */}
        {step === STEPS.STORY && story && (
          <div className="fade-up">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 mb-4">
              <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-3">Your Story 📖</p>
              <p className="text-sm leading-relaxed text-stone-700">{story}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={tryAgain}
                className="flex-1 text-sm rounded-xl border border-stone-200 py-2.5 px-4 hover:bg-stone-50 transition-colors font-medium"
              >
                🔄 Try Another
              </button>
              <button
                onClick={copyStory}
                className="flex-1 text-sm rounded-xl bg-stone-900 text-white py-2.5 px-4 hover:bg-stone-700 transition-colors font-medium"
              >
                {copied ? '✅ Copied!' : '📋 Copy Story'}
              </button>
              <button
                onClick={reset}
                className="text-sm rounded-xl border border-stone-200 py-2.5 px-4 hover:bg-stone-50 transition-colors font-medium"
              >
                🆕 New
              </button>
            </div>
          </div>
        )}

      </div>

      <p className="mt-20 text-xs text-stone-300">made with zero shame 💀</p>
    </div>
  )
}
