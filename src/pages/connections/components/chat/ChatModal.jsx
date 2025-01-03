import React from "react";
import { Modal, Box, Typography, Divider } from "@mui/material";

const ChatModal = ({
  open,
  onClose,
  selectedUser,
  currentUserId,
  selectedUserId,
}) => {
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
            <Typography variant="h6" align="center">
              {selectedUser.name} ID is {selectedUserId} <br />
              Your ID is {currentUserId}
            </Typography>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ChatModal;
