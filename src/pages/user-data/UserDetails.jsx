import React from "react";
import { Card, Typography, Avatar, Divider } from "@mui/material";
import { handleImageDisplay } from "../../utils/handleImageDisplay";

function UserDetailsCard({ userData }) {
  return (
    <Card
      sx={{
        padding: 3,
        boxShadow: 2,
        backgroundColor: "#f0efef",
        color: "rgb(44,44,44)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
        marginLeft: 2,
        marginRight: 2,
        userSelect: "none",
        WebkitUserSelect: "none",
        msUserSelect: "none",
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 600, textAlign: "center", mb: 2, p: 2 }}
      >
        User Details
      </Typography>
      <Divider sx={{ my: 1, width: "100%" }} />
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        Email:
      </Typography>
      <Typography variant="body1" align="center">
        {userData.username}
      </Typography>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        City:
      </Typography>
      <Typography variant="body1" align="center">
        {userData.city}
      </Typography>
      <Typography variant="h6" align="center" sx={{ fontWeight: 600, mt: 2 }}>
        Age:
      </Typography>
      <Typography variant="body1" align="center">
        Age: {userData.age}
      </Typography>

      <Typography sx={{ textAlign: "center" }}></Typography>
    </Card>
  );
}

export default UserDetailsCard;
