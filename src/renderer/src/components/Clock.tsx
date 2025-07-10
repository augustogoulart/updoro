import React, { useState, useEffect, useRef } from 'react'

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

type StateSetter<T> = (value: T | ((prev: T) => T)) => void

interface TimerState {
  hasFinished: boolean
  isRunning: boolean
  setHasFinished: StateSetter<boolean>
  setIsRunning: StateSetter<boolean>
}

interface PomodoroTimer {
  time: number
  variant: 'focus' | 'break'
  timerState: TimerState
}

export default function PomodoroApp({
  time,
  variant,
  timerState
}: PomodoroTimer): React.JSX.Element {
  const [timeLeft, setTimeLeft] = useState<number>(time)
  const { isRunning, setIsRunning, setHasFinished } = timerState
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    }

    if (timeLeft === 0) {
      setIsRunning(false)
      setHasFinished(true)
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRunning, timeLeft, setHasFinished, setIsRunning])

  function handleReset(): void {
    setIsRunning(false)
    setHasFinished(false)
    setTimeLeft(time)
  }

  function colorVariant(): string {
    return variant === 'break' ? 'green' : 'red'
  }

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2 style={{ fontSize: '4rem', color: colorVariant() }}>{formatTime(timeLeft)}</h2>
      <button onClick={() => setIsRunning((prev) => !prev)}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={handleReset} style={{ marginLeft: '10px' }}>
        Reset
      </button>
    </div>
  )
}
