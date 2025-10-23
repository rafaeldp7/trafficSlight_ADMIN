import React, { useEffect, useState } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
  Refresh,
} from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { api } from "state/api";
//import profileImage from "assets/traffic-slight-logo-with-bg.png";
import {
  AppBar,
  Button,
  Box,
  Typography,
  IconButton,
  InputBase,
  Toolbar,
  Menu,
  MenuItem,
  useTheme,
  Chip,
  Tooltip,
  Fade,
  Avatar,
} from "@mui/material";

const Navbar = ({ user, isSidebarOpen, setIsSidebarOpen }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const currentUser = useSelector((state) => state.global.user);

  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(setLogout());
    handleClose();
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    // Invalidate all tags to trigger refresh across the app
    dispatch(api.util.invalidateTags([
      { type: "User" },
      { type: "Products" },
      { type: "Customers" },
      { type: "Transactions" },
      { type: "Geography" },
      { type: "Sales" },
      { type: "Admins" },
      { type: "Performance" },
      { type: "Dashboard" },
      { type: "Reports" },
    ]));
  };

  // Auto-refresh indicator countdown (10s)
  const intervalMs = 10000;
  const [remainingMs, setRemainingMs] = useState(intervalMs);
  useEffect(() => {
    const id = setInterval(() => {
      setRemainingMs((prev) => (prev <= 1000 ? intervalMs : prev - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return (
    <AppBar
      sx={{
        position: "static",
        background: "none",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* LEFT SIDE */}
        <FlexBetween>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon />
          </IconButton>
          {/* <FlexBetween
            backgroundColor={theme.palette.background.alt}
            borderRadius="9px"
            gap="3rem"
            p="0.1rem 1.5rem"
          >
            <InputBase placeholder="Search..." />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween> */}
        </FlexBetween>

        {/* RIGHT SIDE */}
        <FlexBetween gap="1.5rem">
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title="Data auto-refreshes every 10 seconds">
              <Fade in timeout={300}>
                <Chip
                  label={`Refresh in ${remainingSeconds}s`}
                  color="secondary"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.secondary.light,
                    color: theme.palette.secondary.contrastText,
                  }}
                />
              </Fade>
            </Tooltip>
            <Tooltip title="Refresh data now">
              <IconButton
                onClick={handleManualRefresh}
                size="small"
                sx={{
                  color: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? theme.palette.secondary.dark 
                      : theme.palette.secondary.light,
                  },
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlined sx={{ fontSize: "25px" }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: "25px" }} />
            )}
          </IconButton>

          {/* User Profile & Logout */}
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: theme.palette.secondary.main,
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {currentUser?.name?.charAt(0) || "A"}
            </Avatar>
            <Button
              onClick={handleClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textTransform: "none",
                color: theme.palette.text.primary,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <Typography variant="body2" fontWeight="medium">
                {currentUser?.name || "Admin"}
              </Typography>
              <ArrowDropDownOutlined sx={{ fontSize: "16px" }} />
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={isOpen}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleClose}>
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography variant="body2" color="error">
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
          {/* <IconButton>
            <SettingsOutlined sx={{ fontSize: "25px" }} />
          </IconButton> */}

          {/* <FlexBetween>
            <Button
              onClick={handleClick}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textTransform: "none",
                gap: "1rem",
              }}
            >
              <Box
                component="img"
                alt="profile"
                src={profileImage}
                height="32px"
                width="32px"
                borderRadius="50%"
                sx={{ objectFit: "cover" }}
              />
              <Box textAlign="left">
                <Typography
                  fontWeight="bold"
                  fontSize="0.85rem"
                  sx={{ color: theme.palette.secondary[100] }}
                >
                  {user.name}
                </Typography>
                <Typography
                  fontSize="0.75rem"
                  sx={{ color: theme.palette.secondary[200] }}
                >
                  {user.occupation}
                </Typography>
              </Box>
              <ArrowDropDownOutlined
                sx={{ color: theme.palette.secondary[300], fontSize: "25px" }}
              />
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={isOpen}
              onClose={handleClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <MenuItem onClick={handleClose}>Log Out</MenuItem>
            </Menu>
          </FlexBetween> */}
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;