import React from "react";

interface LapsProps {
  runs: number,
  timers: Number[]
}

export function Laps({runs, timers}: LapsProps): JSX.Element {
  return (
    <>
      <div className={"intervals"}>
        {runs}/{timers.length}
      </div>
    </>
  )
}
