import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  Alert,
  Avatar,
  styled,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserBio from "./UserBio";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const UserProfile = ({ token }) => {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("userBioForm");
    return savedData
      ? JSON.parse(savedData)
      : {
          city: "",
          age: "",
          gender: "",
          languages: "",
          hobbies: "",
          image: null,
          aboutme: "",
          lookingFor: "",
        };
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [userData, setUserData] = useState(null);
  const [showUserBio, setShowUserBio] = React.useState(false);

  const navigate = useNavigate();
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
  useEffect(() => {
    localStorage.setItem("userBioForm", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/auth/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            navigate("/me");
          }
          const errorData = await response.json();
          setMessage({
            type: "danger",
            text: errorData.message || "Failed to fetch user data.",
          });
          return;
        }

        const data = await response.json();

        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({
          type: "danger",
          text: "Something went wrong while fetching user data.",
        });
      }
    };

    fetchUserDetails();
  }, [token]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        //remove spaces
        name === "languages" || name === "hobbies"
          ? value.replace(/\s/g, "")
          : value,
    }));
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, imagePreview: imageURL }));
    }
  };

  const updateUserBio = async () => {
    const { city, age, gender, languages, hobbies, aboutme, lookingFor } =
      formData;

    const languageArray = languages
      ? languages.split(",").map((lang) => lang.trim())
      : [];
    const hobbyArray = hobbies
      ? hobbies.split(",").map((hobby) => hobby.trim())
      : [];

    const userBioData = {
      city,
      age: Number(age),
      gender,
      languages: languageArray,
      hobbies: hobbyArray,
      aboutme: aboutme || "",
      lookingFor,
      isBioProvided: true,
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/auth/users/${userData.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userBioData),
        }
      );
      if (response.status === 401) {
        navigate("/");
      }

      if (!response.ok) {
        const errorData = await response.json();
        setMessage({
          type: "danger",
          text: errorData.message || "Failed to update user bio.",
        });
        return;
      }

      const updatedData = await response.json();
      console.log(`updatedData for ${updatedData.username}`, updatedData);
      setMessage({
        type: "success",
        text: "User bio updated successfully.",
      });

      navigate(`/me`);
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
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#7c7c7c",
      }}
    >
      {showUserBio ? (
        <div className="animate__animated animate__zoomIn animate__delay-0.5">
          <UserBio token={token} />
        </div>
      ) : (
        <div>
          <Card
            sx={{
              padding: 5,
              width: { sm: 400 },
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
              borderRadius: 2,
              backgroundColor: "#f0efef",
            }}
          >
            <Typography
              variant="h5"
              component="h1"
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: "#1A73E8",
                marginBottom: 3,
                fontWeight: 600,
              }}
            >
              Complete Your Profile 2/2
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <TextField
                name="aboutme"
                label="About Me"
                multiline
                rows={3}
                variant="outlined"
                fullWidth
                value={formData.aboutme}
                onChange={handleInputChange}
              />
              <TextField
                name="lookingFor"
                label="Looking For"
                multiline
                rows={2}
                variant="outlined"
                fullWidth
                value={formData.lookingFor}
                onChange={handleInputChange}
              />
              {formData.imagePreview && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 2,
                    gap: 3,
                  }}
                >
                  <Button
                    component="label"
                    role={undefined}
                    variant="outlined"
                    tabIndex={-1}
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload files
                    <VisuallyHiddenInput
                      type="file"
                      onChange={(event) => console.log(event.target.files)}
                      multiple
                    />
                  </Button>
                  <Avatar
                    src={formData.imagePreview}
                    alt="Image Preview"
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      boxShadow: 3,
                    }}
                  />{" "}
                </Box>
              )}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                {" "}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setShowUserBio(true)}
                >
                  Back
                </Button>
                <Button variant="contained" fullWidth onClick={updateUserBio}>
                  Confirm
                </Button>
              </Box>
            </Box>
          </Card>
        </div>
      )}
    </Box>
  );
};

export default UserProfile;
