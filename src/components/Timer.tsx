import {useEffect, useState} from "react";

export function Timer() {
    const[time, setTime] = useState(30)

    function runTimer() {
        return time - 1
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTime(runTimer());
        }, 1000)

        return function () {
            clearTimeout(timer)
        }
    })

    return(
        <>
            {time}
        </>
    )
}
