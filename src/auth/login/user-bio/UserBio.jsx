import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Card, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const UserBio = ({ token }) => {
  const [formData, setFormData] = useState({
    city: "",
    age: "",
    gender: "",
    languages: "",
    hobbies: "",
    image: null,
    aboutme: "",
    lookingFor: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [userData, setUserData] = useState(null); // To store the fetched user data
  const navigate = useNavigate();

  // Fetch user details
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
          const errorData = await response.json();
          setMessage({
            type: "danger",
            text: errorData.message || "Failed to fetch user data.",
          });
          return;
        }

        const data = await response.json();
        console.log("Fetched user data:", data); // Log the raw user data
        setUserData(data); // Store the fetched user data
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

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload for image
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFormData((prev) => ({ ...prev, image: file }));
  };

  // Submit user bio to the database
  const updateUserBio = async () => {
    const { city, age, gender, languages, hobbies, aboutme, lookingFor } =
      formData;

    // Split languages and hobbies into arrays
    const languageArray = languages ? languages.split(",") : [];
    const hobbyArray = hobbies ? hobbies.split(",") : [];

    // Constructing a single object with all fields
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
        `http://localhost:8080/api/auth/users/${userData.id}`, // Use the fetched user ID
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
      console.log("Updated user bio:", updatedData); // Log the updated user data
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
        backgroundColor: "#dbc5f1",
      }}
    >
      <div>
        <Card
          sx={{
            padding: 5,
            width: { xs: "100%", sm: 400 },
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: 2,
            backgroundColor: "#E3F2FD",
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              textAlign: "center",
              color: "#1A73E8",
              marginBottom: 3,
              fontWeight: 600,
            }}
          >
            Complete Your Profile
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
              name="gender"
              label="Gender"
              variant="outlined"
              fullWidth
              value={formData.gender}
              onChange={handleInputChange}
            />
            <TextField
              name="languages"
              label="Languages (comma-separated)"
              variant="outlined"
              fullWidth
              value={formData.languages}
              onChange={handleInputChange}
            />
            <TextField
              name="hobbies"
              label="Hobbies (comma-separated)"
              variant="outlined"
              fullWidth
              value={formData.hobbies}
              onChange={handleInputChange}
            />
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
            <Button
              variant="contained"
              component="label"
              sx={{ marginBottom: 2 }}
            >
              Upload Image
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            <Button variant="contained" fullWidth onClick={updateUserBio}>
              Save Bio
            </Button>
          </Box>
        </Card>
      </div>
    </Box>
  );
};

export default UserBio;
