import React from "react";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { Typography, Box, Divider } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import TelegramIcon from "@mui/icons-material/Telegram";
import RecommendIcon from "@mui/icons-material/Recommend";
import EarbudsTwoToneIcon from "@mui/icons-material/EarbudsTwoTone";
import { useNavigate } from "react-router-dom";

const Drawer = ({ userData }) => {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const drawerWidth = sm ? 70 : 180;

  const StyledDrawer = styled(MuiDrawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: "border-box",
    [`& .${drawerClasses.paper}`]: {
      width: drawerWidth,
      backgroundColor: theme.palette.background.paper,
      boxSizing: "border-box",
      borderRight: "none",
    },
  }));

  const navigate = useNavigate();

  return (
    <StyledDrawer variant="permanent">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "rgb(44, 44, 44)",
          color: "#b2b2b2",
        }}
      >
        {!sm && (
          <Typography
            variant="body1"
            sx={{
              pt: 2,
              width: "100%",
              textAlign: "center",
              fontFamily: "Poppins",
              fontWeight: 800,
            }}
          >
            Welcome Back, {userData?.name} 👋
          </Typography>
        )}
        {sm && (
          <Typography
            variant="body1"
            sx={{
              pt: 2,
              width: "100%",
              textAlign: "center",
              fontFamily: "Poppins",
              fontWeight: 800,
            }}
          >
            <EarbudsTwoToneIcon onClick={() => navigate("/me")} />
          </Typography>
        )}

        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Divider
            sx={{
              my: 2,

              width: "80%",

              backgroundColor: "background.paper",
            }}
          />

          {sm ? (
            <>
              <Typography variant="body1" sx={{ mt: 2, fontFamily: "Poppins" }}>
                <HomeIcon
                  onClick={() => {
                    console.log("Dashboard");
                  }}
                  sx={{ fontSize: "30px" }}
                />
              </Typography>
              <Divider
                sx={{
                  my: 2,

                  width: "80%",

                  backgroundColor: "background.paper",
                }}
              />
              <Typography variant="body1" sx={{ mt: 1, fontFamily: "Poppins" }}>
                <RecommendIcon
                  onClick={() => {
                    console.log("recommended");
                  }}
                  sx={{ fontSize: "30px" }}
                />
              </Typography>
              <Divider
                sx={{
                  my: 2,

                  width: "80%",

                  backgroundColor: "background.paper",
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("Chat");
                }}
              >
                <TelegramIcon sx={{ fontSize: "30px" }} />
              </Typography>
            </>
          ) : (
            <>
              <Typography
                variant="body1"
                sx={{
                  mt: 2,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("Dashboard");
                }}
              >
                Dashboard
              </Typography>
              <Divider
                sx={{
                  my: 2,

                  width: "80%",

                  backgroundColor: "background.paper",
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("Recommended");
                }}
              >
                Recommend
              </Typography>
              <Divider
                sx={{
                  my: 2,

                  width: "80%",

                  backgroundColor: "background.paper",
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => {
                  console.log("Chat");
                }}
              >
                Chat
              </Typography>
            </>
          )}

          <Divider
            sx={{
              my: 2,

              width: "80%",

              backgroundColor: "background.paper",
            }}
          />
        </Box>
      </Box>
    </StyledDrawer>
  );
};

export default Drawer;
