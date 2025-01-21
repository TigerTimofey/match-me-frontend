import TelegramIcon from "@mui/icons-material/Telegram";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Modal,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Client } from "@stomp/stompjs";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import { languages } from "../../local-variables/languages";
import { handleImageDisplay } from "../../utils/handleImageDisplay";
import ChatModal from "./components/chat/ChatModal";

function ConnectionsMain({ currentUserId }) {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [bios, setBios] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [userImages, setUserImages] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastMessageTimestamps, setLastMessageTimestamps] = useState({});
  const [newMessage, setNewMessage] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(() => {
    const savedUnread = localStorage.getItem("unreadMessages");
    return savedUnread ? JSON.parse(savedUnread) : {};
  });
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const loadChatHistory = async (connectionId) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/messages/${currentUserId}/${connectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const history = await response.json();

        const formattedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        const lastMessage = formattedHistory[formattedHistory.length - 1];

        if (lastMessage) {
          const currentTime = Date.now();
          if (currentTime - lastUpdate > 5000) {
            const lastMessageDate = lastMessage.timestamp;
            setLastMessageTimestamps((prev) => ({
              ...prev,
              [connectionId]: lastMessageDate,
            }));
            setLastUpdate(currentTime);
            fetchConnections();
          }
        }
      } else {
        console.error(
          `Failed to load chat history for connection ${connectionId}`
        );
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadHistoryForAllConnections = async () => {
      if (connections.length > 0) {
        for (const connectionId of connections) {
          await loadChatHistory(connectionId);
        }
      }
    };

    loadHistoryForAllConnections();
  }, [connections]);

  const fetchConnections = async () => {
    const token = localStorage.getItem("jwt");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/connections`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 && response.status === 403) {
        navigate("/");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch connections.");
      }

      const connectionsData = await response.json();
      setConnections(connectionsData.connections);
      await fetchBios(connectionsData.connections, token);

      const imagePromises = connectionsData.connections.map(
        async (connectionId) => {
          const image = await fetchUserImage(connectionId);
          return { connectionId, image };
        }
      );

      const images = await Promise.all(imagePromises);
      const imagesMap = images.reduce((acc, { connectionId, image }) => {
        acc[connectionId] = image;
        return acc;
      }, {});
      setUserImages(imagesMap);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    }
  };

  const fetchBios = async (connectionIds, token) => {
    const bioPromises = connectionIds.map(async (connectionId) => {
      const bioResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${connectionId}/bio`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (bioResponse.ok) {
        const bioData = await bioResponse.json();
        setBios((prevBios) => ({
          ...prevBios,
          [connectionId]: bioData,
        }));
      } else {
        console.error(`Failed to fetch bio for connection ${connectionId}`);
      }
    });

    await Promise.all(bioPromises);
    setLoading(false);
  };

  const fetchDismissedData = async (userId) => {
    const token = localStorage.getItem("jwt");

    try {
      const responseDismiss = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/dismissed`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const currentDismissed = await responseDismiss.json();

      // Ensure currentDismissed is an array
      const dismissedArray = Array.isArray(currentDismissed)
        ? currentDismissed
        : [];

      // Add the userId to the dismissed list if not already present
      if (!dismissedArray.includes(userId)) {
        dismissedArray.push(userId);
      }

      setDismissed(dismissedArray);
      console.log(`${currentUserId} dismissed: `, dismissedArray);

      // Prepare formData with the updated dismissed list
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          dismissed: dismissedArray,
        })
      );

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("User dismissed updated successfully:", updatedData);
      } else {
        const errorData = await response.json();
        console.error("Failed to update dismissed list:", errorData);
      }
    } catch (error) {
      console.error("Error updating dismissed list:", error);
    }
  };
  const removeFromOutcomeOther = async (userId) => {
    try {
      const token = localStorage.getItem("jwt");

      // Fetch current user's outcomeRequests
      const userResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}/outcome-requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        console.error("Failed to fetch user data:", await userResponse.json());
        return;
      }

      const userData = await userResponse.json();
      let currentOutcomeRequests = userData.outcomeRequests || [];

      // Remove currentUserId from outcomeRequests
      currentOutcomeRequests = currentOutcomeRequests.filter(
        (id) => id !== currentUserId
      );

      // Prepare data for the PATCH request
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          outcomeRequests: currentOutcomeRequests,
        })
      );

      // Send PATCH request to update outcomeRequests
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("Outcome requests updated successfully:", updatedData);
      } else {
        const errorData = await response.json();
        console.error("Failed to update Outcome requests:", errorData);
      }
    } catch (error) {
      console.error("Error updating connection requests:", error);
    }

    try {
      const token = localStorage.getItem("jwt");

      // Fetch current user's outcomeRequests
      const userResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/outcome-requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        console.error("Failed to fetch user data:", await userResponse.json());
        return;
      }

      const userData = await userResponse.json();
      let currentOutcomeRequests = userData.outcomeRequests || [];

      // Remove currentUserId from outcomeRequests
      currentOutcomeRequests = currentOutcomeRequests.filter(
        (id) => id !== userId
      );

      // Prepare data for the PATCH request
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          outcomeRequests: currentOutcomeRequests,
        })
      );

      // Send PATCH request to update outcomeRequests
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("Outcome requests updated successfully:", updatedData);
      } else {
        const errorData = await response.json();
        console.error("Failed to update Outcome requests:", errorData);
      }
    } catch (error) {
      console.error("Error updating connection requests:", error);
    }
  };

  const handleDisconnect = async (userId) => {
    console.log(`${currentUserId} want to disconnect with ${userId}`);
    fetchDismissedData(userId);
    removeFromOutcomeOther(userId);
    // Ensure the token is available and valid
    const token = localStorage.getItem("jwt");
    if (!token) {
      console.error("No token found. Please log in again.");
      return;
    }

    const updatedConnections = connections.filter((id) => id !== userId);

    try {
      // Send the updated connections to the backend
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/connections`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedConnections),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update connections: ${response.statusText}`);
      }

      const userConnectionsResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}/connections`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userConnectionsResponse.ok) {
        throw new Error(
          `Failed to fetch connections for userId: ${userConnectionsResponse.statusText}`
        );
      }

      const userConnections = await userConnectionsResponse.json();
      console.log(userConnections.connections);

      const updatedConnectionsForOther = userConnections.connections.filter(
        (id) => id !== currentUserId
      );

      try {
        // Send the updated connections to the backend
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}/connections`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedConnectionsForOther),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update connections: ${response.statusText}`
          );
        }

        // Update the UI state with the updated connections
        setConnections(updatedConnections);
      } catch (error) {
        console.error("Error disconnecting user:", error);
      }
    } catch (error) {
      console.error("Error disconnecting user:", error);
    }
  };

  const fetchUserImage = async (connectionId) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${connectionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401 && response.status === 403) {
        navigate("/");
        return;
      }
      if (response.ok) {
        const user = await response.json();
        return user.image;
      }

      console.error(
        `Failed to fetch image for user with connectionId ${connectionId}`
      );
    } catch (err) {
      console.error(
        `Error fetching user image with connectionId ${connectionId}:`,
        err
      );
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [currentUserId]);

  useEffect(() => {
    const sockjs = new SockJS(
      `${process.env.REACT_APP_SERVER_URL}/ws?userId=${currentUserId}`
    );

    const stompClient = new Client({
      webSocketFactory: () => sockjs,
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      stompClient.subscribe("/topic/status", (statusMessage) => {
        const status = JSON.parse(statusMessage.body);
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (status.content === "ONLINE") {
            newSet.add(status.sender);
          } else {
            newSet.delete(status.sender);
          }
          return newSet;
        });
      });

      stompClient.subscribe(
        `/user/${currentUserId}/queue/messages`,
        (message) => {
          const receivedMessage = JSON.parse(message.body);
          console.log("receivedMessage", receivedMessage);

          // Only handle "CHAT" type messages
          if (receivedMessage.type === "CHAT") {
            const senderId = receivedMessage.sender;

            setUnreadMessages((prev) => {
              const updated = { ...prev };

              // Mark the message as unread if the user hasn't seen it
              if (!updated[senderId]) {
                updated[senderId] = true; // New unread message
                localStorage.setItem("unreadMessages", JSON.stringify(updated));
              }
              fetchConnections();
              return updated;
            });
          }
        }
      );
    };

    stompClient.activate();

    return () => {
      if (stompClient.connected) {
        stompClient.deactivate();
      }
    };
  }, [currentUserId]);

  const handleOpenModal = async (userId) => {
    const userBio = bios[userId];
    if (userBio) {
      setSelectedUser(userBio);

      const userImage = await fetchUserImage(userId);
      setSelectedUser((prevUser) => ({
        ...prevUser,
        image: userImage,
      }));

      setOpenModal(true);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
    fetchConnections();
  };

  const handleOpenChatModal = (userId) => {
    const userBio = bios[userId];
    if (userBio) {
      setSelectedUser(userBio);
      setSelectedUserId(String(userId));
      setOpenChatModal(true);

      // Mark messages from this user as seen
      setUnreadMessages((prev) => {
        const updated = { ...prev };
        delete updated[userId]; // Remove from unread messages
        localStorage.setItem("unreadMessages", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleCloseChatModal = () => {
    setOpenChatModal(false);
    setSelectedUser(null);
    setSelectedUserId(null);
    fetchConnections();
    setUnreadMessages(0);
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
        Connections
      </Typography>
      {loading ? (
        <Typography sx={{ mt: 5 }} textAlign="center">
          Loading...
        </Typography>
      ) : error ? (
        <Typography sx={{ mt: 5 }} color="error" textAlign="center">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {connections
            .sort((a, b) => {
              const timestampA = lastMessageTimestamps[a];
              const timestampB = lastMessageTimestamps[b];
              return timestampB - timestampA;
            })
            .map((connectionId, index) => {
              const connectionBio = bios[connectionId];
              if (!connectionBio) return null;

              return (
                <Grid xs={12} sm={4} md={4} key={index}>
                  <Card
                    sx={{
                      padding: 1,
                      boxShadow: 2,
                      backgroundColor: "#f0efef",
                      color: "rgb(44,44,44)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                      msUserSelect: "none",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        fontWeight: "bold",
                        color: onlineUsers.has(connectionId.toString())
                          ? "rgb(21, 121, 21)"
                          : "rgb(125, 59, 59)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {onlineUsers.has(connectionId.toString())
                        ? "Online"
                        : "Offline"}
                    </Box>

                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      mt={2}
                    >
                      <Avatar
                        src={handleImageDisplay(userImages[connectionId])}
                        sx={{ width: 100, height: 100, boxShadow: 3 }}
                      />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                      {connectionBio.name || "Unknown User"}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      Age: {connectionBio.age}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        mt: 3,
                        gap: 1,
                      }}
                    >
                      <Button
                        variant="outlined"
                        sx={{
                          color: "#f4f3f3",
                          backgroundColor: "rgb(62, 47, 47)",
                          fontWeight: 600,
                          border: "none",
                          fontFamily: "Poppins",
                          "&:hover": { backgroundColor: "rgb(62, 47, 47)" },
                        }}
                        onClick={() => handleDisconnect(connectionId)}
                      >
                        <RemoveCircleOutlineIcon />
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{
                          color: "#f4f3f3",
                          backgroundColor: "rgb(44,44,44)",
                          fontWeight: 600,
                          border: "none",
                          fontFamily: "Poppins",
                          "&:hover": { backgroundColor: "rgb(72, 71, 71)" },
                        }}
                        onClick={() => handleOpenModal(connectionId)}
                      >
                        Profile
                      </Button>
                      <Badge
                        // badgeContent={unreadMessages[connectionId] || 0}
                        badgeContent={unreadMessages[connectionId] ? "New" : 0}
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: "rgb(10, 146, 101)",
                            color: "white",
                            p: 1,
                            fontSize: "0.75rem",
                          },
                        }}
                      >
                        <Button
                          variant="outlined"
                          sx={{
                            color: "#f4f3f3",
                            backgroundColor: "rgb(44,44,44)",
                            fontWeight: 600,
                            border: "none",
                            fontFamily: "Poppins",
                            "&:hover": { backgroundColor: "rgb(72, 71, 71)" },
                          }}
                          onClick={() => handleOpenChatModal(connectionId)}
                        >
                          <TelegramIcon />
                        </Button>
                      </Badge>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      )}

      {/* Modal for Profile View */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            bgcolor: "#f0efef",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            p: 4,
          }}
        >
          {selectedUser && (
            <>
              <Typography
                variant="h4"
                align="center"
                sx={{ fontFamily: "Poppins", fontWeight: 600 }}
              >
                Biographical
              </Typography>
              <Divider sx={{ my: 2, borderColor: "black" }} />

              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                {selectedUser.name} {selectedUser.lastname}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Age
              </Typography>
              <Typography variant="body1" align="center">
                {selectedUser.age}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Gender
              </Typography>
              <Typography variant="body1" align="center">
                {selectedUser.genres}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                City
              </Typography>
              <Typography variant="body1" align="center">
                {selectedUser.city}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Hobbies
              </Typography>
              <Typography variant="body1" align="center">
                {selectedUser.hobbies?.join(", ") || ""}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Languages
              </Typography>
              <Box sx={{ textAlign: "center" }}>
                {selectedUser.languages?.map((lang, index) => (
                  <Chip
                    key={index}
                    label={languages[lang]}
                    sx={{ m: 0.5, fontSize: "2rem" }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      </Modal>
      <ChatModal
        open={openChatModal}
        onClose={handleCloseChatModal}
        selectedUser={selectedUser}
        selectedUserId={selectedUserId}
        currentUserId={currentUserId}
      />
    </Box>
  );
}

export default ConnectionsMain;
