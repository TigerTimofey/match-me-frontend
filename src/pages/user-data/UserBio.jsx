import React, { useEffect, useState } from "react";
import {
  Typography,
  Divider,
  Button,
  Modal,
  Box,
  TextField,
  Alert,
} from "@mui/material";

function UserBioCard({ userBioData }) {
  const [open, setOpen] = useState(false);
  const [bioData, setBioData] = useState(userBioData);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setBioData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("jwt");
      const { currentUserId, ...restOfBioData } = bioData;

      if (isNaN(Number(restOfBioData.age)) || restOfBioData.age === "") {
        setMessage({
          type: "danger",
          text: "Please enter a valid age.",
        });
        return;
      }

      const userBioData = {
        ...restOfBioData,
        age: Number(restOfBioData.age),
      };

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userBioData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({
          type: "danger",
          text: errorData.message || "Failed to update user bio.",
        });
        return;
      }

      const updatedData = await response.json();
      setMessage({
        type: "success",
        text: "User bio updated successfully.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error updating user bio:", error);
      setMessage({
        type: "danger",
        text: "Something went wrong while updating user bio.",
      });
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ padding: 4, backgroundColor: "#f4f3f3", color: "rgb(44,44,44)" }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ fontFamily: "Poppins", fontWeight: 600 }}
      >
        Biographical
      </Typography>
      <Divider sx={{ my: 2, borderColor: "black", width: "80%" }} />

      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        {bioData.name} {bioData.lastname}
      </Typography>

      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        Age: {bioData.age}
      </Typography>

      <Typography variant="body1" align="center">
        Gender: {bioData.gender}
      </Typography>

      <Typography variant="body1" align="center">
        City: {bioData.city}
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        Hobbies
      </Typography>

      <Typography variant="body1" align="center">
        {bioData.hobbies?.join(", ") || ""}
      </Typography>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleOpen}
      >
        Edit Bio
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            p: 4,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            Edit Bio
          </Typography>
          {message.text && (
            <Alert
              severity={message.type}
              sx={{
                marginBottom: 2,
                backgroundColor:
                  message.type === "danger"
                    ? "#f8d7da"
                    : message.type === "success"
                    ? "#a8f49d"
                    : "transparent",
                color: message.type === "danger" ? "#721c24" : "inherit",
              }}
              onClose={() => setMessage({ type: "", text: "" })}
            >
              {message.text}
            </Alert>
          )}
          <TextField
            fullWidth
            label="First Name"
            name="name"
            value={bioData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastname"
            value={bioData.lastname}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Age"
            name="age"
            type="number"
            value={bioData.age}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            name="gender"
            label="Gender"
            variant="outlined"
            fullWidth
            value={bioData.gender}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
            slotProps={{
              select: {
                native: true,
              },
            }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </TextField>
          <TextField
            fullWidth
            label="City"
            name="city"
            value={bioData.city}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Hobbies"
            name="hobbies"
            value={bioData.hobbies?.join(", ") || ""}
            onChange={(e) =>
              setBioData((prev) => ({
                ...prev,
                hobbies: e.target.value.split(",").map((h) => h.trim()),
              }))
            }
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            Save
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}

export default UserBioCard;
