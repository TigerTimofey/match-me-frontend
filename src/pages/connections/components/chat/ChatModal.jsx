import { Box, Button, Divider, Modal, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const ChatModal = ({
  open,
  onClose,
  selectedUser,
  currentUserId,
  selectedUserId,
  onAcceptConnection
}) => {
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (selectedUserId && currentUserId) {
        try {
          const token = localStorage.getItem("jwt");
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/connections`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            setIsPending(data.connections?.includes(selectedUserId));
          }
        } catch (error) {
          console.error("Error checking connection status:", error);
        }
      }
    };

    if (open) {
      checkConnectionStatus();
    }
  }, [open, currentUserId, selectedUserId]);

  const handleAccept = async () => {
    if (onAcceptConnection) {
      try {
        await onAcceptConnection(selectedUserId);
        setIsPending(true);
      } catch (error) {
        console.error("Error accepting connection:", error);
      }
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
              {isPending ? "Connected with" : "Connect with"} {selectedUser.name}
            </Typography>
            <Divider sx={{ my: 2, borderColor: "black" }} />
            
            {!isPending ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAccept}
                  sx={{
                    backgroundColor: "rgb(44,44,44)",
                    color: "#f4f3f3",
                    "&:hover": {
                      backgroundColor: "#3a3a3a"
                    }
                  }}
                >
                  Accept Connection Request
                </Button>
              </Box>
            ) : (
              <Typography variant="h6" align="center">
                You are now connected with {selectedUser.name}!
              </Typography>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ChatModal;
