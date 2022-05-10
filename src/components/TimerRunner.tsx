import React from "react";

interface TimerRunnerProps {
  time: number,
}

export function TimeRunner({time}: TimerRunnerProps): JSX.Element {
  return (
    <>
      {time}
    </>
  )
}
