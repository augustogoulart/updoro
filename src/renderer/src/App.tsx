import Clock from './components/Clock'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="creator">UpDoro - The progressive pomodoro</div>
      <div className="text">Increase your attention span</div>

      <div className="action">
        <a target="_blank" rel="noreferrer" onClick={ipcHandle}>
          Send IPC
        </a>
      </div>
      <Clock />
    </>
  )
}

export default App
