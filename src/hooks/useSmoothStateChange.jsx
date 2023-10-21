import { useState, useEffect, useRef } from "react";

function useSmoothStateChange(initialState, fromValue, toValue, duration, trigger, reverse) {
    const [state, setState] = useState(initialState);
    const startTime = Date.now();
    const animationFrameRef = useRef();

    useEffect(() => {
        function updateState() {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            if (elapsedTime < duration) {
                const progress = elapsedTime / duration;
                const newValue = reverse
                    ? toValue + progress * (fromValue - toValue)
                    : fromValue + progress * (toValue - fromValue);

                setState(newValue);

                animationFrameRef.current = requestAnimationFrame(updateState);
            } 
            else {
                setState(reverse ? fromValue : toValue);
            }
        }

        if (trigger) {
            animationFrameRef.current = requestAnimationFrame(updateState);

            return () => {
                cancelAnimationFrame(animationFrameRef.current);
            };
        }
    }, [fromValue, toValue, duration, trigger, reverse]);

    return state;
}

export default useSmoothStateChange;
