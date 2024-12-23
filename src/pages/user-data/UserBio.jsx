import React from "react";
import {
  Typography,
  Divider,
  Button,
  Modal,
  Box,
  TextField,
  Alert,
  Autocomplete,
  Chip,
} from "@mui/material";
import { hobbiesDb } from "../../local-variables/hobbies";
import { languages } from "../../local-variables/languages";
import { locations } from "../../local-variables/locations";

function UserBioCard({ userBioData }) {
  const [open, setOpen] = React.useState(false);
  const [bioData, setBioData] = React.useState(userBioData);
  const [message, setMessage] = React.useState({
    type: "",
    text: "",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBioData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (event, newValue) => {
    setBioData((prev) => ({ ...prev, languages: newValue }));
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

      const formData = new FormData();

      formData.append("data", JSON.stringify(userBioData));
      console.log("Data being sent to backend:", {
        formData,
        userBioData: JSON.stringify(userBioData),
      });

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
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

      <Typography variant="h5" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        {bioData.name} {bioData.lastname}
      </Typography>

      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        Age
      </Typography>
      <Typography variant="body1 " align="center">
        {bioData.age}
      </Typography>

      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        Gender{" "}
      </Typography>
      <Typography variant="body1" align="center">
        {bioData.gender}
      </Typography>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        City{" "}
      </Typography>
      <Typography variant="body1" align="center">
        {bioData.city}
      </Typography>

      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        Hobbies
      </Typography>

      <Typography variant="body1" align="center">
        {bioData.hobbies?.join(", ") || ""}
      </Typography>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        Languages
      </Typography>
      <Box>
        {bioData.languages.map((lang, index) => (
          <Chip
            key={index}
            label={languages[lang]}
            sx={{ m: 0.5, fontSize: "2rem" }}
          />
        ))}
      </Box>
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
          Edit Bio
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
            width: 400,
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
          <Autocomplete
            options={Object.keys(locations)}
            getOptionLabel={(option) => (option ? locations[option] : "")} // Ensure it handles undefined or empty string
            value={bioData.city || ""}
            onChange={(event, newValue) => {
              setBioData((prev) => ({
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
                sx={{ mb: 2 }}
              />
            )}
          />

          <Autocomplete
            multiple
            options={Object.keys(hobbiesDb)}
            value={bioData.hobbies}
            onChange={(event, newValue) =>
              setBioData((prev) => ({
                ...prev,
                hobbies: newValue.map((hobby) => hobbiesDb[hobby]),
              }))
            }
            renderInput={(params) => (
              <TextField {...params} label="Hobbies" sx={{ mt: 2 }} />
            )}
          />

          <Autocomplete
            multiple
            options={Object.keys(languages)}
            value={bioData.languages}
            onChange={handleMultiSelectChange}
            renderInput={(params) => (
              <TextField {...params} label="Languages" sx={{ mt: 2 }} />
            )}
          />

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

export default UserBioCard;
