import { useEffect, useRef, useState } from 'react'
import Clock from './components/Clock'
import { TimeSchedule } from './types'
import EndSession from './components/EndSession'

function minToSec(value: number): number {
  return value * 60
}

const timerSchedule: TimeSchedule = {
  0: { timer: minToSec(0.5), type: 'focus' },
  1: { timer: minToSec(1), type: 'break' },
  2: { timer: minToSec(2), type: 'focus' },
  3: { timer: minToSec(2), type: 'break' },
  4: { timer: minToSec(30), type: 'focus' },
  5: { timer: minToSec(10), type: 'break' },
  6: { timer: minToSec(90), type: 'focus' },
  7: { timer: minToSec(10), type: 'break' }
}

function countFocusTimers(schedule: TimeSchedule): number {
  return Object.values(schedule).filter((slot) => slot.type === 'focus').length
}

const initialState = {
  currentTimerInitial: 0,
  focusTimerCountInitial: 1
} as const

function App(): React.JSX.Element {
  const { currentTimerInitial, focusTimerCountInitial } = initialState

  const [hasFinished, setHasFinished] = useState<boolean>(false)
  const [currentTimer, setCurrentTimer] = useState<number>(currentTimerInitial)
  const [focusTimerCount, setFocusTimerCount] = useState<number>(focusTimerCountInitial)
  const prevTimer = useRef<number>(currentTimer)

  const hasNextTimer = timerSchedule[currentTimer] ?? false

  useEffect(() => {
    if (!hasNextTimer) return

    if (timerSchedule[currentTimer].type === 'focus' && prevTimer.current !== currentTimer) {
      setFocusTimerCount((prev) => prev + 1)
    }
    prevTimer.current = currentTimer
  }, [currentTimer, hasNextTimer])

  function restart(): void {
    prevTimer.current = currentTimerInitial
    setCurrentTimer(currentTimerInitial)
    setFocusTimerCount(focusTimerCountInitial)
    // setHasFinished(true)
  }
  console.log(prevTimer.current, currentTimer)
  return (
    <>
      <h1>
        {focusTimerCount} / {countFocusTimers(timerSchedule)}
      </h1>
      {hasNextTimer ? (
        <Clock
          time={hasNextTimer}
          timerState={{
            hasFinished: hasFinished,
            setHasFinished: setHasFinished,
            setCurrentTimer: setCurrentTimer,
            currentTimer: currentTimer
          }}
        />
      ) : (
        <EndSession restart={restart} />
      )}
    </>
  )
}

export default App
