import { PomodoroTimer } from '@renderer/types'

import React, { useState, useEffect, useRef } from 'react'

function playBeep(frequency = 800, duration = 100, volume = 0.1): void {
  const ctx = new (window.AudioContext || window.AudioContext)()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  gain.gain.setValueAtTime(volume, ctx.currentTime)

  oscillator.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(ctx.currentTime + duration / 1000) // duration in seconds
}

function playBeepSequence(): void {
  const sequence = [
    { delay: 0, duration: 100 },
    { delay: 600, duration: 100 },
    { delay: 1000, duration: 300 } // longer final beep
  ]

  for (const { delay, duration } of sequence) {
    setTimeout(() => {
      playBeep(800, duration)
    }, delay)
  }
}

export default function PomodoroApp({ time, timerState }: PomodoroTimer): React.JSX.Element {
  const [timeLeft, setTimeLeft] = useState<number>(time.timer)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const { setHasFinished, setCurrentTimer } = timerState
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTimeLeft(time.timer)
  }, [time])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, setTimeLeft])

  useEffect(() => {
    if (timeLeft === 0) {
      playBeepSequence()
      setIsRunning(false)
      setHasFinished(true)
      setCurrentTimer((prev) => prev + 1)
    }
  }, [setCurrentTimer, setHasFinished, setIsRunning, timeLeft])

  function formatTime(time: number): string {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  function handleReset(): void {
    setIsRunning(false)
    setHasFinished(false)
    setTimeLeft(time.timer)
  }

  function colorVariant(): string {
    return time.type === 'break' ? 'text-green' : 'text-red'
  }

  function handleSkip(): void {
    setIsRunning(false)
    setCurrentTimer((prev) => prev + 1)
  }

  return (
    <div>
      <h2 className={`timer ${colorVariant()}`}>{formatTime(timeLeft)}</h2>
      <button className="button button-start" onClick={() => setIsRunning((prev) => !prev)}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button className="button button-reset" onClick={handleReset}>
        Reset
      </button>
      <button className="button button-skip" onClick={handleSkip}>
        Skip
      </button>
    </div>
  )
}
