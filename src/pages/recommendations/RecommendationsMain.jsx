import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

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
  const [ageRange, setAgeRange] = useState([1, 99]);
  const [gender, setgender] = useState("all");
  const [dismissed, setDismissed] = useState([]);
  const [connections, setConnections] = useState([]);
  const stompClientRef = useRef(null);
  const [friendFriendMatches, setFriendFriendMatches] = useState([]);

  const fetchConnectionsForRecommendations = async () => {
    const token = localStorage.getItem("jwt");

    // Function to fetch connections for a given user
    const fetchConnectionsForUser = async (userId) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/${userId}/connections`,
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
          console.error(
            `Failed to fetch connections for user ${userId}:`,
            errorData
          );
          return [];
        }

        const connectionsData = await response.json();
        return connectionsData.connections;
      } catch (error) {
        console.error(`Error fetching connections for user ${userId}:`, error);
        return [];
      }
    };

    try {
      const logData = {}; // Object to store all the logs in one place
      logData[`currentUserId`] = currentUserId;
      logData[`currentUserRecommend`] = recommendations;

      // Step 1: Fetch connections for the current user
      const currentUserConnections = await fetchConnectionsForUser(
        currentUserId
      );
      logData.currentUserConnections = currentUserConnections;

      // Step 2: Loop through each recommended user and fetch their connections
      for (const user of recommendationsWithImage) {
        const recommendedUserConnections = await fetchConnectionsForUser(
          user.id
        );
        logData[`recommendedUser_${user.id}`] = recommendedUserConnections;

        // Step 3: Fetch and log the connections of each friend (friend of a recommended user)
        for (const friendId of recommendedUserConnections) {
          const friendConnections = await fetchConnectionsForUser(friendId);
          logData[`friendConnections_${friendId}`] = friendConnections;

          // Step 4: Compare friend connections with current user's connections
          const matchingConnections = friendConnections.filter((friendConn) =>
            currentUserConnections.includes(friendConn)
          );

          // Step 5: Log the matching connections in the desired format
          if (matchingConnections.length > 0) {
            const matchingConnectionsIds = matchingConnections.join(", ");
            logData[`Friends-friends: ${matchingConnectionsIds}`] =
              matchingConnections;
            console.log(`Friends-friends: [${matchingConnectionsIds}]`);
          }

          // Step 6: Check if any recommended user IDs match friend connections and log them
          for (const user of recommendationsWithImage) {
            const recommendedUserConnections = await fetchConnectionsForUser(
              user.id
            );
            logData[`recommendedUser_${user.id}`] = recommendedUserConnections;

            // Step 7: Check friend connections for matches with current user's recommendations
            for (const friendId of recommendedUserConnections) {
              const friendConnections = await fetchConnectionsForUser(friendId);
              logData[`friendConnections_${friendId}`] = friendConnections;

              // Step 8: Compare recommended users with friend connections
              const friendFriendMatches = friendConnections.filter(
                (friendConn) => recommendations.includes(friendConn)
              );

              // Step 9: Filter out the current user's ID from the matched friends
              const filteredFriendFriendMatches = friendFriendMatches.filter(
                (match) => match !== currentUserId
              );

              // Log matches if there are any after filtering out the currentUserId
              if (filteredFriendFriendMatches.length > 0) {
                const friendFriendMatchIds =
                  filteredFriendFriendMatches.join(", ");
                setFriendFriendMatches(friendFriendMatchIds);

                // logData[`Friend-friend matched: ${friendFriendMatchIds}`] =
                //   filteredFriendFriendMatches;
                console.log(`Friend-friend matched: [${friendFriendMatchIds}]`);
                // ;
              }
            }
          }
        }
      }

      // Final consolidated log
      console.log("All Connections and Matching Data:", logData);
    } catch (error) {}
  };
  if (recommendations.length > 0) {
    fetchConnectionsForRecommendations();
  }

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
      if (
        updatedConnectionResponse.status === 401 &&
        updatedConnectionResponse.status === 403
      ) {
        navigate("/");
        return;
      }
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
          return { ...userData, id, score, gender: bioData.gender };
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
  useEffect(() => {
    const sockjs = new SockJS(`${process.env.REACT_APP_SERVER_URL}/ws`);

    const stompClient = new Client({
      webSocketFactory: () => sockjs,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log("Connected to WebSocket");

      stompClient.subscribe("/topic/messages", (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log("RECOM Parsed message:", receivedMessage.content);

        if (receivedMessage.content === "Accepted") {
          console.log(
            "RECOM Accepted message received:",
            receivedMessage.content
          );
          refreshRecommendations();
        } else {
          console.log("RECOM Other message received:", receivedMessage.content);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("Broker reported error:", frame.headers["message"]);
      console.error("Additional details:", frame.body);
    };

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);
  // Function to refresh recommendations
  const refreshRecommendations = async () => {
    console.log("Refreshing recommendations...");

    try {
      // Fetch updated recommendations
      const updatedRecommendations = await fetchRecommendations();

      // Add a small timeout to wait for connections to update
      setTimeout(async () => {
        // Get user connections from the server
        const token = localStorage.getItem("jwt"); // Get authorization token

        const connectionsResponse = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/connections`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!connectionsResponse.ok) {
          console.error(
            "Failed to fetch connections:",
            await connectionsResponse.json()
          );
          return;
        }

        const connectionsData = await connectionsResponse.json();
        const currentConnections = connectionsData.connections || []; // List of connections
        console.log("Raw Connections Response:", connectionsData); // Debugging raw response

        // Ensure all connection IDs are numbers (or strings, depending on your data model)
        const connectionIds = currentConnections.map((id) => Number(id)); // Ensure consistency (convert all to numbers)

        console.log("Current Connections (after conversion):", connectionIds); // For debugging

        // Fetch updated user details for recommendations
        const updatedDetailsPromises = updatedRecommendations.map((id) =>
          fetchUserDetails(id)
        );
        const updatedDetails = await Promise.all(updatedDetailsPromises);

        // Filter by age range and exclude connections
        const validDetails = updatedDetails.filter((user) => {
          // Ensure both comparison values are numbers (or strings)
          const userId = Number(user?.id); // Convert to number if necessary
          const isInConnections = connectionIds.includes(userId); // Check if user ID is in connections

          return (
            user?.age >= ageRange[0] &&
            user?.age <= ageRange[1] &&
            !isInConnections // Exclude users that are already in connections
          );
        });

        console.log("Filtered Recommendations: ", validDetails); // For debugging

        // Update the state with filtered recommendations
        setRecommendationsWithDetails(validDetails);
        setRecommendationsWithImage(validDetails);
      }, 1000); // Timeout for 1 second (you can adjust this time if needed)
    } catch (err) {
      console.error("Error refreshing recommendations:", err);
    }
  };

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

    if (userResponse.status === 401 && userResponse.status === 403) {
      navigate("/");
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
  useEffect(() => {
    if (recommendationsWithDetails.length > 0 && currentUserId) {
      // console.log("Recommendations:", recommendationsWithDetails);
      // console.log("Current User ID:", currentUserId);
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

      if (response.status === 401 && response.status === 403) navigate("/");
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
    if (matchedUserIds.length > 0) {
      fetchRecommendedUserData();
    }
  }, [matchedUserIds, dismissed]);

  const handleDismiss = (dismissedId) => {
    setRecommendationsWithImage((prevRecommendations) =>
      prevRecommendations.filter((user) => user.id !== dismissedId)
    );
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      getConnections(currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (recommendationsWithImage.length > 0 && friendFriendMatches.length > 0) {
      // Update user score based on friend-friend matches
      const updatedRecommendationsWithScore = recommendationsWithImage.map(
        (user) => {
          const isFriendFriendMatch = friendFriendMatches.includes(user.id);

          // If it's a friend-friend match, add an additional point to the score
          const updatedScore = isFriendFriendMatch
            ? Math.min(user.score + 1, 5)
            : user.score;

          return { ...user, score: updatedScore };
        }
      );

      setRecommendationsWithImage(updatedRecommendationsWithScore);
    }
  }, [friendFriendMatches]);

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
          <GenderFilter value={gender} onChange={setgender} />
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
                (user.gender === gender || gender === "all") && user.score >= 2
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
                    {user.gender === "Male" || user.gender === "Female" ? (
                      <StyledBadge badgeContent={user.gender}>
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
