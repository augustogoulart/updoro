import React, {useEffect, useState} from 'react';
import './App.css';
import {TimeRunner} from "./components/TimerRunner";
import {TimerEnded} from "./components/TimerEnded";
import {Laps} from "./components/Laps";

function App() {
  const timers = [5, 10, 15]

  const [runs, setRuns] = useState(1)
  const [stop, setStop] = useState(false)
  const [time, setTime] = useState(timers[0])

  const timerHasEnded = time === 0

  function runTimer() {
    setTime(time - 1)
  }

  function togglePause() {
    stop ? setStop(false) : setStop(true)
  }

  useEffect(() => {
    if (timerHasEnded) {
      if (runs < timers.length) {
        setRuns(runs + 1)
        setTime(timers[runs])
      }
    } else {
      if (!stop) {
        const timerId = setInterval(runTimer, 1000)
        return function () {
          clearInterval(timerId)
        }
      }
    }
  })

  return (
    <div className="App">
      <header className="App-header">
        {
          runs === timers.length && timerHasEnded ?
            <TimerEnded/>
            :
            <>
              <TimeRunner time={time}/>
              <div onClick={() => togglePause()} className={"controls"} style={{"cursor":"pointer"}}>
                Pause
              </div>
              <Laps runs={runs} timers={timers}/>
            </>
        }
      </header>
    </div>
  );
}

export default App;
