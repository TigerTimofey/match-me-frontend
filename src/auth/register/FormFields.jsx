import React from "react";
import { TextField, Box } from "@mui/material";

const FormFields = ({ formData, handleInputChange, formErrors }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <TextField
        name="name"
        label="Name"
        variant="outlined"
        fullWidth
        value={formData.name}
        onChange={handleInputChange}
        error={formErrors.name}
        helperText={formErrors.name ? "Name is required" : ""}
        required
      />
      <TextField
        name="lastname"
        label="Lastname"
        variant="outlined"
        fullWidth
        value={formData.lastname}
        onChange={handleInputChange}
        error={formErrors.lastname}
        helperText={formErrors.lastname ? "Lastname is required" : ""}
        required
      />
      <TextField
        name="username"
        label="Email"
        variant="outlined"
        fullWidth
        value={formData.username}
        onChange={handleInputChange}
        error={formErrors.username}
        helperText={formErrors.username ? "Email is required" : ""}
        required
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        value={formData.password}
        onChange={handleInputChange}
        error={formErrors.password}
        helperText={formErrors.password ? "Password is required" : ""}
        required
      />
    </Box>
  );
};

export default FormFields;
