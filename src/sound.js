let ctx

function getContext() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(frequency, duration, delay = 0) {
  const audio = getContext()
  const start = audio.currentTime + delay
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.35, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(audio.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

export const unlockAudio = () => getContext()

export const notifyTick = () => tone(660, 0.12)

export function notifyPhase(type) {
  if (type === 'rest') {
    tone(520, 0.4)
  } else {
    tone(880, 0.18)
    tone(1175, 0.35, 0.2)
  }
  navigator.vibrate?.(type === 'rest' ? [200] : [120, 80, 120])
}

export function notifyFinish() {
  tone(880, 0.2)
  tone(1100, 0.2, 0.25)
  tone(1320, 0.5, 0.5)
  navigator.vibrate?.([200, 100, 200, 100, 400])
}
