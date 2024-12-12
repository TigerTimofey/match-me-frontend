import React from "react";
import { TextField, Button, Box, Typography, Card } from "@mui/material";
import Register from "../register/Register";
import "animate.css";

const LoginPage = () => {
  const [showRegister, setShowRegister] = React.useState(false);
  const [animateClass, setAnimateClass] = React.useState("");

  const handleCreateAccountClick = () => {
    setAnimateClass("animate__animated animate__zoomOut  animate__delay-0.5");
    setTimeout(() => setShowRegister(true), 600);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#dbc5f1",
      }}
    >
      {showRegister ? (
        <div className="animate__animated animate__zoomIn  animate__delay-0.5">
          <Register />
        </div>
      ) : (
        <div className={animateClass}>
          <Card
            sx={{
              padding: 5,
              width: 400,
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              backgroundColor: "#E3F2FD",
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{
                textAlign: "center",
                color: "#1A73E8",
                marginBottom: 3,
                fontWeight: 600,
              }}
            >
              Login
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField label="Email" variant="outlined" fullWidth />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
              />
              <Button variant="contained" fullWidth>
                Login
              </Button>
              <Typography variant="body2" sx={{ textAlign: "center" }}>
                Don't have an account?{" "}
                <span
                  onClick={handleCreateAccountClick}
                  style={{
                    color: "#1A73E8",
                    cursor: "pointer",
                  }}
                >
                  Create Account
                </span>
              </Typography>
            </Box>
          </Card>
        </div>
      )}
    </Box>
  );
};

export default LoginPage;
