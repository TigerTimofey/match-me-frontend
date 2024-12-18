import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
import {
  Box,
  Alert,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import UserDetailsCard from "./user-data/UserDetails";
import UserProfileCard from "./user-data/UserProfile";
import UserBioCard from "./user-data/UserBio";
import Drawer from "./components/Drawer";

function MainComponent() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  // const [username, setUsername] = useState("Guest");
  const [userData, setUserData] = useState(null);
  const [userBioData, setUserBioData] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      // try {
      //   const decoded = jwtDecode(token);
      //   setUsername(decoded.username || "User");
      //   console.log(username);
      // } catch (error) {
      //   console.error("Error decoding JWT:", error);
      //   setUsername("Guest");
      //   navigate()
      // }

      const fetchUserDetails = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/auth/me`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            if (response.status === 401) {
              setMessage({
                type: "error",
                text: "Session expired or unauthorized. Redirecting...",
              });
              navigate("/");
            } else {
              const errorData = await response.json();
              setMessage({
                type: "error",
                text: errorData.message || "Failed to fetch user data.",
              });
            }
            return;
          }

          const data = await response.json();
          setUserData(data);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setMessage({
            type: "error",
            text: "Something went wrong while fetching user data.",
          });
        }
      };

      fetchUserDetails();
    } else {
      console.warn("No JWT found in localStorage.");
      navigate("/");
    }
  }, [navigate]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);

  const handleMenuClose = async (menuItem) => {
    setAnchorEl(null);

    if (menuItem === "Logout") {
      localStorage.removeItem("jwt");
      navigate("/");
      return;
    }

    setLoading(true);
    let endpoint = "";

    switch (menuItem) {
      case "Profile":
        endpoint = "/api/auth/me/profile";
        setModalContent("Profile");
        break;
      case "Biographic":
        endpoint = "/api/auth/me/bio";
        setModalContent("Biographic");
        break;
      default:
        setLoading(false);
        return;
    }

    try {
      const token = localStorage.getItem("jwt");
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}${endpoint}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setMessage({
            type: "error",
            text: "Session expired or unauthorized. Redirecting...",
          });
          navigate("/");
        } else {
          const errorData = await response.json();
          setMessage({
            type: "error",
            text:
              errorData.message ||
              `Failed to fetch ${menuItem.toLowerCase()} data.`,
          });
        }
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (menuItem === "Profile") {
        setUserProfileData(data);
        setUserBioData(null);
      } else if (menuItem === "Biographic") {
        setUserBioData(data);
        setUserProfileData(null);
      }
      setModalOpen(true);
    } catch (error) {
      console.error(`Error fetching ${menuItem.toLowerCase()} data:`, error);
      setMessage({
        type: "error",
        text: `Something went wrong while fetching ${menuItem.toLowerCase()} data.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer variant="permanent" userData={userData} />{" "}
      <Box sx={{ flexGrow: 1, padding: 0 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography
              variant="h9"
              sx={{ flexGrow: 1, fontFamily: "Poppins" }}
            >
              MM
            </Typography>
            <Avatar
              src={userData?.avatarUrl}
              sx={{
                width: 40,
                height: 40,
                ml: 2,
                border: 1,
                borderColor: "white",
                boxShadow: 1,
              }}
            />
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => handleMenuClose("")}
              PaperProps={{ elevation: 4 }}
            >
              <MenuItem onClick={() => handleMenuClose("Profile")}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => handleMenuClose("Biographic")}>
                Biographic
              </MenuItem>
              <MenuItem
                onClick={() => handleMenuClose("Logout")}
                sx={{ color: "error.main" }}
              >
                <ExitToAppIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box>
          {message.type && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          {userData && <UserDetailsCard userData={userData} />}
        </Box>
      </Box>
      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "75%",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          {loading ? (
            <CircularProgress sx={{ display: "block", margin: "auto" }} />
          ) : modalContent === "Profile" && userProfileData ? (
            <UserProfileCard userProfileData={userProfileData} />
          ) : modalContent === "Biographic" && userBioData ? (
            <UserBioCard userBioData={userBioData} />
          ) : (
            <Typography>Loading...</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default MainComponent;
