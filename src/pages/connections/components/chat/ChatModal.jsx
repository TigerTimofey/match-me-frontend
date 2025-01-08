import {
  Box,
  Button,
  Divider,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { Client } from "@stomp/stompjs";
import React, { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";

const ChatModal = ({
  open,
  onClose,
  selectedUser,
  currentUserId,
  selectedUserId,
}) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const stompClient = useRef(null);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${day}/${month}/${year} - ${time}`;
  };

  useEffect(() => {
    if (open && selectedUserId) {
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [open, selectedUserId]);

  useEffect(() => {
    if (!open) {
      console.log("Resetting online status due to modal close");
      setIsUserOnline(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && selectedUserId && stompClient.current?.connected) {
      console.log("Requesting status check for user:", selectedUserId);
      stompClient.current.publish({
        destination: "/app/user.status.check",
        body: JSON.stringify({
          sender: currentUserId,
          type: "STATUS_CHECK",
        }),
      });
    }
  }, [open, selectedUserId, currentUserId]);

  useEffect(() => {
    console.log("Selected user changed to:", selectedUserId);
    if (selectedUserId && stompClient.current?.connected) {
      requestUserStatus();
    }
  }, [selectedUserId]);

  const sendOfflineStatus = () => {
    if (stompClient.current && stompClient.current.connected) {
      try {
        console.log("Sending OFFLINE status for user:", currentUserId);
        const statusMessage = {
          sender: String(currentUserId),
          type: "STATUS",
          content: "OFFLINE",
        };
        console.log("Status message:", statusMessage);
        stompClient.current.publish({
          destination: "/app/user.offline",
          body: JSON.stringify(statusMessage),
        });
      } catch (error) {
        console.error("Error sending offline status:", error);
      }
    }
  };

  const disconnectWebSocket = () => {
    if (stompClient.current?.connected) {
      sendOfflineStatus();
      stompClient.current.deactivate();
    }
    setIsConnected(false);
    setIsUserOnline(false);
  };

  const connectWebSocket = () => {
    try {
      const sockjs = new SockJS(
        `${process.env.REACT_APP_SERVER_URL}/ws?userId=${currentUserId}`
      );

      stompClient.current = new Client({
        webSocketFactory: () => sockjs,
        debug: function (str) {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onStompError: (frame) => {
          console.error("STOMP error:", frame);
          setIsConnected(false);
        },
        onWebSocketClose: () => {
          console.log("WebSocket connection closed");
          setIsConnected(false);
        },
      });

      stompClient.current.onConnect = () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);

        stompClient.current.subscribe(
          `/user/${currentUserId}/queue/messages`,
          (message) => {
            const receivedMessage = JSON.parse(message.body);
            setMessages((prev) => [
              ...prev,
              {
                ...receivedMessage,
                timestamp: receivedMessage.timestamp
                  ? new Date(receivedMessage.timestamp)
                  : new Date(),
              },
            ]);
          }
        );

        stompClient.current.subscribe("/topic/status", (statusMessage) => {
          const status = JSON.parse(statusMessage.body);
          console.log("Received status message:", status);
          console.log("Current selectedUserId:", selectedUserId);
          console.log("Comparing with sender:", status.sender);
          console.log("Current online status:", isUserOnline);

          if (status.sender === String(selectedUserId)) {
            const newStatus = status.content === "ONLINE";
            console.log(
              `Updating status for user ${selectedUserId} to ${newStatus}`
            );
            setIsUserOnline(newStatus);
          } else {
            console.log("Status message is not for selected user");
          }
        });

        sendOnlineStatus();
        if (selectedUserId) {
          requestUserStatus();
        }
      };

      stompClient.current.onWebSocketClose = () => {
        if (stompClient.current?.connected) {
          sendOfflineStatus();
        }
        setIsConnected(false);
        setIsUserOnline(false);
      };

      stompClient.current.activate();
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      setIsConnected(false);
    }
  };

  const sendJoinMessage = () => {
    if (stompClient.current && stompClient.current.connected) {
      try {
        console.log(
          "Sending JOIN message from:",
          currentUserId,
          "to:",
          selectedUserId
        );
        stompClient.current.publish({
          destination: "/app/chat.join",
          body: JSON.stringify({
            sender: String(currentUserId),
            recipient: String(selectedUserId),
            type: "JOIN",
          }),
        });
      } catch (error) {
        console.error("Error sending join message:", error);
      }
    }
  };

  const sendOnlineStatus = () => {
    if (stompClient.current && stompClient.current.connected) {
      try {
        console.log("Sending ONLINE status for user:", currentUserId);
        const statusMessage = {
          sender: String(currentUserId),
          type: "STATUS",
          content: "ONLINE",
        };
        console.log("Sending status message:", statusMessage);
        stompClient.current.publish({
          destination: "/app/user.online",
          body: JSON.stringify(statusMessage),
        });
      } catch (error) {
        console.error("Error sending online status:", error);
      }
    }
  };

  const requestUserStatus = () => {
    console.log("Requesting status for user:", selectedUserId);
    stompClient.current.publish({
      destination: "/app/user.status.check",
      body: JSON.stringify({
        sender: currentUserId,
        recipient: selectedUserId,
        type: "STATUS",
      }),
    });
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !isConnected) return;

    const newMessage = {
      content: messageInput,
      sender: currentUserId,
      recipient: selectedUserId,
      type: "CHAT",
      timestamp: new Date().toISOString(),
    };

    try {
      stompClient.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify(newMessage),
      });

      setMessages((prev) => [
        ...prev,
        { ...newMessage, timestamp: new Date() },
      ]);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontFamily: "Poppins", fontWeight: 600 }}
              >
                Chat with {selectedUser.name}
              </Typography>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: isUserOnline ? "success.main" : "grey.400",
                  display: "inline-block",
                }}
              />
              <Typography
                variant="body2"
                sx={{ color: isUserOnline ? "success.main" : "grey.600" }}
              >
                {isUserOnline ? "online" : "offline"}
              </Typography>
            </Box>

            <Divider sx={{ my: 2, borderColor: "black" }} />

            {/* Статус подключения */}
            <Typography
              variant="body2"
              align="center"
              sx={{
                color: isConnected ? "green" : "red",
                mb: 1,
              }}
            >
              {isConnected ? "Connected" : "Connecting..."}
            </Typography>

            {/* Сообщения */}
            <Box sx={{ height: 300, overflowY: "auto", mb: 2, p: 2 }}>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      msg.sender === currentUserId ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Timestamp */}
                  {msg.timestamp && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "grey.600",
                        textAlign: "center",
                      }}
                    >
                      {formatTimestamp(msg.timestamp)}
                    </Typography>
                  )}
                  {/* Message Content */}
                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: "70%",

                      p: 1,
                      borderRadius: 2,
                      backgroundColor:
                        msg.sender === currentUserId
                          ? "rgb(44,44,44)"
                          : "#c8c7c7",
                      color:
                        msg.sender === currentUserId
                          ? "white"
                          : "rgb(44,44,44)",
                      textAlign: "center",
                    }}
                  >
                    {msg.content}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Ввод сообщения */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                disabled={!isConnected}
              />
              <Button
                onClick={sendMessage}
                disabled={!isConnected}
                variant="contained"
                size="small"
                sx={{
                  color: "#f4f3f3",
                  fontWeight: 600,
                  fontSize: "1rem",
                  backgroundColor: "rgb(44,44,44)",
                  color: "#f4f3f3",
                  "&:hover": {
                    backgroundColor: "rgb(60,60,60)",
                  },
                }}
              >
                Send
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ChatModal;
