import React from "react";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import { Typography, Box, Divider } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import TelegramIcon from "@mui/icons-material/Telegram";
import RecommendIcon from "@mui/icons-material/Recommend";

const Drawer = ({ userData }) => {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const drawerWidth = sm ? 70 : 140;

  const StyledDrawer = styled(MuiDrawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: "border-box",
    [`& .${drawerClasses.paper}`]: {
      width: drawerWidth,
      backgroundColor: theme.palette.background.paper,
      boxSizing: "border-box",
    },
  }));

  return (
    <StyledDrawer variant="permanent">
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {!sm && (
          <Typography
            variant="body1"
            sx={{
              pt: 2,
              width: "100%",
              textAlign: "center",
              fontFamily: "Poppins",
            }}
          >
            Welcome Back, {userData?.name}!
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
          <Divider sx={{ my: 2, borderColor: "black", width: "80%" }} />

          {sm ? (
            <>
              <Typography variant="body1" sx={{ mt: 2, fontFamily: "Poppins" }}>
                <HomeIcon />
              </Typography>
              <Divider sx={{ my: 2, borderColor: "black", width: "80%" }} />
              <Typography variant="body1" sx={{ mt: 1, fontFamily: "Poppins" }}>
                <RecommendIcon />
              </Typography>
              <Divider sx={{ my: 2, borderColor: "black", width: "80%" }} />
              <Typography variant="body1" sx={{ mt: 1, fontFamily: "Poppins" }}>
                <TelegramIcon />
              </Typography>
            </>
          ) : (
            <>
              <Typography variant="body1" sx={{ mt: 2, fontFamily: "Poppins" }}>
                Dashboard
              </Typography>
              <Divider sx={{ my: 2, borderColor: "black", width: "80%" }} />
              <Typography variant="body1" sx={{ mt: 1, fontFamily: "Poppins" }}>
                Recommend
              </Typography>
              <Divider sx={{ my: 2, borderColor: "black", width: "80%" }} />
              <Typography variant="body1" sx={{ mt: 1, fontFamily: "Poppins" }}>
                Chat
              </Typography>
            </>
          )}

          <Divider sx={{ my: 2, borderColor: "black", width: "80%" }} />
        </Box>
      </Box>
    </StyledDrawer>
  );
};

export default Drawer;
