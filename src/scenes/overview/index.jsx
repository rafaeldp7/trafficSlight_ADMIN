import React, { useState, useEffect } from "react";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";
import { Box, Typography, useMediaQuery } from "@mui/material";
import { Line } from "react-chartjs-2";
import StatBox from "components/StatBox";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);



const REACT_LOCALHOST_IP = "https://ts-backend-1-jyit.onrender.com";

const Overview = () => {
  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");

  const [userCount, setUserCount] = useState(0);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState(0);
  const [topUser, setTopUser] = useState(null);
  const [userGrowth, setUserGrowth] = useState(Array(12).fill(0));
  const [totalTrips, setTotalTrips] = useState(0);
  const [totalMotors, setTotalMotors] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [totalMotorcycles, setTotalMotorcycles] = useState(0);
  const [totalFuelLogs, setTotalFuelLogs] = useState(0);

  useEffect(() => {
    const fetchCount = async (endpoint, setter, field = "count") => {
      try {
        const res = await fetch(`${REACT_LOCALHOST_IP}${endpoint}`);
        const data = await res.json();
        setter(data[field] ?? 0);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    fetchCount("/api/auth/user-count", setUserCount, "count");
    fetchCount("/api/auth/new-users-this-month", setNewUsersThisMonth, "count");
    fetchCount("/api/auth/first-user-name", setTopUser, "name");

    fetchCount("/api/trips/count", setTotalTrips, "totalTrips");
    fetchCount("/api/user-motorRoutes/count/all", setTotalMotors, "totalUserMotors");
    fetchCount("/api/reports/count", setTotalReports, "totalReports");
    fetchCount("/api/motorcycles/count", setTotalMotorcycles, "totalMotorcycles");
    fetchCount("/api/fuel-logs/count", setTotalFuelLogs, "totalFuelLogs");

    // User growth chart data
    fetch(`${REACT_LOCALHOST_IP}/api/auth/user-growth`)
      .then((res) => res.json())
      .then((data) => setUserGrowth(data.monthlyData))
      .catch((err) => console.error("Error fetching user growth:", err));
  }, []);

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Welcome, Admin!!" subtitle="" />
      </FlexBetween>

      <Box
        mt="20px"
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="160px"
        gap="20px"
        sx={{
          "& > div": { gridColumn: isNonMediumScreens ? undefined : "span 12" },
        }}
      >
        <StatBox title="Total Users" value={userCount} />
        <StatBox title="Total Motors Registered" value={totalMotors} />
        <StatBox title="Total Trips" value={totalTrips} />
        <StatBox title="Fuel Logs Recorded" value={totalFuelLogs} />
        <StatBox title="New Users This Month" value={newUsersThisMonth} />
        <StatBox title="Reports Submitted" value={totalReports} />
        <StatBox title="Motorcycle Models" value={totalMotorcycles} />
        <StatBox title="First Rider" value={topUser ?? "N/A"} />
      </Box>

      <Box mt="40px" height="100%" width="100%" alignItems="center" justifyContent="center">
        <FlexBetween>
          <Typography variant="h2">User Growth</Typography>
        </FlexBetween>

        <FlexBetween mt="20px" sx={{ backgroundColor: "white", borderRadius: "0.55rem" }}>
          <Line
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              datasets: [
                {
                  label: "Users",
                  data: userGrowth,
                  fill: false,
                  backgroundColor: "#00ADB5",
                  borderColor: "#00ADB5",
                },
              ],
            }}
          />
        </FlexBetween>
      </Box>
    </Box>
  );
};

export default Overview;
