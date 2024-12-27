import React, { useEffect, useState } from "react";
import { Card, Typography, Box, Avatar, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";

import { handleImageDisplay } from "../../utils/handleImageDisplay";

function RecommendationsMain({ currentUserId }) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsWithDetails, setRecommendationsWithDetails] = useState(
    []
  );
  const [recommendationsWithImage, setRecommendationsWithImage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchedUserIds, setMatchedUserIds] = useState([]);

  const findMatches = (currentUserId, userDetailsArray) => {
    const currentUser = userDetailsArray.find(
      (user) => user.id === currentUserId
    );
    if (!currentUser) return [];

    const matchScores = userDetailsArray
      .filter((user) => user.id !== currentUserId)
      .map((user) => {
        let score = 0;

        // Add points for matching city
        if (user.city === currentUser.city) score++;

        // Add points for each matching language
        const languageMatches = user.languages.filter((lang) =>
          currentUser.languages.includes(lang)
        ).length;
        score += languageMatches;

        // Add points for each matching hobby
        const hobbyMatches = user.hobbies.filter((hobby) =>
          currentUser.hobbies.includes(hobby)
        ).length;
        score += hobbyMatches;

        return { id: user.id, score }; // Attach score to user data
      });

    return matchScores;
  };

  useEffect(() => {
    if (recommendationsWithDetails.length > 0 && currentUserId) {
      const matches = findMatches(currentUserId, recommendationsWithDetails);
      setMatchedUserIds(matches);
    }
  }, [recommendationsWithDetails, currentUserId]);

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

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      const ids = await fetchRecommendations();
      setRecommendations(ids);

      const detailsPromises = ids.map((id) => fetchUserDetails(id));
      const details = await Promise.all(detailsPromises);
      const validDetails = details.filter(Boolean);

      setRecommendationsWithDetails(validDetails);
      setLoading(false);
    };

    fetchAllData();
  }, [navigate]);

  useEffect(() => {
    const fetchRecommendedUserData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const userDataPromises = matchedUserIds.map(async ({ id, score }) => {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/users/${id}`, // Accessing the 'id' of the user
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const userData = await response.json();
            return { ...userData, score }; // Include score
          }
          return null;
        });

        const recommendedUsers = await Promise.all(userDataPromises);
        const validRecommendedUsers = recommendedUsers.filter(Boolean);

        // Sort users by score in descending order (highest first)
        const sortedUsers = validRecommendedUsers.sort(
          (a, b) => b.score - a.score
        );

        setRecommendationsWithImage(sortedUsers); // Set sorted users
      } catch (error) {
        console.error("Error fetching recommended user data:", error);
      }
    };

    if (matchedUserIds.length > 0) {
      fetchRecommendedUserData();
    }
  }, [matchedUserIds]);

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
      ) : matchedUserIds.length > 0 && recommendationsWithImage.length > 0 ? (
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {recommendationsWithImage.map((user, index) => (
            <Grid size={{ xs: 2, sm: 4, md: 4 }} key={`${index}`}>
              <Card
                sx={{
                  height: 250,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: 3,
                  backgroundColor: "#ffffff",
                  padding: 2,
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mt={2}
                >
                  <Avatar
                    src={handleImageDisplay(user.image)}
                    sx={{ width: 100, height: 100, boxShadow: 3 }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                  {user.name || "Unknown User"}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Points: {user.score} {/* Displaying the score here */}
                </Typography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  mt="auto"
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{
                      backgroundColor: "rgb(44,44,44)",
                      color: "#f4f3f3",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      fontFamily: "Poppins",
                      width: "45%",
                    }}
                    onClick={() => console.log(`Decline user: ${user.id}`)}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{
                      backgroundColor: "rgb(44,44,44)",
                      color: "#f4f3f3",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      fontFamily: "Poppins",
                      width: "45%",
                    }}
                    onClick={() => console.log(`Connect with: ${user.id}`)}
                  >
                    Connect
                  </Button>
                </Box>
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
