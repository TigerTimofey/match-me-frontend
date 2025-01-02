import React, { useEffect } from "react";
import { Box, Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function ConnectionsMain({ currentUserId }) {
  const navigate = useNavigate();
  const [connections, setConnections] = React.useState([]);
  const getConnections = async () => {
    const token = localStorage.getItem("jwt");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/connections`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 401) {
        navigate("/me");
        return;
      }
      if (!response.ok) {
        console.error("Failed to fetch connections:", await response.json());
        return;
      }

      const connectionsData = await response.json();
      setConnections(connectionsData);
      console.log("Fetched connectionsData:", connectionsData);
    } catch (error) {
      console.error("Error fetching connectionsData:", error);
    }
  };

  useEffect(() => {
    getConnections();
  }, [currentUserId]);

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          textAlign: "center",
          mb: 3,
          color: "rgb(44,44,44)",
        }}
      >
        Connections
      </Typography>
      <Card
        sx={{
          mt: 3,
          padding: 3,
          boxShadow: 2,
          backgroundColor: "#f0efef",
          color: "rgb(44,44,44)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        conenctions Ids:
        <Typography>{connections.connections}</Typography>
      </Card>
    </Box>
  );
}

export default ConnectionsMain;
