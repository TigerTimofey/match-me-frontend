import { Box, Button } from "@mui/material";
import { useState, useEffect } from "react";

function ConnectionButtons({ choosenId, currentUserId, onDismiss }) {
  const [dismissed, setDismissed] = useState([]); // Managing the dismissed state here
  console.log(
    "dismissed",
    dismissed.length > 0 ? dismissed : "No dismissed users"
  );

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

      if (!userResponse.ok) {
        console.error("Failed to fetch user data:", await userResponse.json());
        return;
      }

      const userData = await userResponse.json();
      const currentDismissed = userData.dismissed || [];
      console.log("currentDismissed", currentDismissed);
      setDismissed(currentDismissed);
    };

    fetchUser();
  }, []);

  const handleDecline = async () => {
    try {
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

      if (!userResponse.ok) {
        console.error("Failed to fetch user data:", await userResponse.json());
        return;
      }

      const userData = await userResponse.json();
      const currentDismissed = userData.dismissed || [];

      if (!currentDismissed.includes(choosenId)) {
        currentDismissed.push(choosenId);
      }
      setDismissed(currentDismissed);

      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          dismissed: currentDismissed,
        })
      );

      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        console.log("User dismissed updated successfully:", updatedData);
      } else {
        const errorData = await response.json();
        console.error("Failed to update dismissed list:", errorData);
      }
      onDismiss(choosenId);
    } catch (error) {
      console.error("Error updating dismissed list:", error);
    }
  };

  return (
    <Box display="flex" justifyContent="space-between" width="100%" mt="auto">
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
        onClick={handleDecline}
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
        onClick={() => console.log(`Connect with: ${choosenId}`)}
      >
        Connect
      </Button>
    </Box>
  );
}

export default ConnectionButtons;
