import React, {useEffect, useState} from 'react';
import './App.css';

function App() {
    const timers = [5, 10, 15]

    const [runs, setRuns] = useState(1)
    const [time, setTime] = useState(timers[0])

    function runTimer() {
        setTime(time - 1)
    }

    useEffect(() => {
        if (time === 0) {
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
                {time}
                <div className={"controls"}>
                    Pause
                </div>
                <div className={"intervals"}>
                    {runs}/{timers.length}
                </div>
            </header>
        </div>
    );
}

export default App;
