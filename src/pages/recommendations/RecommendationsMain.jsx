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

    if (!currentUser) {
      console.warn(
        `Current user with ID ${currentUserId} not found in details array.`
      );
      return [];
    }

    const matchScores = userDetailsArray
      .filter((user) => user.id !== currentUserId)
      .map((user) => {
        let score = 0;

        if (user.city === currentUser.city) score++;
        if (user.languages.some((lang) => currentUser.languages.includes(lang)))
          score++;
        if (user.hobbies.some((hobby) => currentUser.hobbies.includes(hobby)))
          score++;

        return { id: user.id, score };
      });

    console.log("Match scores for recommendations:", matchScores);

    // Sort matches by score in descending order
    const sortedMatches = matchScores
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ id }) => id);

    return sortedMatches;
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
    if (matchedUserIds.length > 0) {
      const fetchRecommendedUserData = async () => {
        try {
          const token = localStorage.getItem("jwt");
          const userDataPromises = matchedUserIds.map(async (id) => {
            const response = await fetch(
              `${process.env.REACT_APP_SERVER_URL}/api/users/${id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (response.ok) {
              return await response.json();
            } else {
              console.error(`Failed to fetch user data for ID ${id}`);
              return null;
            }
          });

          const recommendedUsers = await Promise.all(userDataPromises);
          const validRecommendedUsers = recommendedUsers.filter(Boolean);
          setRecommendationsWithImage(validRecommendedUsers);
          console.log("Recommended User Data:", validRecommendedUsers);
        } catch (error) {
          console.error("Error fetching recommended user data:", error);
        }
      };

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
                  mt={2} // Margin top for spacing
                >
                  <Avatar
                    src={handleImageDisplay(user.image)}
                    sx={{ width: 100, height: 100, boxShadow: 3 }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                  {user.name || "Unknown User"}
                </Typography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  width="100%"
                  mt="auto" // Pushes buttons to the bottom
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
                    onClick={() =>
                      console.log(`Decline user: ${matchedUserIds[index]}`)
                    }
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
                    onClick={() =>
                      console.log(`Connect with: ${matchedUserIds[index]}`)
                    }
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
