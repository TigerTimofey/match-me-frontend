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

const Drawer = ({ userData, onSelectMenu, activeMenu }) => {
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

  const getMenuItemStyle = (menu) => ({
    backgroundColor: activeMenu === menu ? "#ffffff" : "inherit",
    color: activeMenu === menu ? "#000000" : "#b2b2b2",
    borderRadius: "8px",
    padding: "8px 16px",
    transition: "background-color 0.3s, color 0.3s",
    cursor: "pointer",
  });

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
          <Typography
            variant="body1"
            sx={{
              pt: 2,
              width: "100%",
              textAlign: "center",
              fontFamily: "Poppins",
              fontWeight: 600,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            Welcome Back, {userData?.name} 👋
            <ChevronLeftIcon onClick={handleDrawerToggle} />
          </Typography>
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
            {drawerWidth === 70 ? (
              <ChevronRightIcon onClick={handleDrawerToggle} />
            ) : (
              <ChevronLeftIcon onClick={handleDrawerToggle} />
            )}
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
            pointer: "cursor",
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
                sx={getMenuItemStyle("Dashboard")}
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
                sx={getMenuItemStyle("Recommend")}
              />
              <Divider
                sx={{
                  my: 2,
                  width: "80%",
                  backgroundColor: "background.paper",
                }}
              />
              <TelegramIcon
                onClick={() => handleMenuClick("Connections")}
                sx={getMenuItemStyle("Connections")}
              />
            </>
          ) : (
            <>
              <Typography
                variant="body1"
                sx={getMenuItemStyle("Dashboard")}
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
                sx={getMenuItemStyle("Recommend")}
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
                sx={getMenuItemStyle("Connections")}
                onClick={() => handleMenuClick("Connections")}
              >
                Connections
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
