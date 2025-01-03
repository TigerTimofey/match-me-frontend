import React from "react";
import {
  Typography,
  Avatar,
  Divider,
  Button,
  Modal,
  Box,
  TextField,
} from "@mui/material";

import { handleImageDisplay } from "../../utils/handleImageDisplay";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import { styled } from "@mui/material";

function UserProfileCard({ userProfileData, currentUserId }) {
  const [open, setOpen] = React.useState(false);
  const [userBioData, setUserBioData] = React.useState(userProfileData);
  const [tokenProfile, setTokenProfile] = React.useState("");
  const [imageFile, setImageFile] = React.useState(userProfileData.image);
  const [deleteButtonText, setDeleteButtonText] = React.useState("Delete");
  const [changeButtonText, setChangeButtonText] = React.useState("Change");
  const handleDeleteClick = async () => {
    try {
      setDeleteButtonText("Deleted");

      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          name: userBioData.name,
          lastname: userBioData.lastname,
          aboutme: userBioData.aboutme,
          lookingFor: userBioData.lookingFor,
          image: null,
        })
      );
      // formData.append("image", null);
      // console.log(formData);

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${tokenProfile}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        setUserBioData(updatedData);
        setImageFile(null); // Update state to remove image locally
      } else {
        const errorData = await response.json();
        console.error("Failed to delete image:", errorData);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setTimeout(() => setDeleteButtonText("Remove"), 1500);
    }
  };

  const handleChangeClick = () => {
    setChangeButtonText("Changed");
    setTimeout(() => setChangeButtonText("Change"), 1500);
  };

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  React.useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      setTokenProfile(token);
    }
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserBioData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append(
        "data",
        JSON.stringify({
          name: userBioData.name,
          lastname: userBioData.lastname,
          aboutme: userBioData.aboutme,
          lookingFor: userBioData.lookingFor,
        })
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }
      console.log("Sending data:", {
        name: userBioData.name,
        lastname: userBioData.lastname,
        aboutme: userBioData.aboutme,
        lookingFor: userBioData.lookingFor,
        image: imageFile ? imageFile.name : null,
      });
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${tokenProfile}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        handleClose();
        const updatedData = await response.json();
        setUserBioData(updatedData);
      } else {
        const errorData = await response.json();
        console.error("Failed to update profile:", errorData);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleImageChange = (e) => {
    handleChangeClick();
    setImageFile(e.target.files[0]);
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
          src={
            handleImageDisplay(userBioData.image) ||
            "https://source.unsplash.com/random/150x150"
          }
          sx={{ width: 100, height: 100, boxShadow: 3 }}
        />
      </Box>

      <Typography variant="h5" align="center" sx={{ fontWeight: 600, mb: 3 }}>
        {userBioData.name} {userBioData.lastname}
      </Typography>

      <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
        About me
      </Typography>
      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        {userBioData.aboutme}
      </Typography>

      {/* <Divider sx={{ my: 4 }} /> */}
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 3 }}>
        Looking for
      </Typography>

      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        {userBioData.lookingFor}
      </Typography>
      <Divider sx={{ my: 4 }} />

      <Box sx={{ position: "absolute", top: 16, right: 16 }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{
            backgroundColor: "rgb(44,44,44)",
            color: "#f4f3f3",
            fontWeight: 600,
            fontFamily: "Poppins",
          }}
          onClick={handleOpen}
        >
          Edit Profile
        </Button>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
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
            variant="h6"
            align="center"
            gutterBottom
            sx={{ color: "rgb(72, 71, 71)", fontWeight: 600 }}
          >
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

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 2,
              gap: 3,
              mt: 3,
            }}
          >
            <Button
              component="label"
              size="small"
              color="danger"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              startIcon={<CloudUploadIcon />}
              // onClick={handleChangeClick}
              sx={{
                color: changeButtonText === "Changed" ? "green" : "danger",
              }}
            >
              {changeButtonText}
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple
              />
            </Button>
            <Button
              component="label"
              size="small"
              variant="outlined"
              color="danger"
              startIcon={<DeleteRoundedIcon />}
              onClick={handleDeleteClick}
              sx={{
                color: deleteButtonText === "Deleted" ? "red" : "danger",
              }}
            >
              {deleteButtonText}
            </Button>

            {/* <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              style={{ marginTop: "16px", width: "100%" }}
            /> */}
            {/* <Avatar
              src={handleImageDisplay(imageFile)}
              alt="Image Preview"
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                boxShadow: 3,
              }}
            /> */}
          </Box>
          <Button
            fullWidth
            variant="outlined"
            sx={{
              mt: 3,
              color: "#f4f3f3",
              backgroundColor: "rgb(44,44,44)",
              "&:hover": { backgroundColor: "rgb(72, 71, 71)" },
            }}
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
