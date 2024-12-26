import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Alert,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem,
  Modal,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import UserDetailsCard from "./user-data/UserDetails";
import UserProfileCard from "./user-data/UserProfile";
import UserBioCard from "./user-data/UserBio";
import Drawer from "./components/Drawer";

import RecommendationsMain from "./recommendations/RecommendationsMain";

import EarbudsTwoToneIcon from "@mui/icons-material/EarbudsTwoTone";
import FaceIcon from "@mui/icons-material/Face";
import Face3Icon from "@mui/icons-material/Face3";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import FingerprintIcon from "@mui/icons-material/Fingerprint";

import { handleImageDisplay } from "../utils/handleImageDisplay";

function MainComponent() {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userBioData, setUserBioData] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [hasCompleteBio, setHasCompleteBio] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      const fetchUserDetails = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_SERVER_URL}/api/users/me`,
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
        endpoint = "/api/users/me/profile";
        setModalContent("Profile");
        break;
      case "Bio":
        endpoint = "/api/users/me/bio";
        setModalContent("Bio");
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
      } else if (menuItem === "Bio") {
        setUserBioData({ ...data, currentUserId: userData?.id });
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

  const validateBioData = (data) => {
    const requiredFields = [
      "name",
      "lastname",
      "gender",
      "age",
      "city",
      "hobbies",
      "languages",
    ];

    return requiredFields.every((field) => {
      const value = data[field];
      if (field === "image") {
        return value && value.trim().length > 0;
      }
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim().length > 0;
    });
  };
  useEffect(() => {
    if (userBioData) {
      // console.log("userBioData", userBioData);
      const isComplete = validateBioData(userBioData);
      setHasCompleteBio(isComplete);
    }
  }, [userBioData]);
  useEffect(() => {
    if (activeMenu === "Recommend" && userBioData) {
      setHasCompleteBio(validateBioData(userBioData));
    }
  }, [activeMenu, userBioData]);

  const handleDrawerMenuSelect = (menu, data) => {
    setActiveMenu(menu);
    switch (menu) {
      case "Dashboard":
        console.log(data);
        console.log("Dashboard in main clicked");
        break;
      case "Recommend":
        console.log("Recommend in main clicked");
        <RecommendationsMain />;
        break;
      case "Chat":
        console.log("Chat  in main clicked");
        break;
      case "Logout":
        localStorage.removeItem("jwt");
        navigate("/");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const simulateBioFetch = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("jwt");
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/api/users/me/bio`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bio data");
        }

        const data = await response.json();
        setUserBioData({ ...data, currentUserId: userData?.id });
      } catch (error) {
        console.error("Error simulating bio fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activeMenu === "Recommend" && !userBioData) {
      simulateBioFetch();
    }
  }, [activeMenu, userBioData, userData]);

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        userData={userData}
        activeMenu={activeMenu}
        onSelectMenu={handleDrawerMenuSelect}
      />{" "}
      <Box sx={{ flexGrow: 1, padding: 0 }}>
        <AppBar position="static" sx={{ backgroundColor: "rgb(44,44,44)" }}>
          <Toolbar>
            <Typography
              variant="h6"
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
                fontFamily: "Poppins",
                fontSize: {
                  xs: "1.2rem",
                  sm: "1.6rem",
                },
                color: "#b2b2b2",
                cursor: "pointer",
                userSelect: "none",
                WebkitUserSelect: "none",
                msUserSelect: "none",
              }}
              onClick={() => {
                navigate("/me");
                handleDrawerMenuSelect("Dashboard");
              }}
            >
              {!sm && (
                <EarbudsTwoToneIcon
                  sx={{ fontSize: 35, mr: 1, cursor: "pointer" }}
                />
              )}
              Match Me
            </Typography>

            <Avatar
              src={handleImageDisplay(userData?.image)}
              sx={{
                width: 35,
                height: 35,
                ml: 2,
                border: 1,
                borderColor: "white",
                boxShadow: 1,
                cursor: "pointer",
              }}
              onClick={handleMenuOpen}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => handleMenuClose("")}
              slotProps={{ paper: { elevation: 4 } }}
              aria-hidden={false}
            >
              <MenuItem
                aria-hidden={false}
                onClick={() => handleMenuClose("Profile")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                }}
              >
                {userData?.gender === "Male" ? (
                  <FaceIcon />
                ) : userData?.gender === "Female" ? (
                  <Face3Icon />
                ) : (
                  <AccountCircleIcon />
                )}
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center", ml: 1 }}
                >
                  Profile
                </Typography>
              </MenuItem>

              <MenuItem
                aria-hidden={false}
                onClick={() => handleMenuClose("Bio")}
                sx={{ padding: 2 }}
              >
                <FingerprintIcon />{" "}
                <Typography
                  variant="body1"
                  sx={{ display: "flex", alignItems: "center", ml: 1 }}
                >
                  Bio
                </Typography>
              </MenuItem>

              <MenuItem
                aria-hidden={false}
                onClick={() => handleMenuClose("Logout")}
                sx={{ padding: 2, color: "#dc3910" }}
              >
                <ExitToAppIcon sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* DATA SHOW WELL CHOOSE MENU */}

        <Box sx={{ mt: 2 }}>
          {message.type && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          {activeMenu === "Dashboard" && userData && (
            <UserDetailsCard userData={userData} />
          )}
          {activeMenu === "Recommend" &&
            (hasCompleteBio ? (
              <RecommendationsMain currentUserId={userData.id} />
            ) : (
              <Box sx={{ position: "relative", textAlign: "center" }}>
                <Typography
                  color="error"
                  sx={{
                    backgroundColor: "rgb(125, 59, 59)",
                    color: "#f4f3f3",
                    borderRadius: 10,
                    margin: 10,
                    p: 3,
                    fontWeight: 600,
                    fontFamily: "Poppins",
                  }}
                >
                  Please complete your profile to see recommendations.
                </Typography>

                {userBioData && (
                  <Button
                    onClick={() => {
                      setModalContent("Bio");
                      setModalOpen(true);
                    }}
                    // className="animate__animated animate__headShake animate__delay-2s"
                    sx={{
                      marginTop: "10px",
                      padding: "10px 20px",
                      backgroundColor: "rgb(44,44,44)",
                      color: "#f4f3f3",
                      fontWeight: 600,
                      fontFamily: "Poppins",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Complete Bio
                  </Button>
                )}
              </Box>
            ))}
        </Box>
      </Box>
      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        aria-hidden="false"
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
            backgroundColor: "#f4f3f3",
            color: "rgb(44,44,44)",
          }}
        >
          {loading ? (
            <CircularProgress sx={{ display: "block", margin: "auto" }} />
          ) : modalContent === "Profile" && userProfileData ? (
            <UserProfileCard
              currentUserId={userData.id}
              userProfileData={userProfileData}
            />
          ) : modalContent === "Bio" && userBioData ? (
            <UserBioCard
              userBioData={userBioData}
              setUserBioData={setUserBioData}
            />
          ) : (
            <Typography>Loading...</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
}

export default MainComponent;
