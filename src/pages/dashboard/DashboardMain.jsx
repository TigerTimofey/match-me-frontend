import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  FormControlLabel,
  Chip,
  Avatar,
  Switch,
  styled,
} from "@mui/material";
import UserDetailsCard from "../user-data/UserDetails";
import { handleImageDisplay } from "../../utils/handleImageDisplay";

const MatchSwitcher = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#65C466",
        opacity: 1,
        border: 0,
        ...theme.applyStyles("dark", {
          backgroundColor: "#2ECA45",
        }),
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 13,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

function DashboardMain({ userData, currentUserId }) {
  const [dismissed, setDismissed] = useState([]);
  const [showChips, setShowChips] = useState(false);
  const [userImages, setUserImages] = useState({}); // Store user images by their IDs

  useEffect(() => {
    const fetchDismissed = async () => {
      const token = localStorage.getItem("jwt");

      const userResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/dismissed`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        console.error(
          "Failed to fetch dismissed users:",
          await userResponse.json()
        );
        return;
      }

      const data = await userResponse.json();
      setDismissed(data.dismissed || []);
    };

    fetchDismissed();
  }, [currentUserId]);

  useEffect(() => {
    const fetchUserImages = async () => {
      const token = localStorage.getItem("jwt");

      for (const userId of dismissed) {
        const userResponse = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userData = await userResponse.json();
        setUserImages((prevImages) => ({
          ...prevImages,
          [userId]: userData.image,
        }));
      }
    };

    if (dismissed.length > 0) {
      fetchUserImages();
    }
  }, [dismissed]);

  const handleRemove = async (userId) => {
    const token = localStorage.getItem("jwt");

    const response = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/dismissed`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dismissed.filter((id) => id !== userId)),
      }
    );

    if (!response.ok) {
      console.error("Failed to update dismissed users:", await response.json());
      return;
    }

    setDismissed((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mb: 3,
          color: "rgb(44,44,44)",
          letterSpacing: 3,
        }}
      >
        Dashboard
      </Typography>
      <UserDetailsCard userData={userData} />
      {dismissed.length > 0 && (
        <Card
          sx={{
            mt: 3,
            padding: 3,
            boxShadow: 2,
            backgroundColor: "#f0efef",
            color: "rgb(44,44,44)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FormControlLabel
            sx={{
              gap: 1,
              "& .MuiFormControlLabel-label": {
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "rgb(44,44,44)",
              },
            }}
            control={
              <MatchSwitcher
                checked={showChips}
                onChange={(e) => setShowChips(e.target.checked)}
              />
            }
            label={showChips ? "Hide Dismissed Users" : "Show Dismissed Users"}
          />
        </Card>
      )}
      {showChips && dismissed.length > 0 && (
        <Card
          sx={{
            mt: 3,
            padding: 1,
            boxShadow: 2,
            backgroundColor: "#f0efef",
            color: "rgb(44,44,44)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            {dismissed.map((userId) => (
              <Chip
                key={userId}
                avatar={
                  <Avatar
                    alt={userId.toString()}
                    src={handleImageDisplay(userImages[userId])}
                  />
                }
                label={`User ID: ${userId}`}
                onDelete={() => handleRemove(userId)}
                variant="outlined"
                sx={{ m: 1 }}
              />
            ))}
          </Box>
        </Card>
      )}
    </Box>
  );
}

export default DashboardMain;
