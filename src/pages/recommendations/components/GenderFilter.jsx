import React from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";

const GenderFilter = ({ value, onChange }) => {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}
    >
      <Typography
        variant="subtitle1"
        sx={{ color: "rgb(44,44,44)", fontWeight: 500, textAlign: "right" }}
      >
        Filter by Gender
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, selected) => {
          if (selected !== null) {
            onChange(selected);
          }
        }}
        size="small"
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 1,
          mb: 1,
          backgroundColor: "#f4f4f4",
          color: "rgb(44,44,44)",
        }}
      >
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="Male">Male</ToggleButton>
        <ToggleButton value="Female">Female</ToggleButton>
      </ToggleButtonGroup>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ marginTop: 1, textAlign: "right" }}
      >
        Gender: {value}
      </Typography>
    </Box>
  );
};

export default GenderFilter;
