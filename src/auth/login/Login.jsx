import React from "react";
import { TextField, Button, Box, Typography, Card, Alert } from "@mui/material";
import "animate.css";
import RegisterPage from "../register/Register";
import UserBio from "./user-bio/UserBio";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ onCreateAccount }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = React.useState({
    type: "",
    text: "",
  });

  const [showRegister, setShowRegister] = React.useState(false);
  const [showBio, setShowBio] = React.useState(false);
  const [animateClass, setAnimateClass] = React.useState("");
  const [token, setToken] = React.useState("");

  const handleCreateAccountClick = () => {
    setAnimateClass("animate__animated animate__fadeOut animate__delay-0.5");
    setTimeout(() => onCreateAccount(), 100);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      setMessage({
        type: "danger",
        text: "Please fill in both email and password fields.",
      });
      return;
    }

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
          text: "Incorrect login or password" || errorData.message,
        });
        return;
      }

      const token = await response.text();
      if (token) {
        localStorage.clear();
        localStorage.setItem("jwt", token);
        setToken(token);
        console.log("Login successful, JWT stored.");

        try {
          const userDetailsResponse = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/users/me`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (userDetailsResponse.ok) {
            const userData = await userDetailsResponse.json();

            if (userData.bioProvided) {
              navigate("/me");
            }
          } else {
            console.error("Failed to fetch user details");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }

        setShowBio(true);
      } else {
        throw new Error("No JWT found in response");
      }
    } catch (error) {
      console.error("Error logging in:", error.message);
      setMessage({
        type: "danger",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#7c7c7c",
      }}
    >
      {showRegister ? (
        <div className="animate__animated animate__fadeIn animate__delay-0.5">
          <RegisterPage onBackToLogin={onCreateAccount} />
        </div>
      ) : showBio ? (
        <div className="animate__animated animate__fadeIn animate__delay-0.5">
          <UserBio token={token} />
        </div>
      ) : (
        <div className={animateClass}>
          <Card
            sx={{
              padding: 5,
              width: { sm: 400 },
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              backgroundColor: "#f0efef",
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{
                textAlign: "center",
                color: "rgb(44,44,44)",
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
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{
                  backgroundColor: "rgb(44,44,44)",
                  color: "#f4f3f3",
                  fontWeight: 600,
                  fontSize: "1rem",
                  fontFamily: "Poppins",
                  mt: 2,
                }}
                fullWidth
                onClick={handleLogin}
              >
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
