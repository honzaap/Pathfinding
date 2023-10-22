import Slider from "@mui/material/Slider";
import { alpha, styled } from "@mui/material/styles";

const SuccessSlider = styled(Slider)(() => ({
    color: "#46B780",
    "& .MuiSlider-thumb": {
        "&:hover, &.Mui-focusVisible": {
            boxShadow: `0px 0px 0px 8px ${alpha("#46B780", 0.16)}`,
        },
        "&.Mui-active": {
            boxShadow: `0px 0px 0px 14px ${alpha("#46B780", 0.16)}`,
        },
    },
    "& .MuiSlider-rail": {
        color: "#A8AFB3",
        opacity: 1
    },
}));

export default function StyledCustomization({ disabled, value, min, max, onInput, onChange, defaultValue }) {
    return <SuccessSlider disabled={disabled} value={value} min={min} max={max} onInput={onInput} onChange={onChange} defaultValue={defaultValue} />;
}