import React, {useEffect, useState} from 'react';
import './App.css';

function App() {
    const [time, setTime] = useState(5)
    const [runs, setRuns] = useState(1)
    const timer_has_ended = time === 0

    function runTimer() {
        setTime(time - 1)
    }

    useEffect(() => {
        if (timer_has_ended) {
            setRuns(runs + 1)
            setTime(5)
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
                    {runs}/10
                </div>
            </header>
        </div>
    );
}

export default App;
