
function Interface({ canStart, started, animationEnded, time, maxTime, timeChanged, startPathfinding, toggleAnimation, clearPath }) {
    return (
        <>
            <div className="test-buttons">
                <span className="frame-count">{time}</span>
                <input type="range" disabled={!animationEnded} min={animationEnded ? 0 : -1} max={maxTime} value={animationEnded ? time : maxTime} onInput={(e) => {timeChanged(Number(e.target.value));}}/>
                <button disabled={canStart} onClick={startPathfinding}>start</button>
                <button disabled={!animationEnded && started} onClick={clearPath}>clear</button>
                <button disabled={time === 0 || animationEnded} onClick={toggleAnimation}>
                    {(started || time === 0) && <span>stop</span>}
                    {(!started && time > 0) && <span>resume</span>}
                </button>
            </div>
        </>
    );
}

export default Interface;
