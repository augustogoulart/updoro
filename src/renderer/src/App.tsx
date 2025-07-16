import { useState } from 'react'
import Clock from './components/Clock'
import { TimeSchedule } from './types'

function App(): React.JSX.Element {
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [hasFinished, setHasFinished] = useState<boolean>(false)
  const [currentTimer, setCurrentTimer] = useState<number>(0)

  const timerSchedule: TimeSchedule = {
    0: { timer: 29, type: 'focus' },
    1: { timer: 5, type: 'break' },
    2: { timer: 120, type: 'focus' },
    3: { timer: 5, type: 'break' },
    4: { timer: 120, type: 'focus' }
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
            isRunning: isRunning,
            setIsRunning: setIsRunning,
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
