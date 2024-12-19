import React, { useEffect, useState } from "react";
import {
  Typography,
  Avatar,
  Divider,
  Button,
  Modal,
  Box,
  TextField,
  Autocomplete,
  Chip,
  IconButton,
} from "@mui/material";

import { languages } from "../../local-variables/languages";

function UserProfileCard({ userProfileData, currentUserId }) {
  const [open, setOpen] = useState(false);
  const [userBioData, setUserBioData] = useState(userProfileData);
  const [tokenProfile, setTokenProfile] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      setTokenProfile(token);
    }
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserBioData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (event, newValue) => {
    setUserBioData((prev) => ({ ...prev, languages: newValue }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenProfile}`,
          },
          body: JSON.stringify(userBioData),
        }
      );

      if (response.ok) {
        handleClose();
        const updatedData = await response.json();
        setUserBioData(updatedData);
        console.log("Updated Profile Data:", updatedData);
      } else {
        const errorData = await response.json();
        console.error("Failed to update profile:", errorData);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      sx={{ padding: 4, backgroundColor: "#f4f3f3", color: "rgb(44,44,44)" }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ fontFamily: "Poppins", fontWeight: 600 }}
      >
        User Profile
      </Typography>
      <Divider sx={{ my: 2, borderColor: "black", width: "80%" }} />

      <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
        <Avatar
          src="https://source.unsplash.com/random/150x150"
          sx={{ width: 100, height: 100, boxShadow: 3 }}
        />
      </Box>

      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        {userBioData.name} {userBioData.lastname}
      </Typography>

      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        About me
      </Typography>
      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        {userBioData.aboutme}
      </Typography>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        Looking for
      </Typography>

      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        {userBioData.lookingFor}
      </Typography>
      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        Languages
      </Typography>
      <Box sx={{ mt: 2 }}>
        {userBioData.languages.map((lang, index) => (
          <Chip
            key={index}
            label={languages[lang]}
            sx={{ m: 0.5, fontSize: "2.5rem" }}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleOpen}
      >
        Edit Profile
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          "& .MuiPaper-root": {
            outline: "none",
            border: "none",
          },
        }}
      >
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
            Edit Profile
          </Typography>
          <TextField
            fullWidth
            label="First Name"
            name="name"
            value={userBioData.name}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastname"
            value={userBioData.lastname}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="About Me"
            name="aboutme"
            value={userBioData.aboutme}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Looking For"
            name="lookingFor"
            value={userBioData.lookingFor}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            multiple
            options={Object.keys(languages)}
            value={userBioData.languages}
            onChange={handleMultiSelectChange}
            renderInput={(params) => (
              <TextField {...params} label="Languages" sx={{ mt: 2 }} />
            )}
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

export default UserProfileCard;
