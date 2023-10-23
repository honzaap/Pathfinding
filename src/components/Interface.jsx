import { Button, IconButton, Typography, Snackbar, Alert, CircularProgress, Fade, Tooltip, Drawer, MenuItem, Select, InputLabel, FormControl, Menu } from "@mui/material";
import { PlayArrow, Settings, Movie, Pause } from "@mui/icons-material";
import Slider from "./Slider";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function Interface({ canStart, started, animationEnded, playbackOn, time, maxTime, timeChanged, startPathfinding, toggleAnimation, clearPath }) {
    const [sidebar, setSidebar] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const menuOpen = Boolean(menuAnchor);
    const timerRef = useRef();

    function closeSnack() {
        setSnackOpen(false);
    }

    function handlePlay() {
        if(!started && time === 0) {
            startPathfinding();
            return;
        }
        toggleAnimation();
    }

    
    function closeMenu() {
        setMenuAnchor(null);
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
                <IconButton disabled={canStart} onClick={handlePlay} style={{ backgroundColor: "#46B780", width: 60, height: 60 }} size="large">
                    {(!started || animationEnded && !playbackOn) 
                        ? <PlayArrow style={{ color: "#fff", width: 26, height: 26 }} fontSize="inherit" />
                        : <Pause style={{ color: "#fff", width: 26, height: 26 }} fontSize="inherit" />
                    }
                </IconButton>
                <div className="side">
                    <Button disabled={!animationEnded && started} onClick={clearPath} style={{ color: "#fff", backgroundColor: "#404156", paddingInline: 30, paddingBlock: 7 }} variant="contained">Clear path</Button>
                </div>
            </div>

            <div className="nav-right">
                <Tooltip title="Open settings">
                    <IconButton onClick={() => {setSidebar(true);}} style={{ backgroundColor: "#2A2B37", width: 36, height: 36 }} size="large">
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

            <Drawer
                anchor="left"
                open={sidebar}
                onClose={() => {setSidebar(false);}}
            >
                <div className="sidebar-container">

                    <FormControl variant="filled">
                        <InputLabel style={{ fontSize: 14 }} id="algo-select">Algorithm</InputLabel>
                        <Select
                            labelId="algo-select"
                            value={0}
                            required
                            style={{ backgroundColor: "#404156", color: "#fff", width: "100%", paddingLeft: 1 }}
                            inputProps={{MenuProps: {MenuListProps: {sx: {backgroundColor: "#404156"}}}}}
                            size="small"
                        >
                            <MenuItem value={0}>A* algorithm</MenuItem>
                            <MenuItem value={1}>Placeholder</MenuItem>
                            <MenuItem value={2}>Placeholder</MenuItem>
                            <MenuItem value={3}>Placeholder</MenuItem>
                        </Select>
                    </FormControl>

                    <div>
                        <Button
                            id="locations-button"
                            aria-controls={menuOpen ? "locations-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={menuOpen ? "true" : undefined}
                            onClick={(e) => {setMenuAnchor(e.currentTarget);}}
                            variant="contained"
                            disableElevation
                            style={{ backgroundColor: "#404156", color: "#fff", textTransform: "none", fontSize: 16, paddingBlock: 8, justifyContent: "start" }}
                        >
                            Locations
                        </Button>
                        <Menu
                            id="locations-menu"
                            anchorEl={menuAnchor}
                            open={menuOpen}
                            onClose={() => {setMenuAnchor(null);}}
                            MenuListProps={{
                                "aria-labelledby": "locations-button",
                                sx: {
                                    backgroundColor: "#404156"
                                }
                            }}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                        >
                            <MenuItem  onClick={closeMenu}>New York</MenuItem>
                            <MenuItem  onClick={closeMenu}>Prague</MenuItem>
                            <MenuItem  onClick={closeMenu}>Jablonec nad Nisou</MenuItem>
                        </Menu>
                    </div>

                    <div className="side slider-container">
                        <Typography id="area-slider" >
                            Area radius: 16km (10mi)
                        </Typography>
                        <Slider min={2} max={20} step={1} className="slider" aria-labelledby="area-slider" style={{ marginBottom: 1 }} 
                            marks={[
                                {
                                    value: 2,
                                    label: "2km"
                                },
                                {
                                    value: 20,
                                    label: "20km"
                                }
                            ]} 
                        />
                    </div>

                    <div className="side slider-container">
                        <Typography id="speed-slider" >
                            Animation speed
                        </Typography>
                        <Slider min={1} max={10} step={0.5} className="slider" aria-labelledby="speed-slider" style={{ marginBottom: 1 }} />
                    </div>
                </div>
            </Drawer>
        </>
    );
}

export default Interface;
