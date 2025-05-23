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
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import FlexBetween from "./FlexBetween";
import Image from "assets/traffic-slight.png";

const navItems = [
  { section: "Navigation" },
  { text: "Overview", text2: "overview", icon: <Dashboard /> },
  { text: "Maps And Traffic", text2: "MapsAndTraffic", icon: <Map /> },
  { text: "Trips", text2: "TripAnalytics", icon: <Map /> },
  { section: "Admin" },
  { text: "User Management", text2: "UserManagement", icon: <People /> },
  { text: "Add Motor", text2: "addMotor", icon: <People /> },
  { section: "System" },
  { text: "Settings", text2: "Settings", icon: <SettingsOutlined /> },
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
                    src={Image}
                    height="100%"
                    width="100%"
                    borderRadius="5px"
                    sx={{
                      objectFit: "cover",
                      backgroundColor: theme.palette.primary[600],
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
                        navigate(`/${text2}`);
                        setActive(text2);
                      }}
                      sx={{
                        borderLeft: active === text2
                          ? `4px solid ${theme.palette.primary[600]}`
                          : "4px solid transparent",
                        backgroundColor:
                          active === text2
                            ? theme.palette.secondary[300]
                            : "transparent",
                        color:
                          active === text2
                            ? theme.palette.primary[600]
                            : theme.palette.secondary[100],
                        borderRadius: 0,
                        pl: "1rem",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          ml: "1rem",
                          color:
                            active === text2
                              ? theme.palette.primary[600]
                              : theme.palette.secondary[200],
                        }}
                      >
                        {icon}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                      {active === text2 && (
                        <ChevronRightOutlined sx={{ ml: "auto" }} />
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
