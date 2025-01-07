import { Box, Button, Divider, Modal, TextField, Typography } from "@mui/material";
import { Client } from '@stomp/stompjs';
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
  const stompClient = useRef(null);

  useEffect(() => {
    if (open && selectedUserId) {
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
    };
  }, [open, selectedUserId]);

  const disconnectWebSocket = () => {
    if (stompClient.current && stompClient.current.connected) {
      stompClient.current.deactivate();
      setIsConnected(false);
    }
  };

  const connectWebSocket = () => {
    try {
      const sockjs = new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws?userId=${currentUserId}`);
      
      stompClient.current = new Client({
        webSocketFactory: () => sockjs,
        debug: function (str) {
          console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          setIsConnected(false);
        },
        onWebSocketClose: () => {
          console.log('WebSocket connection closed');
          setIsConnected(false);
        }
      });

      stompClient.current.onConnect = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
        
        stompClient.current.subscribe(`/user/${currentUserId}/queue/messages`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, receivedMessage]);
        });

        sendJoinMessage();
      };

      stompClient.current.activate();
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setIsConnected(false);
    }
  };

  const sendJoinMessage = () => {
    if (stompClient.current && stompClient.current.connected) {
      try {
        stompClient.current.publish({
          destination: '/app/chat.join',
          body: JSON.stringify({
            sender: currentUserId,
            recipient: selectedUserId,
            type: 'JOIN'
          })
        });
      } catch (error) {
        console.error('Error sending join message:', error);
      }
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !isConnected) return;

    const newMessage = {
        content: messageInput,
        sender: currentUserId,
        recipient: selectedUserId,
        type: 'CHAT'
    };

    try {
        stompClient.current.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(newMessage)
        });
        // Добавляем сообщение локально сразу после отправки
        setMessages(prev => [...prev, newMessage]);
        setMessageInput("");
    } catch (error) {
        console.error('Error sending message:', error);
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
            <Typography
              variant="h4"
              align="center"
              sx={{ fontFamily: "Poppins", fontWeight: 600 }}
            >
              Chat with {selectedUser.name}
            </Typography>
            <Divider sx={{ my: 2, borderColor: "black" }} />
            
            {/* Статус подключения */}
            <Typography 
              variant="body2" 
              align="center"
              sx={{ 
                color: isConnected ? 'green' : 'red',
                mb: 1 
              }}
            >
              {isConnected ? 'Connected' : 'Connecting...'}
            </Typography>
            
            {/* Сообщения */}
            <Box sx={{ height: 300, overflowY: 'auto', mb: 2, p: 2 }}>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 1,
                    display: 'flex',
                    justifyContent: msg.sender === currentUserId ? 'flex-end' : 'flex-start'
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      maxWidth: '70%',
                      p: 1,
                      borderRadius: 2,
                      bgcolor: msg.sender === currentUserId ? 'primary.main' : 'grey.200',
                      color: msg.sender === currentUserId ? 'white' : 'black'
                    }}
                  >
                    {msg.content}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Ввод сообщения */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!isConnected}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={!isConnected}
                sx={{
                  backgroundColor: "rgb(44,44,44)",
                  color: "#f4f3f3",
                  '&:hover': {
                    backgroundColor: "rgb(60,60,60)",
                  }
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
