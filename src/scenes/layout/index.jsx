import React, { useEffect, useMemo, useState } from "react";
import { Box, Chip, Fade, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "components/Navbar";
import Sidebar from "components/Sidebar";

const Layout = () => {
  const isNonMobile = useMediaQuery("(min-width: 600px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const user = useSelector((state) => state.global.user);
  const theme = useTheme();

  // Auto-refresh indicator (matches 10s interval defined globally)
  const intervalMs = 10000;
  const [remainingMs, setRemainingMs] = useState(intervalMs);

  useEffect(() => {
    const tick = () => setRemainingMs((prev) => (prev <= 1000 ? intervalMs : prev - 1000));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return (
    <Box display={isNonMobile ? "flex" : "block"} width="100%" height="100%">
      <Sidebar
        user={user || {}}
        isNonMobile={isNonMobile}
        drawerWidth="250px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Box flexGrow={1}>
        <Navbar
          user={user || {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        {/* Indicator now moved to Navbar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;