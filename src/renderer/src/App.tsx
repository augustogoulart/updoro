import { useState } from 'react'
import Clock from './components/Clock'

function App(): React.JSX.Element {
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [hasFinished, setHasFinished] = useState<boolean>(false)
  const [currentTimer, setCurrentTimer] = useState<number>(0)

  const timerSchedule = {
    0: 3,
    1: 5,
    2: 7
  }

  const hasNextTimer = timerSchedule[currentTimer]

  return (
    <>
      <p>Is Running: {isRunning ? 'true' : 'false'}</p>
      <p>Has Finished: {hasFinished ? 'true' : 'false'}</p>
      <p>Current timer: {currentTimer}</p>
      {hasNextTimer ? (
        <Clock
          time={hasNextTimer}
          variant="focus"
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
