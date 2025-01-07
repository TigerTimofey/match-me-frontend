import TelegramIcon from "@mui/icons-material/Telegram";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Modal,
  styled,
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
  const [bios, setBios] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openChatModal, setOpenChatModal] = useState(false);
  const [userImages, setUserImages] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

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

      if (response.status === 401) {
        navigate("/me");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch connections.");
      }

      const connectionsData = await response.json();
      setConnections(connectionsData.connections);
      await fetchBios(connectionsData.connections, token);

      // Fetch image for each connectionId
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

      if (response.status === 401) {
        navigate("/me");
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
      debug: function (str) {
        console.log(str);
      },
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

      // Fetch the user image
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
  };
  const handleOpenChatModal = (userId) => {
    const userBio = bios[userId];
    if (userBio) {
      console.log("Opening chat with user:", userId, "type:", typeof userId);
      setSelectedUser(userBio);
      setSelectedUserId(String(userId));
      setOpenChatModal(true);
    }
  };

  const handleCloseChatModal = () => {
    setOpenChatModal(false);
    setSelectedUser(null);
    setSelectedUserId(null);
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
          {connections.map((connectionId, index) => {
            const connectionBio = bios[connectionId];
            if (!connectionBio) return null;

            return (
              <Grid xs={12} sm={4} md={4} key={index}>
                <Card
                  sx={{
                    padding: 5,
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
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* <ChatModal open={openModal} onClose={handleCloseModal} /> */}
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
            transform: "translate(-50%, -50%)", // Center the modal
            width: "80%", // Adjust modal width
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
