import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { notifyFinish, notifyPhase, notifyTick, unlockAudio } from './sound'

export function buildPhases({ prepare, work, rest, sets }) {
  const phases = []
  if (prepare > 0) phases.push({ type: 'prepare', duration: prepare, set: 0 })
  for (let set = 1; set <= sets; set++) {
    phases.push({ type: 'work', duration: work, set })
    if (rest > 0 && set < sets) phases.push({ type: 'rest', duration: rest, set })
  }
  return phases
}

export function useTimer(config) {
  const phases = useMemo(() => buildPhases(config), [config])
  const [status, setStatus] = useState('idle')
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const endAt = useRef(0)
  const lastTick = useRef(null)

  const enter = useCallback(
    (i) => {
      const ms = phases[i].duration * 1000
      endAt.current = Date.now() + ms
      lastTick.current = null
      setIndex(i)
      setRemaining(ms)
    },
    [phases]
  )

  const advance = useCallback(() => {
    const next = index + 1
    if (next >= phases.length) {
      setStatus('done')
      setRemaining(0)
      notifyFinish()
      return
    }
    notifyPhase(phases[next].type)
    enter(next)
  }, [index, phases, enter])

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => {
      const left = endAt.current - Date.now()
      if (left <= 0) {
        advance()
        return
      }
      const seconds = Math.ceil(left / 1000)
      if (seconds <= 3 && lastTick.current !== seconds) {
        lastTick.current = seconds
        notifyTick()
      }
      setRemaining(left)
    }, 100)
    return () => clearInterval(id)
  }, [status, advance])

  const start = () => {
    unlockAudio()
    enter(0)
    setStatus('running')
    notifyPhase(phases[0].type)
  }

  const pause = () => setStatus('paused')

  const resume = () => {
    endAt.current = Date.now() + remaining
    setStatus('running')
  }

  const reset = () => {
    setStatus('idle')
    setIndex(0)
    setRemaining(0)
  }

  return {
    status,
    phase: phases[index],
    next: phases[index + 1],
    remaining,
    start,
    pause,
    resume,
    skip: advance,
    reset,
  }
}
