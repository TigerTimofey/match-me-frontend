import { Box, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ConnectionButtons({ choosenId, currentUserId, onDismiss }) {
  const [dismissed, setDismissed] = useState([]);
  const [isPending, setIsPending] = useState(false);

  const navigate = useNavigate();

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
      if (userResponse.status === 401 || userResponse.status === 403) {
        navigate("/");
        return;
      }
      if (!userResponse.ok) {
        console.error("Failed to fetch user data:", await userResponse.json());
        return;
      }

      const userData = await userResponse.json();
      const currentDismissed = userData.dismissed || [];
      //   console.log("currentDismissed", currentDismissed);
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
  const handleConnect = async () => {
    setIsPending(true);
    try {
      const token = localStorage.getItem("jwt");

      // Fetch current user's outcomeRequests
      const userResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/outcome-requests`,
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
      const currentOutcomeRequests = userData.outcomeRequests || [];

      // Outcome requests update
      if (!currentOutcomeRequests.includes(choosenId)) {
        currentOutcomeRequests.push(choosenId);
      }

      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          outcomeRequests: currentOutcomeRequests,
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
        console.log("Outcome requests updated successfully:", updatedData);
      } else {
        const errorData = await response.json();
        console.error("Failed to update Outcome requests:", errorData);
      }

      // Income requests update
      const incomeUserResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${choosenId}/income-requests`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        incomeUserResponse.status === 401 ||
        incomeUserResponse.status === 403
      ) {
        navigate("/");
        return;
      }

      if (!incomeUserResponse.ok) {
        console.error(
          "Failed to fetch target user data:",
          await incomeUserResponse.json()
        );
        return;
      }

      const incomeUserData = await incomeUserResponse.json();
      const currentIncomeRequests = incomeUserData.incomeRequests || [];

      if (!currentIncomeRequests.includes(currentUserId)) {
        currentIncomeRequests.push(currentUserId);
      }

      const incomeResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${choosenId}/income-requests`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(currentIncomeRequests), // Send updated array
        }
      );
      if (incomeResponse.status === 401 || incomeResponse.status === 403) {
        navigate("/");
        return;
      }
      if (incomeResponse.ok) {
        console.log(
          `Successfully added your ID to ${choosenId}'s incomeRequests.`
        );
      } else {
        console.error(
          "Failed to update incomeRequests:",
          await incomeResponse.json()
        );
      }
    } catch (error) {
      console.error("Error updating connection requests:", error);
    }
  };
  useEffect(() => {
    const checkPendingStatus = () => {
      const token = localStorage.getItem("jwt");

      // Check if choosenId is in the outcome or income requests
      Promise.all([
        fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/${currentUserId}/outcome-requests`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/${choosenId}/income-requests`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ])
        .then(([outcomeResponse, incomeResponse]) => {
          if (!outcomeResponse.ok || !incomeResponse.ok) return;

          return Promise.all([outcomeResponse.json(), incomeResponse.json()]);
        })
        .then(([outcomeData, incomeData]) => {
          const outcomeRequests = outcomeData?.outcomeRequests || [];
          const incomeRequests = incomeData?.incomeRequests || [];

          setIsPending(
            outcomeRequests.includes(choosenId) ||
              incomeRequests.includes(currentUserId)
          );
        })
        .catch((err) => console.error(err));
    };

    checkPendingStatus();
  }, [choosenId, currentUserId]);

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
        Dismiss
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
        onClick={handleConnect}
        disabled={isPending} // Disable if pending
      >
        {isPending ? "Pending" : "Connect"}
      </Button>
    </Box>
  );
}

export default ConnectionButtons;
