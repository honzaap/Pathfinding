
function Interface({ canStart, started, animationEnded, time, startPathfinding, toggleAnimation, clearPath }) {

    return (
        <>
            <div className="test-buttons">
                <button disabled={canStart} onClick={startPathfinding}>{time}</button>
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
