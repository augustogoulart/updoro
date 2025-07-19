import React from 'react'

interface EndSessionProps {
  restart: () => void
}

export default function EndSession({ restart }: EndSessionProps): React.JSX.Element {
  return (
    <>
      <h1>Finished!</h1>
      <button onClick={restart} className={'button button-restart'}>
        Restart
      </button>
    </>
  )
}
