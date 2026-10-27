import { useEffect, useMemo, useState } from 'react'
import { buildPhases, useTimer } from './useTimer'

const STORAGE_KEY = 'interval-config'
const DEFAULTS = { prepare: 5, work: 60, rest: 60, sets: 10 }

const FIELDS = [
  { key: 'prepare', label: 'Persiapan', hint: 'Waktu sebelum mulai', step: 5, min: 0, max: 60, time: true },
  { key: 'work', label: 'Aktif', hint: 'Durasi tiap set', step: 5, min: 5, max: 3600, time: true },
  { key: 'rest', label: 'Istirahat', hint: 'Jeda antar set', step: 5, min: 0, max: 3600, time: true },
  { key: 'sets', label: 'Jumlah set', hint: 'Berapa kali diulang', step: 1, min: 1, max: 99, time: false },
]

const PHASE_LABEL = { prepare: 'Bersiap', work: 'Aktif', rest: 'Istirahat' }

const formatTime = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

const totalSeconds = ({ prepare, work, rest, sets }) => prepare + work * sets + rest * (sets - 1)

function loadConfig() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }
  } catch {
    return DEFAULTS
  }
}

function Stepper({ field, value, onChange }) {
  const change = (delta) => onChange(Math.min(field.max, Math.max(field.min, value + delta)))

  return (
    <div className="row">
      <div className="row-text">
        <span className="row-label">{field.label}</span>
        <span className="row-hint">{field.hint}</span>
      </div>
      <div className="stepper">
        <button
          type="button"
          onClick={() => change(-field.step)}
          disabled={value <= field.min}
          aria-label={`Kurangi ${field.label}`}
        >
          −
        </button>
        <output>{field.time ? formatTime(value) : value}</output>
        <button
          type="button"
          onClick={() => change(field.step)}
          disabled={value >= field.max}
          aria-label={`Tambah ${field.label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

function Setup({ config, onChange, onStart }) {
  const phases = useMemo(() => buildPhases(config), [config])

  return (
    <main className="setup">
      <header>
        <h1>Interval Timer</h1>
        <p className="subtitle">Atur waktu aktif dan istirahat, lalu mulai latihan.</p>
      </header>

      <section className="summary">
        <div className="summary-head">
          <div>
            <span className="summary-label">Total durasi</span>
            <strong className="summary-total">{formatTime(totalSeconds(config))}</strong>
          </div>
          <span className="summary-sets">{config.sets} set</span>
        </div>
        <div className="bar" aria-hidden="true">
          {phases.map((phase, i) => (
            <span key={i} className={`seg seg-${phase.type}`} style={{ flexGrow: phase.duration }} />
          ))}
        </div>
        <div className="legend">
          <span>
            <i className="dot dot-work" />
            Aktif
          </span>
          <span>
            <i className="dot dot-rest" />
            Istirahat
          </span>
        </div>
      </section>

      <section className="panel">
        {FIELDS.map((field) => (
          <Stepper
            key={field.key}
            field={field}
            value={config[field.key]}
            onChange={(value) => onChange({ ...config, [field.key]: value })}
          />
        ))}
      </section>

      <button type="button" className="primary" onClick={onStart}>
        Mulai
      </button>
    </main>
  )
}

function Ring({ progress }) {
  return (
    <svg className="ring" viewBox="0 0 280 280" aria-hidden="true">
      <circle className="ring-track" cx="140" cy="140" r="124" />
      <circle
        className="ring-bar"
        cx="140"
        cy="140"
        r="124"
        pathLength="1"
        strokeDasharray="1"
        strokeDashoffset={1 - progress}
      />
    </svg>
  )
}

function Running({ timer, sets }) {
  const { phase, next, remaining, status } = timer
  const progress = remaining / (phase.duration * 1000)

  return (
    <main className="run">
      <p className="set-info">
        Set {Math.max(phase.set, 1)} dari {sets}
      </p>
      <div className="dial">
        <Ring progress={progress} />
        <div className="dial-text">
          <span className="phase">{PHASE_LABEL[phase.type]}</span>
          <span className="time">{formatTime(Math.ceil(remaining / 1000))}</span>
        </div>
      </div>
      <p className="next">{next ? `Berikutnya: ${PHASE_LABEL[next.type]}` : 'Set terakhir'}</p>
      <div className="controls">
        <button type="button" className="ghost" onClick={timer.reset}>
          Berhenti
        </button>
        <button
          type="button"
          className="primary"
          onClick={status === 'running' ? timer.pause : timer.resume}
        >
          {status === 'running' ? 'Jeda' : 'Lanjut'}
        </button>
        <button type="button" className="ghost" onClick={timer.skip}>
          Lewati
        </button>
      </div>
    </main>
  )
}

function Done({ config, onReset }) {
  return (
    <main className="setup done">
      <h1>Selesai</h1>
      <p className="total">
        {config.sets} set, total <strong>{formatTime(totalSeconds(config))}</strong>
      </p>
      <button type="button" className="primary" onClick={onReset}>
        Latihan lagi
      </button>
    </main>
  )
}

export default function App() {
  const [config, setConfig] = useState(loadConfig)
  const stableConfig = useMemo(() => config, [config])
  const timer = useTimer(stableConfig)
  const active = timer.status === 'running' || timer.status === 'paused'

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }, [config])

  useEffect(() => {
    if (timer.status !== 'running' || !navigator.wakeLock) return
    let lock
    let cancelled = false
    navigator.wakeLock
      .request('screen')
      .then((sentinel) => {
        if (cancelled) sentinel.release()
        else lock = sentinel
      })
      .catch(() => {})
    return () => {
      cancelled = true
      lock?.release()
    }
  }, [timer.status])

  return (
    <div className="screen" data-phase={active ? timer.phase.type : 'idle'}>
      {timer.status === 'idle' && <Setup config={config} onChange={setConfig} onStart={timer.start} />}
      {active && <Running timer={timer} sets={config.sets} />}
      {timer.status === 'done' && <Done config={config} onReset={timer.reset} />}
    </div>
  )
}
