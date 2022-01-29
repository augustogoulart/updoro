import {useEffect, useState} from "react";

export function Timer() {
    const [time, setTime] = useState(30)
    const timer_has_ended = time === 0

    function runTimer() {
        setTime(time - 1)
    }

    useEffect(() => {
        if (timer_has_ended) {
            return
        } else {
            const timerId = setInterval(runTimer, 1000)
            return function () {
                clearInterval(timerId)
            }
        }
    })

    return (
        <>{time}</>
    )
}
