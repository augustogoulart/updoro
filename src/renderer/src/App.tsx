import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!isRunning && hasFinished) {
      setCurrentTimer((prev) => prev + 1)
    }
  }, [isRunning, hasFinished, setCurrentTimer])
  return (
    <>
      <p>Is Running: {isRunning ? 'true' : 'false'}</p>
      <p>Has Finished: {hasFinished ? 'true' : 'false'}</p>
      <p>Current timer: {currentTimer}</p>

      <Clock
        time={timerSchedule[currentTimer]}
        variant="focus"
        timerState={{
          hasFinished: hasFinished,
          setHasFinished: setHasFinished,
          isRunning: isRunning,
          setIsRunning: setIsRunning
        }}
      />
    </>
  )
}

export default App
