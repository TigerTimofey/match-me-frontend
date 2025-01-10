import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Card, Alert } from "@mui/material";
import "animate.css"; // Import animate.css for animations

const RegisterPage = ({ onBackToLogin }) => {
  const [animateClass, setAnimateClass] = useState(""); // State for animation class
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    lastname: false,
    username: false,
    password: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    setAnimateClass("animate__animated animate__fadeIn animate__delay-0.5"); // Apply fadeIn effect on mount
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value) {
      setFormErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleRegister = async () => {
    const { name, lastname, username, password } = formData;

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidEmail = emailRegex.test(username);

    const errors = {
      name: !name,
      lastname: !lastname,
      username: !username || !isValidEmail,
      password: !password,
    };

    setFormErrors(errors);

    if (!name || !lastname || !username || !password || !isValidEmail) {
      setMessage({ type: "danger", text: "All fields are required." });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData }),
        }
      );

      const responseText = await response.text();

      if (!response.ok || responseText.startsWith("Error")) {
        setMessage({
          type: responseText.startsWith("Error") ? "danger" : "error",
          text: responseText,
        });
        return;
      } else if (responseText === "User registered successfully!") {
        setMessage({
          type: "success",
          text: (
            <>
              {responseText} You can now{" "}
              <span
                style={{
                  color: "#1A73E8",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={onBackToLogin}
              >
                Login
              </span>
              .
            </>
          ),
        });
      } else {
        setMessage({ type: "info", text: responseText });
      }

      setFormData({ name: "", lastname: "", username: "", password: "" });
    } catch (error) {
      console.error("Error registering user:", error.message);
      setMessage({ type: "error", text: "An unexpected error occurred." });
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
      <div className={animateClass}>
        {" "}
        {/* Add fadeIn animation */}
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
            Register
          </Typography>
          {message.text && (
            <Alert
              severity={message.type}
              sx={{
                marginBottom: 2,
                textAlign: "center",
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
              name="name"
              label="First Name"
              variant="outlined"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
              helperText={formErrors.name && "First name is required"}
            />
            <TextField
              name="lastname"
              label="Last Name"
              variant="outlined"
              fullWidth
              value={formData.lastname}
              onChange={handleInputChange}
              error={formErrors.lastname}
              helperText={formErrors.lastname && "Last name is required"}
            />
            <TextField
              name="username"
              label="Email"
              variant="outlined"
              fullWidth
              value={formData.username}
              onChange={(e) => {
                handleInputChange(e);

                const emailRegex =
                  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                const isValidEmail = emailRegex.test(e.target.value);

                setFormErrors((prev) => ({
                  ...prev,
                  username: !isValidEmail && e.target.value !== "",
                }));
              }}
              error={formErrors.username}
              helperText={
                formErrors.username
                  ? "Please enter a valid email address"
                  : formErrors.username === false && formData.username === ""
              }
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
              helperText={formErrors.password && "Password is required"}
            />
            <Button
              variant="contained"
              sx={{
                backgroundColor: "rgb(44,44,44)",
                color: "#f4f3f3",
                fontWeight: 600,
                fontSize: "1rem",
                fontFamily: "Poppins",
                mt: 2,
              }}
              fullWidth
              onClick={() => {
                handleRegister();
              }}
            >
              Sign Up
            </Button>
          </Box>
          <Typography
            variant="body2"
            sx={{ textAlign: "center", marginTop: "20px" }}
          >
            Already have an account?{" "}
            <span
              onClick={onBackToLogin}
              style={{
                color: "#1A73E8",
                cursor: "pointer",
              }}
            >
              Login
            </span>
          </Typography>
        </Card>
      </div>
    </Box>
  );
};

export default RegisterPage;
