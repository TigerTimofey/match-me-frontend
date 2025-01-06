import React from "react";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import { Divider, styled, Typography } from "@mui/material";

const PrettoSlider = styled(Slider)(({ theme }) => ({
  color: "rgb(44,44,44)",
  height: 3,
  padding: "13px 0",
  "& .MuiSlider-thumb": {
    height: 27,
    width: 27,
    backgroundColor: "#fff",
    border: "1px solid currentColor",
    "&:hover": {
      boxShadow: "0 0 0 8px rgba(58, 133, 137, 0.16)",
    },
    "& .airbnb-bar": {
      height: 9,
      width: 1,
      backgroundColor: "currentColor",
      marginLeft: 1,
      marginRight: 1,
    },
  },
  "& .MuiSlider-track": {
    height: 3,
  },
  "& .MuiSlider-rail": {
    color: "#d8d8d8",
    opacity: 1,
    height: 3,
  },
}));

const AgeRangeSlider = ({ value, onChange }) => {
  const minDistance = 10;

  const handleChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) return;

    if (activeThumb === 0) {
      onChange([Math.min(newValue[0], value[1] - minDistance), value[1]]);
    } else {
      onChange([value[0], Math.max(newValue[1], value[0] + minDistance)]);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography
        variant="subtitle1"
        sx={{ color: "rgb(44,44,44)", fontWeight: 700 }}
      >
        Filter by Age
      </Typography>
      <PrettoSlider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        disableSwap
        min={1}
        max={99}
        step={10}
      />
      <Typography variant="body2" color="text.secondary">
        Age range: {value[0]} - {value[1]}
      </Typography>
      <Divider sx={{ display: { xs: "block", sm: "none" } }} />
    </Box>
  );
};

export default AgeRangeSlider;
