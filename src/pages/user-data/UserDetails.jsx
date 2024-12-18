import React from "react";
import { Card, Typography, Avatar, Divider } from "@mui/material";

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
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 600, textAlign: "center", mb: 2, p: 2 }}
      >
        User Details
      </Typography>
      <Divider sx={{ my: 1, width: "100%" }} />
      <Typography sx={{ textAlign: "center" }}>
        Email: {userData.username}
      </Typography>
      <Typography sx={{ textAlign: "center" }}>
        City: {userData.city}
      </Typography>
      <Typography sx={{ textAlign: "center" }}>Age: {userData.age}</Typography>
      <Avatar
        src={userData.avatarUrl}
        sx={{ width: 56, height: 56, mt: 2, boxShadow: 1 }}
      />
    </Card>
  );
}

export default UserDetailsCard;