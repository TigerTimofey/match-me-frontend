import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Box,
  Avatar,
  Button,
  Badge,
  styled,
} from "@mui/material";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import Grid from "@mui/material/Grid2";
import { useNavigate } from "react-router-dom";
import { handleImageDisplay } from "../../utils/handleImageDisplay";
import AgeRangeSlider from "./components/AgeRangeSlider";
import GenderFilter from "./components/GenderFilter";
import ConnectionButtons from "./components/buttons/ConnectionButtons";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "rgb(44,44,44)",
    color: "#f0efef",
    fontWeight: "bold",
    textAlign: "center",
    transform: "translateX(40px)",
    [theme.breakpoints.down("sm")]: {
      display: "none",
    },
  },
}));

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
  const [ageRange, setAgeRange] = useState([0, 99]);
  const [genres, setgenres] = useState("all");
  const [dismissed, setDismissed] = useState([]);
  const [connections, setConnections] = useState([]);

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
      .filter(
        (user) => user?.id !== currentUserId && user?.city === currentUser?.city
      )
      .map((user) => {
        let score = 0;

        if (user.city === currentUser.city) score++;

        const languageMatches = user.languages.filter((lang) =>
          currentUser.languages.includes(lang)
        ).length;
        score += languageMatches;

        const hobbyMatches = user.hobbies.filter((hobby) =>
          currentUser.hobbies.includes(hobby)
        ).length;
        score += hobbyMatches;

        return { id: user.id, score };
      });

    return matchScores;
  };

  useEffect(() => {
    if (recommendationsWithDetails.length > 0 && currentUserId) {
      console.log("Recommendations:", recommendationsWithDetails);
      console.log("Current User ID:", currentUserId);
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

      const validDetails = details.filter((user) => {
        return user?.age >= ageRange[0] && user?.age <= ageRange[1];
      });

      setRecommendationsWithDetails(validDetails);
      setLoading(false);
    };

    fetchAllData();
  }, [navigate, ageRange]);

  useEffect(() => {
    const fetchAndLogAges = async () => {
      for (const { id } of matchedUserIds) {
        const userDetails = await fetchUserDetails(id);
      }
    };

    if (matchedUserIds.length > 0) {
      fetchAndLogAges();
    }
  }, [matchedUserIds]);

  useEffect(() => {
    const fetchRecommendedUserData = async () => {
      try {
        const token = localStorage.getItem("jwt");
        const userDataPromises = matchedUserIds.map(async ({ id, score }) => {
          const userResponse = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/users/${id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const userData = userResponse.ok ? await userResponse.json() : null;

          const bioResponse = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/users/${id}/bio`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const bioData = bioResponse.ok ? await bioResponse.json() : null;

          if (userData && bioData) {
            return { ...userData, id, score, genres: bioData.genres };
          }

          return null;
        });

        const recommendedUsers = await Promise.all(userDataPromises);
        const validRecommendedUsers = recommendedUsers.filter(Boolean);

        const nonConnectedUsers = validRecommendedUsers.filter(
          (user) => !connections.includes(user.id)
        );

        const sortedUsers = nonConnectedUsers.sort((a, b) => b.score - a.score);
        const filteredUsers = sortedUsers.filter(
          (user) => !dismissed.includes(user.id)
        );

        setRecommendationsWithImage(filteredUsers);
      } catch (error) {
        console.error("Error fetching recommended user data:", error);
      }
    };

    if (matchedUserIds.length > 0) {
      fetchRecommendedUserData();
    }
  }, [matchedUserIds, dismissed]);
  // console.log(
  //   "recommendationsWithImage",
  //   recommendationsWithImage.map(
  //     (id, index) => recommendationsWithImage[index].id
  //   )
  // );
  const handleDismiss = (dismissedId) => {
    setRecommendationsWithImage((prevRecommendations) =>
      prevRecommendations.filter((user) => user.id !== dismissedId)
    );
  };
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("jwt");

      const userResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/dismissed`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (userResponse.status === 401) {
        navigate("/me");
        return;
      }

      let userData = null;

      if (userResponse.ok) {
        // Read response only once
        userData = await userResponse.json();
        setRecommendationsWithImage(userData);

        const currentDismissed = userData.dismissed || [];
        setDismissed(currentDismissed);
      } else {
        const errorData = await userResponse.json(); // Read the error message only once
        console.error("Failed to fetch user data:", errorData);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const getConnections = async (currentUserId) => {
      try {
        const token = localStorage.getItem("jwt");
        const updatedConnectionResponse = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/connections`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!updatedConnectionResponse.ok) {
          const errorUpdatedResponse = await updatedConnectionResponse.json();
          console.error(
            "Failed to fetch updated connections:",
            errorUpdatedResponse
          );
          return;
        }

        // Parse the response before updating state
        const updatedConnectionData = await updatedConnectionResponse.json();
        console.log(
          "updatedConnectionData in recommendations",
          updatedConnectionData
        );

        // Update the connections state
        setConnections((prevConnections) => {
          const newConnections = [
            ...prevConnections,
            ...updatedConnectionData.connections,
          ];
          return Array.from(new Set(newConnections));
        });
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    if (currentUserId) {
      getConnections(currentUserId);
    }
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
          // letterSpacing: 3,
        }}
      >
        Recommendations
      </Typography>
      <Card
        sx={{
          padding: 3,
          boxShadow: 2,
          backgroundColor: "#f0efef",
          color: "rgb(44,44,44)",
          marginBottom: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: 200 }}>
          <AgeRangeSlider value={ageRange} onChange={setAgeRange} />
        </Box>

        <Box sx={{ width: 200 }}>
          <GenderFilter value={genres} onChange={setgenres} />
        </Box>
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
          {recommendationsWithImage
            .filter(
              (user) =>
                //not show poor match , only >= 2 stars
                (user.genres === genres || genres === "all") && user.score >= 2
            )
            .slice(0, 10)
            .map((user, index) => (
              <Grid size={{ xs: 12, sm: 4, md: 4 }} key={`${user.id}-${index}`}>
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
                  className="animate__animated  animate__fadeIn"
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    mt={2}
                  >
                    {user.genres === "Male" || user.genres === "Female" ? (
                      <StyledBadge badgeContent={user.genres}>
                        <Avatar
                          src={handleImageDisplay(user.image)}
                          sx={{ width: 100, height: 100, boxShadow: 3 }}
                        />
                      </StyledBadge>
                    ) : (
                      <Avatar
                        src={handleImageDisplay(user.image)}
                        sx={{ width: 100, height: 100, boxShadow: 3 }}
                      />
                    )}
                  </Box>{" "}
                  <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
                    {user.name || "Unknown User"}
                  </Typography>{" "}
                  <Box display="flex" alignItems="center" mt={1}>
                    <Rating
                      size="small"
                      value={Math.min(user.score, 5)}
                      max={5}
                      precision={0.5}
                      emptyIcon={
                        <StarIcon
                          style={{ opacity: 0.55 }}
                          fontSize="inherit"
                        />
                      }
                      readOnly
                    />
                  </Box>
                  <ConnectionButtons
                    choosenId={user.id}
                    currentUserId={currentUserId}
                    onDismiss={handleDismiss}
                  />
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
