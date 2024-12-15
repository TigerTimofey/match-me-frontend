import React from "react";
import { TextField, Button, Box, Typography, Card, Alert } from "@mui/material";
import "animate.css";
import RegisterPage from "../register/Register";

const LoginPage = () => {
  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = React.useState({
    type: "",
    text: "",
  });
  const [showRegister, setShowRegister] = React.useState(false);
  const [animateClass, setAnimateClass] = React.useState("");

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
        `${process.env.REACT_APP_SERVER_URL}/api/auth/signin`,
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
        setMessage({
          type: "danger",
          text: errorData.error || "Failed to login",
        });
        return;
      }

      const token = await response.text(); // Get response as text
      if (token) {
        localStorage.setItem("jwt", token);
        console.log("Login successful, JWT stored.");
        console.log(`User ${formData.username} JWT token is `, token);
        setMessage({ type: "success", text: "Login successful" });
      } else {
        throw new Error("No JWT found in response");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setMessage({ type: "danger", text: "Wrong Email or Password" });
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
          <RegisterPage />
        </div>
      ) : (
        <div className={animateClass}>
          <Card
            sx={{
              padding: 5,
              width: { sm: 400 },
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
            {message.text && (
              <Alert
                severity={message.type}
                sx={{
                  marginBottom: 2,
                  backgroundColor:
                    message.type === "danger"
                      ? "#f8d7da"
                      : message.type === "success"
                      ? "#a8f49d"
                      : "transparent",
                  color: message.type === "danger" ? "#721c24" : "inherit",
                }}
                onClose={() => setMessage({ type: "", text: "" })}
              >
                {message.text}
              </Alert>
            )}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                name="username"
                label="Email"
                variant="outlined"
                fullWidth
                value={formData.username}
                onChange={handleInputChange}
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
                required
              />
              <Button variant="contained" fullWidth onClick={handleLogin}>
                Sign In
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
