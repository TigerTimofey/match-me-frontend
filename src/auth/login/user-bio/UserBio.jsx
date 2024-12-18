import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Card,
  Alert,
  Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import UserProfile from "./UserProfile";
import { languages } from "../../../local-variables/languages";

const UserBio = ({ token }) => {
  const [formData, setFormData] = useState({
    city: "",
    age: "",
    gender: "",
    languages: "",
    hobbies: "",
    aboutme: "",
    lookingFor: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [userData, setUserData] = useState(null);
  const [showUserProfile, setShowUserProfile] = React.useState(false);

  const navigate = useNavigate();

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
        setUserData(data); // Save the fetched user data
        setFormData({
          city: data.city || "",
          age: data.age || "",
          gender: data.gender || "",
          languages: data.languages?.join(", ") || "",
          hobbies: data.hobbies?.join(", ") || "",
          aboutme: data.aboutme || "",
          lookingFor: data.lookingFor || "",
        });
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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    const languageArray = languages ? languages.split(",") : [];
    const hobbyArray = hobbies ? hobbies.split(",") : [];

    const userBioData = {
      city,
      age: Number(age),
      gender,
      languages: languageArray,
      hobbies: hobbyArray,
      aboutme: aboutme || "",
      lookingFor,
    };

    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/users/${userData.id}`,
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
      {showUserProfile ? (
        <div className="animate__animated animate__zoomIn animate__delay-0.5">
          <UserProfile token={token} />
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
              Complete Your Profile 1/2
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
                name="city"
                label="City"
                variant="outlined"
                fullWidth
                value={formData.city}
                onChange={handleInputChange}
              />
              <TextField
                name="age"
                label="Age"
                type="number"
                variant="outlined"
                fullWidth
                value={formData.age}
                onChange={handleInputChange}
              />
              <TextField
                select
                name="gender"
                label="Gender"
                variant="outlined"
                fullWidth
                value={formData.gender}
                onChange={handleInputChange}
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
              >
                <option value=""></option> {/* Default empty option */}
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </TextField>

              {/* <TextField
                name="languages"
                label="Languages (comma-separated)"
                variant="outlined"
                fullWidth
                value={formData.languages}
                onChange={handleInputChange}
              /> */}
              <Autocomplete
                multiple
                options={languages}
                value={formData.languages ? formData.languages.split(",") : []}
                onChange={(event, newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    languages: newValue.join(", "),
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Languages"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />

              <TextField
                name="hobbies"
                label="Hobbies (comma-separated)"
                variant="outlined"
                fullWidth
                value={formData.hobbies}
                onChange={handleInputChange}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowUserProfile(true)}
              >
                Next
              </Button>
            </Box>
          </Card>
        </div>
      )}
    </Box>
  );
};

export default UserBio;
