import React, { useState, useEffect, useRef } from 'react'

const POMODORO_DURATION = 25 * 60 // 25 minutes in seconds

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60)
  const seconds = time % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function PomodoroApp(): React.JSX.Element {
  const [timeLeft, setTimeLeft] = useState<number>(POMODORO_DURATION)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
  }, [isRunning])

  function handleReset(): void {
    setIsRunning(false)
    setTimeLeft(POMODORO_DURATION)
  }

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Pomodoro Timer</h1>
      <h2 style={{ fontSize: '4rem' }}>{formatTime(timeLeft)}</h2>
      <button onClick={() => setIsRunning((prev) => !prev)}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={handleReset} style={{ marginLeft: '10px' }}>
        Reset
      </button>
    </div>
  )
}
