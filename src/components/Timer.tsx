import {useEffect, useState} from "react";

export function Timer() {
    const[time, setTime] = useState(30)

    function runTimer() {
        setTime(time - 1)
    }

    useEffect(() => {
        const timerId = setInterval(runTimer, 1000)

        return function () {
            clearInterval(timerId)
        }
    })

    return(
        <>
            {time}
        </>
    )
}
