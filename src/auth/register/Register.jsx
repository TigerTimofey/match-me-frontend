import React from "react";
import { TextField, Button, Box, Typography, Card, Alert } from "@mui/material";
import LoginPage from "../login/Login";
import "animate.css";

const RegisterPage = () => {
  const [showLogin, setShowLogin] = React.useState(false);
  const [animateClass, setAnimateClass] = React.useState("");
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = React.useState({ type: "", text: "" });

  const handleLoginClick = () => {
    setAnimateClass("animate__animated animate__zoomOut animate__delay-0.5");
    setTimeout(() => setShowLogin(true), 600);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/users`,
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
        if (errorData.message) throw new Error(errorData.message);
        throw new Error("Failed to register user");
      }

      const result = await response.json();
      console.log("User registered successfully:", result);

      // Show success message
      setMessage({
        type: "success",
        text: (
          <>
            Account created successfully! You can now{" "}
            <span
              style={{
                color: "#1A73E8",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => setShowLogin(true)}
            >
              Login
            </span>
            .
          </>
        ),
      });

      setFormData({ name: "", email: "", password: "" }); // Reset form
    } catch (error) {
      console.error("Error registering user:", error.message);

      // Show error message
      setMessage({ type: "error", text: error.message });
    }
  };

  return showLogin ? (
    <div className="animate__animated animate__zoomIn animate__delay-0.5">
      <LoginPage />
    </div>
  ) : (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
            Register
          </Typography>
          {message.text && (
            <Alert
              severity={message.type}
              sx={{ marginBottom: 2 }}
              onClose={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </Alert>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="name"
              label="Name"
              variant="outlined"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
            />
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
            <Button variant="contained" fullWidth onClick={handleRegister}>
              Register
            </Button>
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <span
                onClick={handleLoginClick}
                style={{
                  color: "#1A73E8",
                  cursor: "pointer",
                }}
              >
                Login
              </span>
            </Typography>
          </Box>
        </Card>
      </div>
    </Box>
  );
};

export default RegisterPage;
