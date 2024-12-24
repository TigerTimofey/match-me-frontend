import React, { useEffect, useState } from "react";
import { Card, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";

function RecommendationsMain() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/recommendations`,
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
          throw new Error(
            errorData.message || "Failed to fetch recommendations."
          );
        }

        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, padding: 2 }}>
      <Card
        sx={{
          padding: 3,
          boxShadow: 2,
          backgroundColor: "#f0efef",
          color: "rgb(44,44,44)",
          marginBottom: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, textAlign: "center", mb: 2 }}
        >
          Recommendations
        </Typography>
      </Card>
      {loading ? (
        <Typography sx={{ mt: 5 }} textAlign="center">
          Loading...
        </Typography>
      ) : error ? (
        <Typography sx={{ mt: 5 }} color="error" textAlign="center">
          {error}
        </Typography>
      ) : recommendations.length > 0 ? (
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {recommendations.map((id) => (
            <Grid size={{ xs: 2, sm: 4, md: 4 }} key={id}>
              <Card
                sx={{
                  height: 150,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: 3,
                  backgroundColor: "#ffffff",
                  padding: 2,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  User ID
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {id}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography textAlign="center">
          No recommendations available.
        </Typography>
      )}
    </Box>
  );
}

export default RecommendationsMain;
