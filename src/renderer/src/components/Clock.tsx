import { PomodoroTimer } from '@renderer/types'

import React, { useState, useEffect, useRef } from 'react'

export default function PomodoroApp({ time, timerState }: PomodoroTimer): React.JSX.Element {
  const [timeLeft, setTimeLeft] = useState<number>(time.timer)
  const { isRunning, setIsRunning, setHasFinished, setCurrentTimer } = timerState
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

  return (
    <div>
      <h2 className={`timer ${colorVariant()}`}>{formatTime(timeLeft)}</h2>
      <button className="button button-start" onClick={() => setIsRunning((prev) => !prev)}>
        {isRunning ? 'Pause' : 'Start'}
      </button>
      <button className="button button-reset" onClick={handleReset}>
        Reset
      </button>
    </div>
  )
}
