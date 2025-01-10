import React from "react";
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
import { hobbiesDb } from "../../../local-variables/hobbies";
import { locations } from "../../../local-variables/locations";

const UserBio = ({ token }) => {
  const [formData, setFormData] = React.useState({
    city: "",
    age: "",
    gender: "",
    languages: "",
    hobbies: "",
    aboutme: "",
    lookingFor: "",
  });

  const [message, setMessage] = React.useState({
    type: "",
    text: "",
  });

  const [showUserProfile, setShowUserProfile] = React.useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    localStorage.setItem("userBioForm", JSON.stringify(formData));
  }, [formData]);

  React.useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/me`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401 && response.status === 403) {
            navigate("/");
          }
          const errorData = await response.json();
          setMessage({
            type: "danger",
            text: errorData.message || "Failed to fetch user data.",
          });
          return;
        }

        const data = await response.json();
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
  }, [token, navigate]);

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

  const handleNext = async () => {
    const token = localStorage.getItem("jwt");

    if (!token) {
      setMessage({
        type: "danger",
        text: "No authentication token found.",
      });
      return;
    }

    try {
      // Fetch current user details
      const userResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!userResponse.ok) {
        const errorData = await userResponse.json();
        setMessage({
          type: "danger",
          text: errorData.message || "Failed to fetch user data.",
        });
        return;
      }

      const userData = await userResponse.json();
      const currentUserId = userData.id; // Assuming userData contains an `id` field

      // Prepare the user bio data dynamically
      const userBioData = {};

      if (formData.city) userBioData.city = formData.city;
      if (formData.age) userBioData.age = formData.age;
      if (formData.gender) userBioData.gender = formData.gender;
      if (formData.languages) {
        userBioData.languages = formData.languages
          ? formData.languages.split(",").map((lang) => lang.trim())
          : [];
      }
      if (formData.hobbies) {
        userBioData.hobbies = formData.hobbies
          ? formData.hobbies.split(",").map((hobby) => hobby.trim())
          : [];
      }
      if (formData.aboutme) userBioData.aboutme = formData.aboutme;
      if (formData.lookingFor) userBioData.lookingFor = formData.lookingFor;

      // Prepare FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(userBioData));

      // Append the image only if it was provided (not null or undefined)
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      } else {
        // If no image, append null (this will remove the image from the backend)
        formDataToSend.append("image", null);
      }

      // Perform the PATCH request
      const patchResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (!patchResponse.ok) {
        const errorData = await patchResponse.json();
        setMessage({
          type: "danger",
          text: errorData.message || "Failed to update user data.",
        });
        return;
      }

      setShowUserProfile(true); // Proceed to the next step after a successful PATCH request
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "danger",
        text: "Something went wrong while updating user data.",
      });
    }
  };

  // Inside the JSX:
  <Button
    size="small"
    sx={{
      backgroundColor: "rgb(44,44,44)",
      color: "#f4f3f3",
      fontWeight: 600,
      fontSize: "1rem",
      fontFamily: "Poppins",
    }}
    fullWidth
    onClick={handleNext}
  >
    Next
  </Button>;

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
                color: "rgb(44,44,44)",
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
              <Autocomplete
                options={Object.keys(locations)}
                getOptionLabel={(option) => (option ? locations[option] : "")}
                value={formData.city || ""}
                onChange={(event, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    city: newValue || "",
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
              <TextField
                name="age"
                label="Age"
                type="number"
                variant="outlined"
                fullWidth
                value={formData.age}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,2}$/.test(value)) {
                    handleInputChange({
                      target: {
                        name: "age",
                        value: value === "" ? "" : Number(value),
                      },
                    });
                  }
                }}
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

              <Autocomplete
                multiple
                options={Object.keys(languages)}
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
              <Autocomplete
                multiple
                options={Object.keys(hobbiesDb)}
                value={formData.hobbies ? formData.hobbies.split(",") : []}
                onChange={(event, newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    hobbies: newValue.join(", "),
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Hobbies"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />

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
                  color="primary"
                  size="small"
                  sx={{
                    backgroundColor: "rgb(44,44,44)",
                    color: "#f4f3f3",
                    fontWeight: 600,
                    fontSize: "1rem",
                    fontFamily: "Poppins",
                  }}
                  fullWidth
                  onClick={() => window.location.reload()}
                >
                  Back
                </Button>
                <Button
                  size="small"
                  sx={{
                    backgroundColor: "rgb(44,44,44)",
                    color: "#f4f3f3",
                    fontWeight: 600,
                    fontSize: "1rem",
                    fontFamily: "Poppins",
                  }}
                  fullWidth
                  onClick={handleNext}
                >
                  Next
                </Button>
              </Box>
            </Box>
          </Card>
        </div>
      )}
    </Box>
  );
};

export default UserBio;
