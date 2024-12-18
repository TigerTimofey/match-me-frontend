import React from "react";
import { Card, Typography, Avatar, Divider } from "@mui/material";

function UserDetailsCard({ userData }) {
  return (
    <Card sx={{ padding: 3, marginTop: 2, boxShadow: 2 }}>
      <Typography variant="h6">User Details:</Typography>
      <Divider sx={{ my: 1 }} />
      <Typography>Email: {userData.username}</Typography>
      <Typography>City: {userData.city}</Typography>
      <Typography>Age: {userData.age}</Typography>
      <Avatar
        src={userData.avatarUrl}
        sx={{ width: 56, height: 56, mt: 2, boxShadow: 1 }}
      />
    </Card>
  );
}

export default UserDetailsCard;
