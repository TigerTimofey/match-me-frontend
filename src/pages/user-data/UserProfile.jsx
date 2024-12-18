import React from "react";
import { Typography, Avatar, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import "animate.css";

function UserProfileCard({ userProfileData }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      sx={{ padding: 4 }}
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
        {userProfileData.name} {userProfileData.lastname}
      </Typography>

      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        {userProfileData.aboutme}
      </Typography>

      <Divider sx={{ my: 4 }} />
      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        Looking for
      </Typography>

      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        {userProfileData.lookingFor}
      </Typography>
      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        Languages
      </Typography>
      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        {userProfileData.languages.join(", ")}
      </Typography>
    </Box>
  );
}

export default UserProfileCard;
