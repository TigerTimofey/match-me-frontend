import React from "react";
import { Button, Box, Typography, Card, Alert } from "@mui/material";
import FormFields from "./user-data/FormFields";
import LoginPage from "../login/Login";
import "animate.css";

const RegisterPage = () => {
  const [showLogin, setShowLogin] = React.useState(false);
  const [animateClass, setAnimateClass] = React.useState("");
  const [formData, setFormData] = React.useState({
    name: "",
    lastname: "",
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = React.useState({
    name: false,
    lastname: false,
    username: false,
    password: false,
  });
  const [message, setMessage] = React.useState({ type: "", text: "" });

  const handleLoginClick = () => {
    setAnimateClass("animate__animated animate__zoomOut animate__delay-0.5");
    setTimeout(() => setShowLogin(true), 600);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value) {
      setFormErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleRegister = async () => {
    const { name, lastname, username, password } = formData;
    const errors = {
      name: !name,
      lastname: !lastname,
      username: !username,
      password: !password,
    };

    setFormErrors(errors);

    if (!name || !lastname || !username || !password) {
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
                onClick={() => setShowLogin(true)}
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
          <FormFields
            formData={formData}
            handleInputChange={handleInputChange}
            formErrors={formErrors}
          />
          <Button
            variant="contained"
            sx={{ textAlign: "center", marginTop: "20px" }}
            fullWidth
            onClick={handleRegister}
          >
            Sign Up
          </Button>
          <Typography
            variant="body2"
            sx={{ textAlign: "center", marginTop: "20px" }}
          >
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
        </Card>
      </div>
    </Box>
  );
};

export default RegisterPage;
