import { useState } from 'react'
import Clock from './components/Clock'
import { TimeSchedule } from './types'

function minToSec(value: number): number {
  return value * 60
}

function App(): React.JSX.Element {
  const [hasFinished, setHasFinished] = useState<boolean>(false)
  const [currentTimer, setCurrentTimer] = useState<number>(0)

  const timerSchedule: TimeSchedule = {
    0: { timer: minToSec(2), type: 'focus' },
    1: { timer: minToSec(10), type: 'break' },
    2: { timer: minToSec(30), type: 'focus' },
    3: { timer: minToSec(10), type: 'break' },
    4: { timer: minToSec(90), type: 'focus' },
    5: { timer: minToSec(10), type: 'break' }
  }
  const hasNextTimer = timerSchedule[currentTimer]

  return (
    <>
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
        <p>END</p>
      )}
    </>
  )
}

export default App
