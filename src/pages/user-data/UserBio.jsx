import React from "react";
import { Typography, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import "animate.css";

function UserBioCard({ userBioData }) {
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
        {userBioData.name} {userBioData.lastname}
      </Typography>

      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        Age: {userBioData.age}
      </Typography>

      <Typography variant="body1" align="center">
        Gender: {userBioData.gender}
      </Typography>

      <Typography variant="body1" align="center">
        City: {userBioData.city}
      </Typography>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" align="center" sx={{ fontWeight: 600 }}>
        Hobbies
      </Typography>

      <Typography variant="body1" align="center">
        {userBioData.hobbies.join(", ")}
      </Typography>
    </Box>
  );
}

export default UserBioCard;
