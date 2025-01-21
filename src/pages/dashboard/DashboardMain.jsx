import React, { useState, useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
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
  Modal,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Accept icon
import CancelIcon from "@mui/icons-material/Cancel"; // Reject icon
import UserDetailsCard from "../user-data/UserDetails";
import { handleImageDisplay } from "../../utils/handleImageDisplay";
import { useNavigate } from "react-router-dom";
import { languages } from "../../local-variables/languages";

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
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState([]);
  const [showChips, setShowChips] = useState(false);
  const [userImages, setUserImages] = useState({}); // Store user images by their IDs
  const [incomeRequests, setIncomeRequests] = useState([]);
  const [showIncomeRequests, setShowIncomeRequests] = useState(false);
  const [fadingCard, setFadingCard] = useState(null); // Track which card is fading
  const [bio, setBio] = useState({});
  const [open, setOpen] = useState(false);
  const stompClientRef = useRef(null); // Ref to store the stomp client instance

  useEffect(() => {
    const sockjs = new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws`);

    const stompClient = new Client({
      webSocketFactory: () => sockjs,
      debug: (str) => console.log(str), // Optional debugging logs
      reconnectDelay: 5000, // Reconnect after 5 seconds if connection fails
      heartbeatIncoming: 4000, // Heartbeat every 4 seconds (incoming)
      heartbeatOutgoing: 4000, // Heartbeat every 4 seconds (outgoing)
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");

      // Подписка на общий канал /topic/messages
      stompClient.subscribe("/topic/messages", (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log("Parsed message:", receivedMessage.content); // Логирование разобранного сообщения

        // Проверка на "Accepted"
        if (receivedMessage.content === "Accepted") {
          console.log("Accepted message received:", receivedMessage.content);
        } else {
          console.log("Other message received:", receivedMessage.content);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error:", frame.headers["message"]);
      console.error("Additional details:", frame.body);
    };

    stompClient.activate(); // Активируем WebSocket соединение
    stompClientRef.current = stompClient; // Сохраняем ссылку на клиента

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  const sendAcceptBraMessage = () => {
    if (stompClientRef.current?.connected) {
      const message = {
        sender: "Server",
        recipient: "User", // Не важно для серверной логики
        content: "ACCEPT BRA",
        type: "TEXT",
        timestamp: new Date().toISOString(),
      };

      stompClientRef.current.publish({
        destination: "/app/chat.acceptBra",
        body: JSON.stringify(message),
      });

      console.log("Message sent:", message);
    } else {
      console.error("Stomp client is not connected yet.");
    }
  };

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
      if (incomeResponse.status === 401 && incomeResponse.status === 403) {
        navigate("/");
      }
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
      if (userResponse.status === 401 || userResponse.status === 403) {
        navigate("/");
        return;
      }

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
      const allUserIds = [...dismissed, ...incomeRequests];

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

    // Prepare the data to be sent in the form of FormData
    const dismissedData = {
      dismissed: dismissed.filter((id) => id !== userId),
    };

    const formDataToSend = new FormData();
    formDataToSend.append("data", JSON.stringify(dismissedData));

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to update dismissed users:", error);
        return;
      }

      // Update the dismissed state locally
      setDismissed((prev) => prev.filter((id) => id !== userId));
    } catch (error) {
      console.error("Error in handleRemove:", error);
    }
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
    if (dismissedResponse.status === 401 || dismissedResponse.status === 403) {
      navigate("/");
      return;
    }
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
      if (
        connectionResponse.status === 401 &&
        connectionResponse.status === 403
      ) {
        navigate("/");
        return;
      }

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
      //for other side user
      // Step 2: Push currentUserId to the userId's connections array
      const userConnectionResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}/connections`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userConnectionResponse.ok) {
        const errorResponse = await userConnectionResponse.json();
        console.error("Failed to get user connections:", errorResponse);
        return;
      }

      const userConnectionData = await userConnectionResponse.json();
      userConnectionData.connections.push(currentUserId);
      console.log(
        "step two - adding currentUserId to userId's connections:",
        userConnectionData
      );

      // Step 2b: Update userId's connections in DB (with FormData)
      const userFormData = new FormData();
      userFormData.append(
        "data",
        JSON.stringify({
          connections: userConnectionData.connections,
        })
      );

      const finalUserPatchResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: userFormData, // Use FormData here
        }
      );

      if (!finalUserPatchResponse.ok) {
        const errorFinalUserPatchResponse = await finalUserPatchResponse.json();
        console.error(
          "Failed to update user connections in DB (with FormData):",
          errorFinalUserPatchResponse
        );
        return;
      }

      console.log(
        "step two b - userId's connections updated in DB (with FormData): success"
      );

      //&&&
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

  const fetchBios = async (userId) => {
    const token = localStorage.getItem("jwt");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}/bio`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate("/");
        }
        const bioData = await response.json();
        console.log(`Bio for ${userId}:`, bioData);
        setBio(bioData);
        setOpen(true);
      } else {
        console.error(`Failed to fetch bio for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error fetching bio for user ${userId}:`, error);
    }
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
      {/* <UserDetailsCard userData={userData} /> */}

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
                    ? "animate__animated animate__fadeOut"
                    : "animate__animated animate__fadeIn"
                }
                key={userId}
                sx={{ textAlign: "center" }}
              >
                {" "}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  <Avatar
                    alt={userId.toString()}
                    src={handleImageDisplay(userImages[userId])}
                    sx={{ width: 100, height: 100, marginRight: 2 }}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      backgroundColor: "rgb(44, 44, 44)",
                      color: "#f4f3f3",

                      fontFamily: "Poppins",
                      fontWeight: 600,
                    }}
                    onClick={() => fetchBios(userId)}
                  >
                    Bio
                  </Button>
                  <Modal
                    open={open}
                    onClose={() => setOpen(false)}
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
                        width: 300,
                        bgcolor: "#f0efef",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        p: 4,
                      }}
                    >
                      <Typography
                        variant="h4"
                        align="center"
                        sx={{ fontFamily: "Poppins", fontWeight: 600 }}
                      >
                        Biographical
                      </Typography>
                      <Divider
                        sx={{ my: 2, borderColor: "black", width: "100%" }}
                      />

                      <Typography
                        variant="h5"
                        align="center"
                        sx={{ fontWeight: 600, mt: 2 }}
                      >
                        {bio.name} {bio.lastname}
                      </Typography>

                      <Typography
                        variant="h6"
                        align="center"
                        sx={{ fontWeight: 600, mt: 2 }}
                      >
                        Age
                      </Typography>
                      <Typography variant="body1" align="center">
                        {bio.age}
                      </Typography>

                      <Typography
                        variant="h6"
                        align="center"
                        sx={{ fontWeight: 600, mt: 2 }}
                      >
                        Gender{" "}
                      </Typography>
                      <Typography variant="body1" align="center">
                        {bio.gender}
                      </Typography>
                      <Typography
                        variant="h6"
                        align="center"
                        sx={{ fontWeight: 600, mt: 2 }}
                      >
                        City{" "}
                      </Typography>
                      <Typography variant="body1" align="center">
                        {bio.city}
                      </Typography>

                      <Typography
                        variant="h6"
                        align="center"
                        sx={{ fontWeight: 600, mt: 2 }}
                      >
                        Hobbies
                      </Typography>

                      <Typography variant="body1" align="center">
                        {bio.hobbies?.join(", ") || ""}
                      </Typography>
                      <Typography
                        variant="h6"
                        align="center"
                        sx={{ fontWeight: 600, mt: 2 }}
                      >
                        Languages
                      </Typography>
                      <Box align="center">
                        {bio?.languages?.map((lang, index) => (
                          <Chip
                            key={index}
                            label={languages[lang]}
                            sx={{ m: 0.5, fontSize: "2rem" }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Modal>
                </Box>{" "}
                <></>
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
                  {/* <Avatar
                    alt={userId.toString()}
                    src={handleImageDisplay(userImages[userId])}
                    sx={{ width: 100, height: 100, marginRight: 2 }}
                  /> */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#721c24",
                          color: "#f4f3f3",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          fontFamily: "Poppins",
                          border: "none",
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
                      </Button>{" "}
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          backgroundColor: "rgb(44, 44, 44)",
                          color: "#f4f3f3",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          fontFamily: "Poppins",
                          border: "none",
                        }}
                        onClick={() => {
                          sendAcceptBraMessage();
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
