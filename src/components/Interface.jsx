import { Button, IconButton, Typography, Snackbar, Alert, CircularProgress, Fade, Tooltip } from "@mui/material";
import { PlayArrow, Settings, Movie } from "@mui/icons-material";
import Slider from "./Slider";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function Interface({ canStart, started, animationEnded, time, maxTime, timeChanged, startPathfinding, toggleAnimation, clearPath }) {
    const [loading, setLoading] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const timerRef = useRef();

    function closeSnack() {
        setSnackOpen(false);
    }

    useEffect(() => {
        clearTimeout(timerRef.current);
        setSnackOpen(true);
        
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
        }, 2000);
    }, []);

    return (
        <>
            <div className="nav-top">
                <div className="side slider-container">
                    <Typography id="playback-slider" gutterBottom>
                        Animation playback
                    </Typography>
                    <Slider disabled={!animationEnded}  value={animationEnded ? time : maxTime} min={animationEnded ? 0 : -1} max={maxTime} onChange={(e) => {timeChanged(Number(e.target.value));}} className="slider" aria-labelledby="playback-slider" />
                </div>
                <IconButton disabled={canStart} onClick={startPathfinding} style={{ backgroundColor: "#46B780", width: 60, height: 60 }} size="large">
                    <PlayArrow style={{ color: "#fff", width: 26, height: 26 }} fontSize="inherit" />
                </IconButton>
                <div className="side">
                    <Button disabled={!animationEnded && started} onClick={clearPath} style={{ color: "#fff", backgroundColor: "#404156", paddingInline: 30, paddingBlock: 7 }} variant="contained">Clear path</Button>
                </div>
            </div>

            <div className="nav-right">
                <Tooltip title="Open settings">
                    <IconButton style={{ backgroundColor: "#2A2B37", width: 36, height: 36 }} size="large">
                        <Settings style={{ color: "#fff", width: 24, height: 24 }} fontSize="inherit" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Cinematic mode">
                    <IconButton style={{ backgroundColor: "#2A2B37", width: 36, height: 36 }} size="large">
                        <Movie style={{ color: "#fff", width: 24, height: 24 }} fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            </div>

            <div className="loader-container">
                <Fade
                    in={loading}
                    style={{
                        transitionDelay: loading ? "800ms" : "0ms",
                    }}
                    unmountOnExit
                >
                    <CircularProgress color="inherit" />
                </Fade>
            </div>

            <Snackbar 
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }} 
                open={snackOpen} 
                autoHideDuration={4000} 
                onClose={closeSnack}>
                <Alert 
                    onClose={closeSnack} 
                    severity="error" 
                    variant="filled"
                    style={{ width: "100%", backgroundColor: "#7E272C", color: "#fff" }}
                >
                    Lorem ipsum dolor sit amet.
                </Alert>
            </Snackbar>

            <div className="test-buttons">
                <span className="frame-count">{time}</span>
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
