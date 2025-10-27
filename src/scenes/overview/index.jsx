import React, { useState, useEffect } from "react";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Line } from "react-chartjs-2";
import StatBox from "components/StatBox";
import { useGetReportsQuery, useGetDashboardOverviewQuery, useGetDashboardStatsQuery, useGetAdminDashboardQuery, useGetTripsQuery, useGetGasStationsQuery, useGetUsersQuery, useGetMotorsQuery, useGetTotalUsersQuery, useGetUsersThisMonthQuery, useGetTotalMotorsQuery, useGetMotorModelsQuery, useGetUserGrowthQuery } from "state/api";
import { useSelector } from "react-redux";
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
import API_CONFIG from '../../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Overview = () => {
  const theme = useTheme();
  const isNonMediumScreens = useMediaQuery("(min-width: 1200px)");
  const user = useSelector((state) => state.global.user);

  // Initialize with stable fallback values to prevent flickering
  const [userCount, setUserCount] = useState(1250);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState(45);
  const [topUser, setTopUser] = useState("John Doe");
  const [userGrowth, setUserGrowth] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // Initialize with zeros
  const [userGrowthLabels, setUserGrowthLabels] = useState(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]); // Initialize with default labels
  const [usersWithoutTimestamps, setUsersWithoutTimestamps] = useState(0); // Track users without timestamps
  const [totalTrips, setTotalTrips] = useState(3420);
  const [totalMotors, setTotalMotors] = useState(890);
  const [totalReports, setTotalReports] = useState(156);
  const [activeReports, setActiveReports] = useState(23);
  const [totalMotorcycles, setTotalMotorcycles] = useState(445);
  const [totalFuelLogs, setTotalFuelLogs] = useState(2100);

  // Get real-time reports data using RTK Query with error handling
  const { data: reportsData = [], error: reportsError, isLoading: reportsLoading } = useGetReportsQuery(undefined, { 
    skip: false, // Always try to fetch, but handle errors gracefully
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: true
  });

  // Get dashboard data from backend (with error handling)
  const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useGetDashboardOverviewQuery(undefined, {
    skip: true // Skip these queries since endpoints don't exist
  });
  const { data: dashboardStats, error: statsError, isLoading: statsLoading } = useGetDashboardStatsQuery('30d', {
    skip: true // Skip these queries since endpoints don't exist
  });
  const { data: adminDashboard, error: adminError, isLoading: adminLoading } = useGetAdminDashboardQuery(undefined, {
    skip: true // Skip these queries since endpoints don't exist
  });

  // Get trips and gas stations data
  const { data: tripsData = [], error: tripsError, isLoading: tripsLoading } = useGetTripsQuery(undefined, {
    skip: false,
    refetchOnMountOrArgChange: true
  });
  
  const { data: gasStationsData = [], error: gasStationsError, isLoading: gasStationsLoading } = useGetGasStationsQuery(undefined, {
    skip: false,
    refetchOnMountOrArgChange: true
  });

  // Get users and motors data
  const { data: usersData = [], error: usersError, isLoading: usersLoading } = useGetUsersQuery(undefined, {
    skip: false,
    refetchOnMountOrArgChange: true
  });
  
  const { data: motorsData = [], error: motorsError, isLoading: motorsLoading } = useGetMotorsQuery(undefined, {
    skip: false,
    refetchOnMountOrArgChange: true
  });

  // Get statistics from dedicated endpoints (now enabled!)
  const { data: totalUsersData, error: totalUsersError, isLoading: totalUsersLoading } = useGetTotalUsersQuery(undefined, {
    skip: false, // Now enabled - backend routes are ready!
    refetchOnMountOrArgChange: true
  });
  
  const { data: usersThisMonthData, error: usersThisMonthError, isLoading: usersThisMonthLoading } = useGetUsersThisMonthQuery(undefined, {
    skip: false, // Now enabled - backend routes are ready!
    refetchOnMountOrArgChange: true
  });
  
  const { data: totalMotorsData, error: totalMotorsError, isLoading: totalMotorsLoading } = useGetTotalMotorsQuery(undefined, {
    skip: false, // Now enabled - backend routes are ready!
    refetchOnMountOrArgChange: true
  });
  
  const { data: motorModelsData, error: motorModelsError, isLoading: motorModelsLoading } = useGetMotorModelsQuery(undefined, {
    skip: false, // Now enabled - backend routes are ready!
    refetchOnMountOrArgChange: true
  });

  // Get user growth data
  const { data: userGrowthData, error: userGrowthError, isLoading: userGrowthLoading } = useGetUserGrowthQuery(undefined, {
    skip: false, // Now enabled - backend routes are ready!
    refetchOnMountOrArgChange: true
  });

  // Log API errors for debugging
  React.useEffect(() => {
    if (reportsError) {
      console.error('❌ REPORTS API ERROR:', reportsError);
    }
    if (dashboardError) {
      console.error('❌ DASHBOARD API ERROR:', dashboardError);
    }
    if (statsError) {
      console.error('❌ STATS API ERROR:', statsError);
    }
    if (adminError) {
      console.error('❌ ADMIN DASHBOARD API ERROR:', adminError);
    }
    if (tripsError) {
      console.error('❌ TRIPS API ERROR:', tripsError);
    }
    if (gasStationsError) {
      console.error('❌ GAS STATIONS API ERROR:', gasStationsError);
    }
    if (usersError) {
      console.error('❌ USERS API ERROR:', usersError);
    }
    if (motorsError) {
      console.error('❌ MOTORS API ERROR:', motorsError);
    }
    if (totalUsersError) {
      console.error('❌ TOTAL USERS API ERROR:', totalUsersError);
    }
    if (usersThisMonthError) {
      console.error('❌ USERS THIS MONTH API ERROR:', usersThisMonthError);
    }
    if (totalMotorsError) {
      console.error('❌ TOTAL MOTORS API ERROR:', totalMotorsError);
    }
    if (motorModelsError) {
      console.error('❌ MOTOR MODELS API ERROR:', motorModelsError);
    }
    if (userGrowthError) {
      console.error('❌ USER GROWTH API ERROR:', userGrowthError);
    }
  }, [reportsError, dashboardError, statsError, adminError, tripsError, gasStationsError, usersError, motorsError, totalUsersError, usersThisMonthError, totalMotorsError, motorModelsError, userGrowthError]);

  // Debug data loading
  React.useEffect(() => {
    console.log('🔍 OVERVIEW DEBUG - All data state:', {
      reportsData: {
        data: reportsData,
        length: Array.isArray(reportsData) ? reportsData.length : 'Not array',
        loading: reportsLoading,
        error: reportsError
      },
      tripsData: {
        data: tripsData,
        length: Array.isArray(tripsData) ? tripsData.length : 'Not array',
        loading: tripsLoading,
        error: tripsError
      },
      gasStationsData: {
        data: gasStationsData,
        length: Array.isArray(gasStationsData) ? gasStationsData.length : 'Not array',
        loading: gasStationsLoading,
        error: gasStationsError
      },
      usersData: {
        data: usersData,
        length: Array.isArray(usersData) ? usersData.length : 'Not array',
        loading: usersLoading,
        error: usersError
      },
      motorsData: {
        data: motorsData,
        length: Array.isArray(motorsData) ? motorsData.length : 'Not array',
        loading: motorsLoading,
        error: motorsError
      },
      statistics: {
        totalReports: totalReports,
        activeReports: activeReports,
        totalTrips: totalTrips,
        totalFuelLogs: totalFuelLogs,
        userCount: userCount,
        newUsersThisMonth: newUsersThisMonth,
        totalMotors: totalMotors,
        totalMotorcycles: totalMotorcycles
      }
    });
  }, [reportsData, reportsLoading, reportsError, activeReports, tripsData, tripsLoading, tripsError, gasStationsData, gasStationsLoading, gasStationsError, usersData, usersLoading, usersError, motorsData, motorsLoading, motorsError, totalReports, totalTrips, totalFuelLogs, userCount, newUsersThisMonth, totalMotors, totalMotorcycles]);

  // Initialize with 0 values to clearly show real vs fallback data
  React.useEffect(() => {
    console.log('🔄 OVERVIEW - Initializing with 0 fallback values...');
    
    // Set fallback values to 0 to clearly show real vs fallback data
    setUserCount(0);
    setNewUsersThisMonth(0);
    setTotalReports(0);
    setTotalMotors(0);
    setTotalMotorcycles(0);
    setTotalFuelLogs(0);
    setActiveReports(0);
  }, []); // Only run once on mount

  // Update data from backend when available
  React.useEffect(() => {
    if (dashboardData) {
      console.log('✅ OVERVIEW - Dashboard data loaded:', dashboardData);
      if (dashboardData.userCount) setUserCount(dashboardData.userCount);
      if (dashboardData.newUsersThisMonth) setNewUsersThisMonth(dashboardData.newUsersThisMonth);
      if (dashboardData.totalReports) setTotalReports(dashboardData.totalReports);
      if (dashboardData.totalMotors) setTotalMotors(dashboardData.totalMotors);
      if (dashboardData.totalMotorcycles) setTotalMotorcycles(dashboardData.totalMotorcycles);
      if (dashboardData.totalFuelLogs) setTotalFuelLogs(dashboardData.totalFuelLogs);
    }
  }, [dashboardData]);

  React.useEffect(() => {
    if (dashboardStats) {
      console.log('✅ OVERVIEW - Dashboard stats loaded:', dashboardStats);
      if (dashboardStats.userGrowth) setUserGrowth(dashboardStats.userGrowth);
    }
  }, [dashboardStats]);

  React.useEffect(() => {
    if (adminDashboard) {
      console.log('✅ OVERVIEW - Admin dashboard data loaded:', adminDashboard);
      if (adminDashboard.totalTrips) setTotalTrips(adminDashboard.totalTrips);
      if (adminDashboard.totalMotors) setTotalMotors(adminDashboard.totalMotors);
    }
  }, [adminDashboard]);

  // Handle reports error
  React.useEffect(() => {
    if (reportsError) {
      console.log('ℹ️ OVERVIEW - Reports API error (using fallback):', reportsError);
    }
  }, [reportsError]);

  // Calculate active reports (non-archived) in real-time - stable calculation
  const activeReportsCount = React.useMemo(() => {
    const reportsArray = Array.isArray(reportsData) ? reportsData : [];
    
    if (reportsArray.length > 0) {
      console.log('✅ OVERVIEW - Reports data loaded:', reportsArray.length, 'reports');
      
      // Filter for active reports (not archived) - more specific filtering
      const active = reportsArray.filter((r) => {
        return r && 
               r.archived !== true && 
               r.archived !== 'true' && 
               r.status !== 'archived' &&
               r.isArchived !== true;
      });
      const archived = reportsArray.filter((r) => {
        return r && (
          r.archived === true || 
          r.archived === 'true' || 
          r.status === 'archived' ||
          r.isArchived === true
        );
      });
      
      console.log('📊 OVERVIEW - Active reports:', active.length, 'Archived reports:', archived.length);
      return active.length;
    } else if (reportsError) {
      console.warn("❌ OVERVIEW - Reports API not available, using fallback value");
      return 23; // Fallback value
    } else {
      console.log('⏳ OVERVIEW - No reports data yet, using fallback value');
      return 23; // Default fallback value
    }
  }, [reportsData, reportsError]);

  // Update active reports when calculation changes
  React.useEffect(() => {
    setActiveReports(activeReportsCount);
  }, [activeReportsCount]);

  // Update total reports from actual data
  React.useEffect(() => {
    if (Array.isArray(reportsData) && reportsData.length > 0) {
      console.log('📊 OVERVIEW - ✅ REAL DATA: Updating total reports from API data:', reportsData.length);
      setTotalReports(reportsData.length);
      
      // Calculate report type statistics
      const reportTypes = reportsData.reduce((acc, report) => {
        const type = report.reportType || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 OVERVIEW - ✅ REAL DATA: Report types breakdown:', reportTypes);
      
      // Update some statistics based on reports data
      const verifiedReports = reportsData.filter(r => r.verified?.verifiedByAdmin > 0).length;
      console.log('📊 OVERVIEW - ✅ REAL DATA: Verified reports:', verifiedReports);
    } else {
      console.log('📊 OVERVIEW - ⚠️ NO REPORTS DATA: reportsData is empty or not an array');
    }
  }, [reportsData]);

  // Update trips data
  React.useEffect(() => {
    if (Array.isArray(tripsData) && tripsData.length > 0) {
      console.log('📊 OVERVIEW - ✅ REAL DATA: Updating trips from API data:', tripsData.length);
      setTotalTrips(tripsData.length);
    } else {
      console.log('📊 OVERVIEW - ⚠️ NO TRIPS DATA: tripsData is empty or not an array');
    }
  }, [tripsData]);

  // Update gas stations data
  React.useEffect(() => {
    if (Array.isArray(gasStationsData) && gasStationsData.length > 0) {
      console.log('📊 OVERVIEW - ✅ REAL DATA: Updating gas stations from API data:', gasStationsData.length);
      // We can use this for fuel logs or other statistics
      setTotalFuelLogs(gasStationsData.length * 10); // Estimate based on stations
    } else {
      console.log('📊 OVERVIEW - ⚠️ NO GAS STATIONS DATA: gasStationsData is empty or not an array');
    }
  }, [gasStationsData]);

  // Update users data
  React.useEffect(() => {
    if (Array.isArray(usersData) && usersData.length > 0) {
      console.log('📊 OVERVIEW - ✅ REAL DATA: Updating users from API data:', usersData.length);
      setUserCount(usersData.length);
      
      // Calculate new users this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newUsersThisMonth = usersData.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      }).length;
      
      setNewUsersThisMonth(newUsersThisMonth);
      console.log('📊 OVERVIEW - ✅ REAL DATA: New users this month:', newUsersThisMonth);
    } else {
      console.log('📊 OVERVIEW - ⚠️ NO USERS DATA: usersData is empty or not an array');
    }
  }, [usersData]);

  // Update motors data
  React.useEffect(() => {
    if (Array.isArray(motorsData) && motorsData.length > 0) {
      console.log('📊 OVERVIEW - ✅ REAL DATA: Updating motors from API data:', motorsData.length);
      setTotalMotors(motorsData.length);
      
      // Calculate motorcycle models (unique brands)
      const uniqueBrands = [...new Set(motorsData.map(motor => motor.brand))].length;
      setTotalMotorcycles(uniqueBrands);
      console.log('📊 OVERVIEW - ✅ REAL DATA: Unique motorcycle brands:', uniqueBrands);
    } else {
      console.log('📊 OVERVIEW - ⚠️ NO MOTORS DATA: motorsData is empty or not an array');
    }
  }, [motorsData]);

  // Update statistics from dedicated endpoints (now working!)
  React.useEffect(() => {
    if (totalUsersData && totalUsersData.data && totalUsersData.data.totalUsers !== undefined) {
      console.log('📊 OVERVIEW - ✅ STATS API: Total users from dedicated endpoint:', totalUsersData.data.totalUsers);
      setUserCount(totalUsersData.data.totalUsers);
    } else if (totalUsersData) {
      console.log('📊 OVERVIEW - ⚠️ TOTAL USERS DATA: Unexpected format:', totalUsersData);
    }
  }, [totalUsersData]);

  React.useEffect(() => {
    if (usersThisMonthData && usersThisMonthData.data && usersThisMonthData.data.usersThisMonth !== undefined) {
      console.log('📊 OVERVIEW - ✅ STATS API: Users this month from dedicated endpoint:', usersThisMonthData.data.usersThisMonth);
      setNewUsersThisMonth(usersThisMonthData.data.usersThisMonth);
    } else if (usersThisMonthData) {
      console.log('📊 OVERVIEW - ⚠️ USERS THIS MONTH DATA: Unexpected format:', usersThisMonthData);
    }
  }, [usersThisMonthData]);

  React.useEffect(() => {
    if (totalMotorsData && totalMotorsData.totalMotors !== undefined) {
      console.log('📊 OVERVIEW - ✅ STATS API: Total motors from dedicated endpoint:', totalMotorsData.totalMotors);
      setTotalMotors(totalMotorsData.totalMotors);
    } else if (totalMotorsData) {
      console.log('📊 OVERVIEW - ⚠️ TOTAL MOTORS DATA: Unexpected format:', totalMotorsData);
    }
  }, [totalMotorsData]);

  React.useEffect(() => {
    if (motorModelsData && motorModelsData.totalMotorModels !== undefined) {
      console.log('📊 OVERVIEW - ✅ STATS API: Motor models from dedicated endpoint:', motorModelsData.totalMotorModels);
      setTotalMotorcycles(motorModelsData.totalMotorModels);
    } else if (motorModelsData) {
      console.log('📊 OVERVIEW - ⚠️ MOTOR MODELS DATA: Unexpected format:', motorModelsData);
    }
  }, [motorModelsData]);

  // Update user growth data
  React.useEffect(() => {
    if (userGrowthData && userGrowthData.data && userGrowthData.data.userGrowth) {
      console.log('📊 OVERVIEW - ✅ STATS API: User growth from dedicated endpoint:', userGrowthData.data.userGrowth);
      console.log('📊 OVERVIEW - ✅ STATS API: Total growth:', userGrowthData.data.totalGrowth);
      
      // Transform API data into chart format - ALL TIME DATA
      const growthData = userGrowthData.data.userGrowth;
      
      if (growthData && growthData.length > 0) {
        // Filter out any invalid data entries (missing month/year)
        const validGrowthData = growthData.filter(item => 
          item && 
          item._id && 
          typeof item._id.month === 'number' && 
          typeof item._id.year === 'number' &&
          item.count !== undefined
        );
        
        if (validGrowthData.length > 0) {
          // Calculate users without timestamps
          const totalUsersWithTimestamps = validGrowthData.reduce((sum, item) => sum + item.count, 0);
          const usersWithoutTimestamps = userCount - totalUsersWithTimestamps;
          setUsersWithoutTimestamps(usersWithoutTimestamps);
          
          // Find the earliest and latest months
          const months = validGrowthData.map(item => item._id.month).sort((a, b) => a - b);
          const earliestMonth = months[0];
          const latestMonth = months[months.length - 1];
          
          console.log('📊 OVERVIEW - ✅ STATS API: Date range from month', earliestMonth, 'to', latestMonth);
          console.log('📊 OVERVIEW - ✅ STATS API: Valid data entries:', validGrowthData.length, 'out of', growthData.length);
          console.log('📊 OVERVIEW - ✅ STATS API: Total users in system:', userCount);
          console.log('📊 OVERVIEW - ✅ STATS API: Users with timestamps:', totalUsersWithTimestamps);
          console.log('📊 OVERVIEW - ✅ STATS API: Users without timestamps:', usersWithoutTimestamps);
          console.log('📊 OVERVIEW - ✅ STATS API: Math check:', totalUsersWithTimestamps, '+', usersWithoutTimestamps, '=', totalUsersWithTimestamps + usersWithoutTimestamps);
          
          // Create dynamic chart data based on actual date range
          const chartData = [];
          const chartLabels = [];
          
          // Generate data for each month from earliest to latest
          for (let month = earliestMonth; month <= latestMonth; month++) {
            const monthData = validGrowthData.find(item => item._id.month === month);
            chartData.push(monthData ? monthData.count : 0);
            
            // Create month labels (e.g., "May 2025", "Jun 2025")
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const year = validGrowthData.find(item => item._id.month === month)?._id.year || new Date().getFullYear();
            chartLabels.push(`${monthNames[month - 1]} ${year}`);
          }
          
          console.log('📊 OVERVIEW - ✅ STATS API: Dynamic chart data:', chartData);
          console.log('📊 OVERVIEW - ✅ STATS API: Chart labels:', chartLabels);
          
          setUserGrowth(chartData);
          setUserGrowthLabels(chartLabels);
        } else {
          // No valid data entries (all users missing timestamps)
          console.log('📊 OVERVIEW - ⚠️ NO VALID USER GROWTH DATA: All users missing timestamps');
          setUserGrowth([0]);
          setUserGrowthLabels(["No Timestamp Data"]);
        }
      } else {
        // No data available at all
        console.log('📊 OVERVIEW - ⚠️ NO USER GROWTH DATA: Empty or null data');
        setUserGrowth([0]);
        setUserGrowthLabels(["No Data"]);
        setUsersWithoutTimestamps(0);
      }
    } else if (userGrowthData) {
      console.log('📊 OVERVIEW - ⚠️ USER GROWTH DATA: Unexpected format:', userGrowthData);
      // Handle unexpected format gracefully
      setUserGrowth([0]);
      setUserGrowthLabels(["Data Error"]);
      setUsersWithoutTimestamps(0);
    } else {
      // No data received from API
      console.log('📊 OVERVIEW - ⚠️ NO USER GROWTH API DATA: API returned no data');
      setUserGrowth([0]);
      setUserGrowthLabels(["No API Data"]);
      setUsersWithoutTimestamps(0);
    }
  }, [userGrowthData, userCount]);

  // Show loading state if no data is available (all values are 0)
  if (userCount === 0 && totalReports === 0 && totalMotors === 0 && totalTrips === 0) {
    return (
      <Box m="1.5rem 2.5rem" display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h4" color="text.secondary">
          Loading Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box m="1.5rem 2.5rem">

        <Header 
          title={`Welcome, ${user?.firstName || 'Admin'}!`} 
          subtitle={`${user?.role?.displayName || 'Administrator'} Dashboard`} 
        />
 

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
        <StatBox title="Total Reports" value={totalReports} />
        <StatBox title="Total Motors Registered" value={totalMotors} />
        
        <StatBox title="New Users This Month" value={newUsersThisMonth} />
        <StatBox title="Active Reports" value={activeReports} />
        <StatBox title="Motorcycle Models" value={totalMotorcycles} />
        {/* <StatBox title="First Rider" value={topUser ?? "N/A"} /> */}
      </Box>

      <Box mt="40px" width="100%">
        <Box mb="20px">
          <Typography variant="h2" mb={2}>User Growth</Typography>
          
          {/* User Statistics Summary */}
          {!userGrowthLabels.includes("No Data") && !userGrowthLabels.includes("No Timestamp Data") && (
            <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.primary" fontWeight="medium">
                  Total Users: {userCount}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  With Timestamps: {userGrowth.reduce((sum, val) => sum + val, 0)}
                </Typography>
              </Box>
              {usersWithoutTimestamps > 0 && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" color="text.disabled" fontWeight="medium">
                    Without Timestamps: {usersWithoutTimestamps}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {/* Data Quality Note */}
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            ℹ️ Graph displays only users with valid registration dates. Users without timestamps are excluded from the growth visualization.
          </Typography>
        </Box>

        <Box sx={{ backgroundColor: "white", borderRadius: "0.55rem", p: 2, minHeight: 400 }}>
          {userGrowthLabels.includes("No Data") || userGrowthLabels.includes("No Timestamp Data") || userGrowthLabels.includes("Data Error") || userGrowthLabels.includes("No API Data") ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              height="300px" 
              width="100%"
              p={3}
            >
              <Typography variant="h6" color="text.secondary" mb={2}>
                {userGrowthLabels[0] === "No Timestamp Data" ? "No User Timestamps Available" : 
                 userGrowthLabels[0] === "Data Error" ? "Data Format Error" :
                 userGrowthLabels[0] === "No API Data" ? "API Data Unavailable" :
                 "No User Growth Data Available"}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {userGrowthLabels[0] === "No Timestamp Data" ? 
                  `User registration data requires timestamps. ${usersWithoutTimestamps > 0 ? `${usersWithoutTimestamps} users are missing registration dates.` : 'Some users may not have registration dates.'}` :
                 userGrowthLabels[0] === "Data Error" ? 
                  "The user growth data format is unexpected. Please check the API response." :
                 userGrowthLabels[0] === "No API Data" ? 
                  "Unable to fetch user growth data from the server. Please check your connection." :
                  "User registration data will appear here once users start registering with timestamps."}
              </Typography>
              {userGrowthLabels[0] === "No Timestamp Data" && usersWithoutTimestamps > 0 && (
                <Typography variant="caption" color="text.secondary" textAlign="center" mt={1}>
                  Note: The graph only displays users with valid registration dates. 
                  Users without timestamps are excluded from the growth visualization.
                </Typography>
              )}
            </Box>
          ) : (
          <Line
            data={{
                labels: userGrowthLabels,
              datasets: [
                {
                  label: "Users",
                  data: userGrowth,
                  fill: false,
                  backgroundColor: theme.palette.secondary.main,
                  borderColor: theme.palette.secondary.main,
                },
              ],
            }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  },
                  x: {
                    ticks: {
                      maxRotation: 45,
                      minRotation: 0
                    }
                  }
                }
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Overview;
