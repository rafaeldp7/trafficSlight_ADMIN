import React, { useEffect, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRightOutlined,
  SettingsOutlined,
  Dashboard,
  People,
  BarChart,
  Map,
  TwoWheeler,
  LocalGasStation,
  Traffic,
  Report,
  AdminPanelSettings,
  History,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import FlexBetween from "./FlexBetween";


const navItems = [
  // { section: "Navigation" },
  { text: "Overview", text2: "overview", icon: <Dashboard /> },
  // { text: "Map", text2: "MapsAndTraffic", icon: <Map /> },
  { text: "Traffic Reports", text2: "Reports", icon: <Traffic /> },
  { text: "Trips", text2: "TripAnalytics", icon: <Map /> },
  // { section: "Admin" },
  { text: "User Management", text2: "UserManagement", icon: <People /> },
  { text: "Motor Management", text2: "addMotor", icon: <TwoWheeler /> },
  // { text: "User Motor", text2: "userMotor", icon: <People /> },
  
  { text: "Gas Stations", text2: "gasStations", icon: <LocalGasStation /> },

  // { section: "System Administration" },
  // { text: "Admin Dashboard", text2: "adminDashboard", icon: <DashboardIcon /> }, // Hidden as requested
  { text: "Admin Management", text2: "adminManagement", icon: <AdminPanelSettings /> },
  { text: "Admin Logs", text2: "adminLogs", icon: <History /> },

  // {text: "Log Out", icon: <SettingsOutlined /> },

  // { section: "System" },
  // { text: "Settings", text2: "Settings", icon: <SettingsOutlined /> },
];

const Sidebar = ({
  user,
  drawerWidth,
  isSidebarOpen,
  setIsSidebarOpen,
  isNonMobile,
}) => {
  const { pathname } = useLocation();
  const [active, setActive] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    setActive(pathname.substring(1));
  }, [pathname]);

  return (
    <Box component="nav">
      {isSidebarOpen && (
        <Drawer
          open={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          variant="persistent"
          anchor="left"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              color: theme.palette.secondary[200],
              backgroundColor: theme.palette.background.alt,
              boxSizing: "border-box",
              borderWidth: isNonMobile ? 0 : "2px",
              width: drawerWidth,
            },
          }}
        >
          <Box width="100%">
            {/* Logo Section */}
            <Box m="1.5rem 2rem 2rem 3rem">
              <FlexBetween color={theme.palette.secondary.main}>
                <Box display="flex" alignItems="center" gap="0.5rem">
                  <Box
                    component="img"
                    alt="logo"
                    src={theme.palette.mode === "dark" 
                      ? "/assets/logo_trafficSlight_dark.png"
                      : "/assets/logo_trafficSlight.png"
                    }
                    height="50%"
                    width="100%"
                    borderRadius="5px"
                    sx={{
                      objectFit: "cover",
                    }}
                  />
                </Box>
                {!isNonMobile && (
                  <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    <ChevronLeft />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>

            {/* Navigation Items */}
            <List>
              {navItems.map(({ section, text, text2, icon }) => {
                if (section) {
                  return (
                    <Typography
                      key={section}
                      sx={{
                        m: "2rem 0 1rem 2.5rem",
                        fontSize: "0.85rem",
                        color: theme.palette.secondary[300],
                      }}
                    >
                      {section}
                    </Typography>
                  );
                }

                return (
                  <ListItem key={text2} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate(text2);
                        setActive(text2);
                      }}
                      sx={{
                        borderLeft: active === text2
                          ? `4px solid ${theme.palette.primary[600]}`
                          : "4px solid transparent",
                        backgroundColor:
                          active === text2
                            ? (theme.palette.mode === "dark"
                                ? theme.palette.primary[600]
                                : theme.palette.secondary[100])
                            : "transparent",
                        color:
                          active === text2
                            ? (theme.palette.mode === "dark"
                                ? theme.palette.secondary.contrastText
                                : theme.palette.primary[900])
                            : theme.palette.text.primary,
                        borderRadius: 0,
                        pl: "1rem",
                        transition: "all 0.2s",
                        "&:hover": {
                          backgroundColor: active === text2
                            ? (theme.palette.mode === "dark"
                                ? theme.palette.primary[500]
                                : theme.palette.secondary[200])
                            : (theme.palette.mode === "dark"
                                ? theme.palette.primary[500]
                                : theme.palette.grey[50]),
                          borderLeft: `4px solid ${
                            active === text2
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[600]
                          }`,
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "1rem",
                          color:
                            active === text2
                              ? (theme.palette.mode === "dark"
                                  ? theme.palette.secondary.contrastText
                                  : theme.palette.primary[900])
                              : theme.palette.text.secondary,
                          transition: "color 0.2s",
                          ".MuiListItemButton-root:hover &": {
                            color:
                              active === text2
                                ? (theme.palette.mode === "dark"
                                    ? theme.palette.secondary.contrastText
                                    : theme.palette.primary[900])
                                : (theme.palette.mode === "dark"
                                    ? theme.palette.text.primary
                                    : theme.palette.secondary[600])
                          }
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={text}
                        sx={{
                          "& .MuiListItemText-primary": {
                            transition: "color 0.2s",
                          },
                          ".MuiListItemButton-root:hover &": {
                            color:
                              active === text2
                                ? (theme.palette.mode === "dark"
                                    ? theme.palette.secondary.contrastText
                                    : theme.palette.primary[900])
                                : (theme.palette.mode === "dark"
                                    ? theme.palette.text.primary
                                    : theme.palette.secondary[600])
                          }
                        }}
                      />
                      {active === text2 && (
                        <ChevronRightOutlined 
                          sx={{ 
                            ml: "auto",
                            color: theme.palette.mode === "dark"
                              ? theme.palette.secondary.contrastText
                              : theme.palette.primary[900],
                            transition: "color 0.2s"
                          }} 
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar;
