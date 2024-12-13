import React from "react";
import { TextField, Button, Box, Typography, Card } from "@mui/material";
import Register from "../register/Register";
import "animate.css";

const LoginPage = () => {
  const [showRegister, setShowRegister] = React.useState(false);
  const [animateClass, setAnimateClass] = React.useState("");
  const [formData, setFormData] = React.useState({ email: "", password: "" });

  const handleCreateAccountClick = () => {
    setAnimateClass("animate__animated animate__zoomOut animate__delay-0.5");
    setTimeout(() => setShowRegister(true), 600);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to login");
      }

      const result = await response.json();
      console.log("Login successful:", result);

      if (result && result.token) {
        localStorage.setItem("jwt", result.token);
        console.log("Stored JWT:", localStorage.getItem("jwt"));

        // Display success message
        console.log("UHUUUUU"); // Display success message
      } else {
        throw new Error("No JWT found in response");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
    }
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
        <div className="animate__animated animate__zoomIn animate__delay-0.5">
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
              <TextField
                name="email"
                label="Email"
                variant="outlined"
                fullWidth
                value={formData.email}
                onChange={handleInputChange}
              />
              <TextField
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                value={formData.password}
                onChange={handleInputChange}
              />
              <Button variant="contained" fullWidth onClick={handleLogin}>
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
