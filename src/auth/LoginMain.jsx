import React, { useState } from "react";
import { Box } from "@mui/material";
import LoginPage from "./login/Login";
import RegisterPage from "./register/Register";
import "animate.css";

import loginPng from "../utils/image/log.png";
import regPng from "../utils/image/reg.png";

const LoginMain = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [animationClass, setAnimationClass] = useState("");

  const handleToggleRegister = () => {
    setAnimationClass("animate__animated animate__fadeOut animate__delay-0.5");
    setTimeout(() => {
      setShowRegister((prev) => !prev);
      setAnimationClass("animate__animated animate__fadeIn animate__delay-0.5");
    }, 100);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0efef",
        }}
      >
        <img
          src={showRegister ? regPng : loginPng}
          alt={showRegister ? "Register GIF" : "Login GIF"}
          style={{
            maxWidth: "100%",
            maxHeight: "80%",
            objectFit: "contain",
            borderRadius: "100px",
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#7c7c7c",
        }}
      >
        <div className={animationClass}>
          {showRegister ? (
            <RegisterPage onBackToLogin={handleToggleRegister} />
          ) : (
            <LoginPage onCreateAccount={handleToggleRegister} />
          )}
        </div>
      </Box>
    </Box>
  );
};

export default LoginMain;
