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
  const [isTyping, setIsTyping] = useState(false);
  const [lastTypingTime, setLastTypingTime] = useState(0);
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null);
  const [visibleMessageCount, setVisibleMessageCount] = useState(5);

  const handleScroll = (e) => {
    if (e.target.scrollTop === 0) {
      setVisibleMessageCount((prevCount) => prevCount + 5);
    }
  };
  const visibleMessages = messages.slice(-visibleMessageCount);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} - ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const handleMessageReceived = (message) => {
    const receivedMessage = JSON.parse(message.body);
    switch (receivedMessage.type) {
      case "TYPING":
        if (String(receivedMessage.sender) === String(selectedUserId)) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 2000);
        }
        break;
      case "CHAT":
        setMessages((prev) => {
          const messageWithFlag = {
            ...receivedMessage,
            timestamp: new Date(receivedMessage.timestamp),
            sentByMe: String(receivedMessage.sender) === String(currentUserId),
          };
          return prev.some(
            (msg) =>
              msg.timestamp.getTime() === messageWithFlag.timestamp.getTime() &&
              msg.sender === messageWithFlag.sender &&
              msg.content === messageWithFlag.content
          )
            ? prev
            : [...prev, messageWithFlag];
        });
        break;
      case "STATUS":
        if (String(receivedMessage.sender) === String(selectedUserId)) {
          setIsUserOnline(receivedMessage.content === "ONLINE");
        }
        break;
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem("jwt");
    const sockjs = new SockJS(
      `${process.env.REACT_APP_SERVER_URL}/ws?token=${token}`
    );

    stompClient.current = new Client({
      webSocketFactory: () => sockjs,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.current.onConnect = () => {
      setIsConnected(true);

      stompClient.current.subscribe(
        `/user/${currentUserId}/queue/messages`,
        handleMessageReceived,
        { Authorization: `Bearer ${token}` }
      );

      stompClient.current.subscribe(
        "/topic/status",
        (message) => {
          const statusMessage = JSON.parse(message.body);
          if (String(statusMessage.sender) === String(selectedUserId)) {
            setIsUserOnline(statusMessage.content === "ONLINE");
          }
        },
        { Authorization: `Bearer ${token}` }
      );

      // Отправляем начальные статусы
      [
        { destination: "/app/chat.join", message: { type: "JOIN" } },
        {
          destination: "/app/user.online",
          message: { type: "STATUS", content: "ONLINE" },
        },
        {
          destination: "/app/user.status.check",
          message: { type: "STATUS_CHECK" },
        },
      ].forEach(({ destination, message }) => {
        stompClient.current.publish({
          destination,
          body: JSON.stringify({
            ...message,
            sender: String(currentUserId),
            recipient: String(selectedUserId),
          }),
          headers: { Authorization: `Bearer ${token}` },
        });
      });
    };

    stompClient.current.activate();
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    if (stompClient.current?.connected) {
      const now = Date.now();
      if (now - lastTypingTime > 1000) {
        const token = localStorage.getItem("jwt");
        stompClient.current.publish({
          destination: "/app/chat.typing",
          body: JSON.stringify({
            sender: String(currentUserId),
            recipient: String(selectedUserId),
            type: "TYPING",
            content: "typing",
          }),
          headers: { Authorization: `Bearer ${token}` },
        });
        setLastTypingTime(now);
      }
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !isConnected) return;

    const token = localStorage.getItem("jwt");
    const newMessage = {
      content: messageInput,
      sender: String(currentUserId),
      recipient: String(selectedUserId),
      type: "CHAT",
      timestamp: new Date().toISOString(),
      sentByMe: true,
    };

    stompClient.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(newMessage),
      headers: { Authorization: `Bearer ${token}` },
    });

    setMessageInput("");
  };

  useEffect(() => {
    if (open && selectedUserId) {
      connectWebSocket();
      fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/messages/${currentUserId}/${selectedUserId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("jwt")}` } }
      )
        .then((response) => response.json())
        .then((history) =>
          setMessages(
            history.map((msg) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          )
        );
    }
    return () => {
      if (stompClient.current?.connected) {
        stompClient.current.publish({
          destination: "/app/user.offline",
          body: JSON.stringify({
            sender: String(currentUserId),
            type: "STATUS",
            content: "OFFLINE",
          }),
        });
        stompClient.current.deactivate();
      }
      setIsConnected(false);
      setIsUserOnline(false);
    };
  }, [open, selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) {
      setVisibleMessageCount(5);
    } else {
      setVisibleMessageCount(5);
    }
  }, [open]);

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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: isUserOnline ? "success.main" : "grey.400",
                    display: "inline-block",
                  }}
                />
                <Box sx={{ position: "relative", minWidth: 80 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isUserOnline ? "success.main" : "grey.600",
                      fontWeight: isTyping ? 600 : 400,
                    }}
                  >
                    {isUserOnline ? (
                      isTyping ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <span>typing</span>
                          <Box
                            sx={{
                              display: "inline-flex",
                              gap: 0.3,
                              alignItems: "center",
                              animation: "fadeInOut 1.5s infinite",
                              "@keyframes fadeInOut": {
                                "0%": { opacity: 0.3 },
                                "50%": { opacity: 1 },
                                "100%": { opacity: 0.3 },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                backgroundColor: "success.main",
                              }}
                            />
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                backgroundColor: "success.main",
                              }}
                            />
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                backgroundColor: "success.main",
                              }}
                            />
                          </Box>
                        </Box>
                      ) : (
                        "online"
                      )
                    ) : (
                      "offline"
                    )}
                  </Typography>
                </Box>
              </Box>
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
            <Box
              onScroll={handleScroll}
              sx={{ height: 300, overflowY: "auto", mb: 2, p: 2 }}
            >
              {visibleMessages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sentByMe ? "flex-end" : "flex-start",
                  }}
                >
                  {/* Timestamp */}
                  <Typography variant="caption" sx={{ color: "grey.600" }}>
                    {formatTimestamp(msg.timestamp)}
                  </Typography>
                  {/* Message Content */}
                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: "70%",
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: msg.sentByMe
                        ? "rgb(44,44,44)"
                        : "#c8c7c7",
                      color: msg.sentByMe ? "white" : "rgb(44,44,44)",
                      textAlign: "center",
                    }}
                  >
                    {msg.content}
                  </Typography>
                </Box>
              ))}
              {isTyping && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      backgroundColor: "#e0e0e0",
                      padding: "8px 16px",
                      borderRadius: "16px",
                      maxWidth: "100px",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "grey.600",
                          animation: "bounce 1s infinite",
                          "@keyframes bounce": {
                            "0%, 100%": {
                              transform: "translateY(0)",
                            },
                            "50%": {
                              transform: "translateY(-5px)",
                            },
                          },
                          "&:nth-of-type(2)": {
                            animationDelay: "0.2s",
                          },
                          "&:nth-of-type(3)": {
                            animationDelay: "0.4s",
                          },
                        }}
                      />
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "grey.600",
                          animation: "bounce 1s infinite",
                          animationDelay: "0.2s",
                        }}
                      />
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: "grey.600",
                          animation: "bounce 1s infinite",
                          animationDelay: "0.4s",
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Ввод сообщения */}
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                value={messageInput}
                onChange={handleInputChange}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
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
