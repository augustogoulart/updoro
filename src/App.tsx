import React, {useEffect, useState} from 'react';
import './App.css';
import {TimerRunner} from "./components/TimerRunner";
import {TimerEnded} from "./components/TimerEnded";

function App() {
  const timers = [5, 10, 15]

  const [runs, setRuns] = useState(1)
  const [time, setTime] = useState(timers[0])

  const timerHasEnded = time === 0

  function runTimer() {
    setTime(time - 1)
  }

  useEffect(() => {
    if (timerHasEnded) {
      if (runs < timers.length) {
        setRuns(runs + 1)
        setTime(timers[runs])
      }
    } else {
      const timerId = setInterval(runTimer, 1000)
      return function () {
        clearInterval(timerId)
      }
    }
  })

  return (
    <div className="App">
      <header className="App-header">
        {timerHasEnded ? <TimerEnded/> : <TimerRunner time={time} runs={runs} timers={timers}/>}
      </header>
    </div>
  );
}

export default App;
