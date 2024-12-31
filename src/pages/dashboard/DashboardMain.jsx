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
  Divider,
  Button,
  IconButton,
  ButtonGroup,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Accept icon
import CancelIcon from "@mui/icons-material/Cancel"; // Reject icon
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
  const [incomeRequests, setIncomeRequests] = useState([]);
  const [showIncomeRequests, setShowIncomeRequests] = useState(false);
  const [fadingCard, setFadingCard] = useState(null); // Track which card is fading

  useEffect(() => {
    const fetchIncomeRequests = async () => {
      const token = localStorage.getItem("jwt");

      const incomeResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/income-requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await incomeResponse.json();
      setIncomeRequests(data.incomeRequests || []);
    };

    fetchIncomeRequests();
  }, [currentUserId]);

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
      const allUserIds = [...dismissed, ...incomeRequests]; // Merge dismissed and income requests IDs

      for (const userId of allUserIds) {
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

    if (dismissed.length > 0 || incomeRequests.length > 0) {
      fetchUserImages();
    }
  }, [dismissed, incomeRequests]);

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
  const handleIncomeRequestRemove = async (userId) => {
    const token = localStorage.getItem("jwt");

    // Remove the declined user from income requests
    const incomeRequestResponse = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/income-requests`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(incomeRequests.filter((id) => id !== userId)),
      }
    );

    if (!incomeRequestResponse.ok) {
      console.error(
        "Failed to update income requests:",
        await incomeRequestResponse.json()
      );
      return;
    }

    // Add the declined user to the dismissed array
    const updatedDismissed = [...dismissed, userId];

    const dismissedResponse = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/dismissed`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedDismissed),
      }
    );

    if (!dismissedResponse.ok) {
      console.error(
        "Failed to update dismissed users:",
        await dismissedResponse.json()
      );
      return;
    }

    // Now remove the current user from the outcomeRequests of the declined user
    const outcomeRequestsResponse = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}/outcome-requests`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          (
            await (
              await fetch(
                `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}/outcome-requests`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
            ).json()
          ).outcomeRequests.filter((id) => id !== currentUserId)
        ),
      }
    );

    if (!outcomeRequestsResponse.ok) {
      console.error(
        "Failed to update outcome requests of the declined user:",
        await outcomeRequestsResponse.json()
      );
      return;
    }

    setDismissed(updatedDismissed);
    setIncomeRequests((prev) => prev.filter((id) => id !== userId));
  };
  const handleAcceptRequest = async (userId) => {
    const token = localStorage.getItem("jwt");

    try {
      // Step 1: Get the current connection data
      const connectionResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/connections`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!connectionResponse.ok) {
        const errorResponse = await connectionResponse.json();
        console.error("Failed to establish connection:", errorResponse);
        return;
      }

      const connectionData = await connectionResponse.json();
      console.log("step one - getting connection: success", connectionData);

      // Step 2: Push userId to connections array
      connectionData.connections.push(userId);
      console.log("step two - adding userId to connections:", connectionData);

      // Step 3: Create FormData object
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          connections: connectionData.connections,
        })
      );

      // Step 4: Send the request with FormData to update connection
      const patchResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${connectionData.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData, // Use FormData as the body
        }
      );

      if (!patchResponse.ok) {
        const errorPatchResponse = await patchResponse.json();
        console.error(
          "Failed to update connections in DB:",
          errorPatchResponse
        );
        return;
      }

      console.log("step four - updating connections in DB: success");

      // Step 5: Fetch the updated data (new connections)
      const updatedConnectionResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/connections`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!updatedConnectionResponse.ok) {
        const errorUpdatedResponse = await updatedConnectionResponse.json();
        console.error(
          "Failed to fetch updated connections:",
          errorUpdatedResponse
        );
        return;
      }

      const updatedConnectionData = await updatedConnectionResponse.json();
      console.log(
        "step five - fetching updated connection data: success",
        updatedConnectionData
      );
    } catch (error) {
      console.error("Error in accepting the request:", error);
    }
    // Step 6: Remove userId from incomeRequests
    const incomeRequestsResponse = await fetch(
      `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/income-requests`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          (
            await (
              await fetch(
                `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/income-requests`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              )
            ).json()
          ).incomeRequests.filter((id) => id !== userId)
        ),
      }
    );

    if (!incomeRequestsResponse.ok) {
      const errorIncomeRequestResponse = await incomeRequestsResponse.json();
      console.error(
        "Failed to update income requests (remove userId):",
        errorIncomeRequestResponse
      );
      return;
    }

    console.log("step six - userId removed from incomeRequests: success");
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mb: 3,
          color: "rgb(44,44,44)",
        }}
      >
        Dashboard
      </Typography>
      <UserDetailsCard userData={userData} />

      {incomeRequests.length > 0 && (
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
                checked={showIncomeRequests}
                onChange={(e) => setShowIncomeRequests(e.target.checked)}
              />
            }
            label={showIncomeRequests ? "Hide Requests" : "Show Requests"}
          />
        </Card>
      )}

      {showIncomeRequests && incomeRequests.length > 0 && (
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
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, textAlign: "center", pt: 1 }}
            >
              Match requests
            </Typography>
            <Divider sx={{ my: 1, width: "100%" }} />
            {incomeRequests.map((userId) => (
              <Box
                className={
                  fadingCard?.userId === userId
                    ? `animate__animated ${
                        fadingCard.action === "accept"
                          ? "animate__fadeOutLeft"
                          : "animate__fadeOutRight"
                      }`
                    : "animate__animated animate__fadeIn"
                }
                key={userId}
                sx={{ textAlign: "center" }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "rgb(44,44,44)",
                    fontWeight: 600,
                    fontSize: "1rem",
                    fontFamily: "Poppins",
                  }}
                >
                  User ID: {userId}
                </Typography>
                <Box
                  key={userId}
                  sx={{
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: 1,
                    boxSizing: "border-box",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {" "}
                  <Button
                    size="small"
                    color="primary"
                    variant="contained"
                    sx={{
                      backgroundColor: "rgb(44, 44, 44)",
                      color: "#f4f3f3",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      fontFamily: "Poppins",
                      mr: 2,
                    }}
                    onClick={() => {
                      setFadingCard({ userId, action: "accept" });
                      setTimeout(() => {
                        handleAcceptRequest(userId);
                        setIncomeRequests((prev) =>
                          prev.filter((id) => id !== userId)
                        );
                        setFadingCard(null);
                      }, 1000);
                    }}
                    startIcon={<CheckCircleIcon />}
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => {
                      handleAcceptRequest(userId);
                    }}
                  >
                    test
                  </Button>
                  <Avatar
                    alt={userId.toString()}
                    src={handleImageDisplay(userImages[userId])}
                    sx={{ width: 50, height: 50, marginRight: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <ButtonGroup
                        orientation="vertical"
                        aria-label="Vertical button group"
                        // variant="text"
                        variant="contained"
                      >
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            backgroundColor: "#721c24",
                            color: "#f4f3f3",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            fontFamily: "Poppins",
                          }}
                          onClick={() => {
                            setFadingCard({ userId, action: "decline" });
                            setTimeout(() => {
                              handleIncomeRequestRemove(userId);
                              setFadingCard(null);
                            }, 1000);
                          }}
                          startIcon={<CancelIcon />}
                        >
                          Decline
                        </Button>
                      </ButtonGroup>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      )}
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
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, textAlign: "center", pt: 1 }}
            >
              Dismissed users
            </Typography>
            <Divider sx={{ my: 1, width: "100%" }} />
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
