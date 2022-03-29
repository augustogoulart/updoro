import React from "react";

interface TimerRunnerProps {
  time: number,
  runs: number,
  timers: Number[]
}

export function TimerRunner({time, runs, timers}: TimerRunnerProps): JSX.Element {
  return (
    <>
      {time}
      <div className={"controls"}>
        Pause
      </div>
      <div className={"intervals"}>
        {runs}/{timers.length}
      </div>
    </>
  )
}
