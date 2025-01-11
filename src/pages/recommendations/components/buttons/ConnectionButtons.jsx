import { Box, Button, Chip, Divider, Modal, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { languages } from "../../../../local-variables/languages";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FingerprintIcon from "@mui/icons-material/Fingerprint";

function ConnectionButtons({ choosenId, currentUserId, onDismiss }) {
  const [dismissed, setDismissed] = useState([]);
  const [isPending, setIsPending] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("bio"); // 'bio' or 'profile'

  const [selectedUser, setSelectedUser] = useState(null);

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

  const handleGetProfileData = async () => {
    handleProfile();
    handleBio();
  };
  const handleProfileAndBio = async () => {
    const token = localStorage.getItem("jwt");
    try {
      const profileResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${choosenId}/profile`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );
      const bioResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${choosenId}/bio`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );

      if (!profileResponse.ok || !bioResponse.ok) {
        console.error("Failed to fetch data", profileResponse, bioResponse);
        return;
      }

      const profileData = await profileResponse.json();
      const bioData = await bioResponse.json();

      setSelectedUser({ ...profileData, ...bioData });
      setModalType("bio");
      setOpenModal(true);
    } catch (error) {
      console.error("Error fetching profile and bio:", error);
    }
  };
  const handleProfile = async () => {
    try {
      const token = localStorage.getItem("jwt");

      const profileResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${choosenId}/profile`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!profileResponse.ok) {
        console.error("Failed to fetch profile:", await profileResponse.json());
        return;
      }

      const profileData = await profileResponse.json();
      const { aboutme, lookingFor } = profileData;

      setSelectedUser({ aboutme, lookingFor });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleBio = async () => {
    try {
      const token = localStorage.getItem("jwt");

      const bioResponse = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/api/users/${choosenId}/bio`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!bioResponse.ok) {
        console.error("Failed to fetch bio:", await bioResponse.json());
        return;
      }

      const bioData = await bioResponse.json();
      const { name, lastname, age, genres, city, hobbies, languages } = bioData;

      setSelectedUser({
        name,
        lastname,
        age,
        genres,
        city,
        hobbies,
        languages,
      });
    } catch (error) {
      console.error("Error fetching bio:", error);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      width="100%"
      mt="auto"
      gap={2}
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
        onClick={handleProfileAndBio}
      >
        Bio
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

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            bgcolor: "#f0efef",
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            p: 4,
          }}
        >
          {selectedUser && (
            <>
              <Typography
                variant="h4"
                align="center"
                sx={{ fontFamily: "Poppins", fontWeight: 600 }}
              >
                Biographical & Profile
              </Typography>
              <Divider sx={{ my: 2, borderColor: "black" }} />

              <Typography
                variant="h5"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                {selectedUser.name} {selectedUser.lastname}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Age
              </Typography>
              <Typography variant="body1" align="center">
                {selectedUser.age}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Gender
              </Typography>
              <Typography variant="body1" align="center">
                {selectedUser.gender}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                City
              </Typography>
              <Typography variant="body1" align="center">
                {selectedUser.city}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Hobbies
              </Typography>
              <Typography variant="body1" align="center">
                {selectedUser.hobbies?.join(", ")}
              </Typography>

              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: 600, mt: 2 }}
              >
                Languages
              </Typography>
              <Box sx={{ textAlign: "center" }}>
                {selectedUser.languages?.map((lang, index) => (
                  <Chip
                    key={index}
                    label={languages[lang]}
                    sx={{ m: 0.5, fontSize: "2rem" }}
                  />
                ))}
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ fontWeight: 600, mt: 2 }}
                >
                  About Me
                </Typography>
                <Typography variant="body1" align="center">
                  {selectedUser.aboutme}
                </Typography>

                <Typography
                  variant="h6"
                  align="center"
                  sx={{ fontWeight: 600, mt: 2 }}
                >
                  Looking for
                </Typography>
                <Typography variant="body1" align="center">
                  {selectedUser.lookingFor ||
                    `Not added by ${selectedUser.name}`}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default ConnectionButtons;
