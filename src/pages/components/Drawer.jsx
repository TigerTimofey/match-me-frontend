import React from "react";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Box, Divider, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import TelegramIcon from "@mui/icons-material/Telegram";
import RecommendIcon from "@mui/icons-material/Recommend";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useNavigate } from "react-router-dom";

const Drawer = ({ userData, onSelectMenu }) => {
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerWidth, setDrawerWidth] = React.useState(sm ? 70 : 180);

  React.useEffect(() => {
    setDrawerWidth(sm ? 70 : 180);
  }, [sm]);

  const handleDrawerToggle = () => {
    setDrawerWidth((prevWidth) => (prevWidth === 180 ? 70 : 180));
  };

  const handleMenuClick = (menu) => {
    onSelectMenu(menu, userData);
  };

  return (
    <MuiDrawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        transition: "width 0.3s ease",
        [`& .${drawerClasses.paper}`]: {
          width: drawerWidth,
          backgroundColor: theme.palette.background.paper,
          borderRight: "none",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          backgroundColor: "rgb(44, 44, 44)",
          color: "#b2b2b2",
        }}
      >
        {!sm && drawerWidth !== 70 ? (
          <>
            <Typography
              variant="body1"
              sx={{
                pt: 2,
                width: "100%",
                textAlign: "center",
                fontFamily: "Poppins",
                fontWeight: 800,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                userSelect: "none",
                WebkitUserSelect: "none",
                msUserSelect: "none",
              }}
            >
              Welcome Back, {userData?.name} 👋
              <ChevronLeftIcon onClick={handleDrawerToggle} />
            </Typography>
          </>
        ) : (
          <Typography
            variant="body1"
            sx={{
              pt: 2,
              width: "100%",
              textAlign: "center",
              fontFamily: "Poppins",
              fontWeight: 800,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ChevronRightIcon onClick={handleDrawerToggle} />
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

          {drawerWidth === 70 ? (
            <>
              <HomeIcon
                onClick={() => handleMenuClick("Dashboard")}
                sx={{ fontSize: "30px", cursor: "pointer" }}
              />
              <Divider
                sx={{
                  my: 2,
                  width: "80%",
                  backgroundColor: "background.paper",
                }}
              />
              <RecommendIcon
                onClick={() => handleMenuClick("Recommend")}
                sx={{ fontSize: "30px", cursor: "pointer" }}
              />
              <Divider
                sx={{
                  my: 2,
                  width: "80%",
                  backgroundColor: "background.paper",
                }}
              />
              <TelegramIcon
                onClick={() => handleMenuClick("Chat")}
                sx={{ fontSize: "30px", cursor: "pointer" }}
              />
            </>
          ) : (
            <>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  fontFamily: "Poppins",
                  fontWeight: 600,
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  msUserSelect: "none",
                }}
                onClick={() => handleMenuClick("Dashboard")}
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
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  msUserSelect: "none",
                }}
                onClick={() => handleMenuClick("Recommend")}
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
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  msUserSelect: "none",
                }}
                onClick={() => handleMenuClick("Chat")}
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
    </MuiDrawer>
  );
};

export default Drawer;
