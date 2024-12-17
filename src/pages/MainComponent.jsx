import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Box, Alert, Typography } from "@mui/material";
import TopNavBar from "./menu/TopNavBar";
import UserDetailsCard from "./UserDetails";

function MainComponent() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [username, setUsername] = useState("Guest");
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || "User");
      } catch (error) {
        console.error("Error decoding JWT:", error);
        setUsername("Guest");
      }

      const fetchUserDetails = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/auth/me`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            if (response.status === 401) {
              setMessage({
                type: "error",
                text: "Session expired or unauthorized. Redirecting...",
              });
              navigate("/");
            } else {
              const errorData = await response.json();
              setMessage({
                type: "error",
                text: errorData.message || "Failed to fetch user data.",
              });
            }
            return;
          }

          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setMessage({
            type: "error",
            text: "Something went wrong while fetching user data.",
          });
        }
      };

      fetchUserDetails();
    } else {
      console.warn("No JWT found in localStorage.");
    }
  }, []);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <TopNavBar
        userData={userData}
        handleMenuOpen={handleMenuOpen}
        anchorEl={anchorEl}
        handleMenuClose={handleMenuClose}
      />
      <Box sx={{ padding: 2 }}>
        {message.type && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}
        {userData ? (
          <UserDetailsCard userData={userData} />
        ) : (
          <Typography>Loading user details...</Typography>
        )}
      </Box>
    </>
  );
}

export default MainComponent;
