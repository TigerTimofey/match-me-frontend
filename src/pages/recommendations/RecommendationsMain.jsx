import React, { useEffect, useState } from "react";
import { Card, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";

function RecommendationsMain() {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsWithDetails, setRecommendationsWithDetails] = useState(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch user IDs
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
      if (response.status === 401) navigate("/");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch recommendations."
        );
      }
      return await response.json();
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
      return [];
    }
  };

  // Function to fetch user details for a given ID
  const fetchUserDetails = async (id) => {
    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${id}/bio`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) return await response.json();
      console.error(`Failed to fetch user with ID ${id}`);
      return null;
    } catch (err) {
      console.error(`Error fetching user with ID ${id}:`, err);
      return null;
    }
  };

  // Combined effect to fetch IDs and details
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const ids = await fetchRecommendations();
      setRecommendations(ids);

      const detailsPromises = ids.map((id) => fetchUserDetails(id));
      const details = await Promise.all(detailsPromises);
      const validDetails = details.filter(Boolean);

      setRecommendationsWithDetails(validDetails);
      console.log("Updated recommendationsWithDetails:", validDetails);

      setLoading(false);
    };

    fetchAllData();
  }, [navigate]);

  // Log updates to recommendationsWithDetails whenever they change
  useEffect(() => {
    console.log(
      "Current state of recommendationsWithDetails:",
      recommendationsWithDetails
    );
  }, [recommendationsWithDetails]);

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
          {recommendations.map((id, index) => (
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
                  {recommendationsWithDetails[index]?.name || "User ID"}
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
