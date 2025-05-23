import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import Header from 'components/Header';
import FlexBetween from 'components/FlexBetween';

const TripAnalytics = () => {
  const [stats, setStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    fetchOverallStats();
    fetchMonthlyStats();
    fetchTopUsers();
    fetchTopMotors();
  }, []);

  const fetchOverallStats = async () => {
    try {
      const res = await axios.get('https://ts-backend-1-jyit.onrender.com/api/trips/analytics');
      const data = res.data;

      setStats([
        { label: 'Total Distance Travelled', value: `${data.totalDistance.toFixed(2)} km` },
        { label: 'Total Time Traveled', value: `${data.totalTime.toFixed(2)} mins` },
        { label: 'Total Gas Consumption', value: `${data.totalFuel.toFixed(2)} L` },
        { label: 'Total Trips Recorded', value: data.totalTrips },
        { label: 'Total Gas Expense', value: `₱ ${data.totalExpense.toFixed(2)}` },
      ]);
    } catch (error) {
      console.error('Error fetching overall stats:', error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const res = await axios.get('https://ts-backend-1-jyit.onrender.com/api/trips/summary/month');
      const data = res.data;

      setMonthlyStats([
        { label: 'Total Trips Finished', value: data.tripsThisMonth },
        { label: 'Distance Traveled', value: `${data.monthlyDistance.toFixed(2)} km` },
        { label: 'Time Traveled', value: `${data.monthlyTime.toFixed(2)} mins` },
        { label: 'Total Gas Consumption', value: `${data.monthlyFuel.toFixed(2)} L` },
        { label: 'Monthly Gas Expense', value: `₱ ${data.monthlyExpense.toFixed(2)}` },
      ]);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const res = await axios.get('https://ts-backend-1-jyit.onrender.com/api/trips/leaderboard');
      const top = res.data[0];
      if (top) {
        setMonthlyStats((prev) => [...prev, { label: 'Most Active User', value: top._id || 'Unknown' }]);
      }
    } catch (error) {
      console.error('Error fetching top users:', error);
    }
  };

  const fetchTopMotors = async () => {
    try {
      const res = await axios.get('https://ts-backend-1-jyit.onrender.com/api/trips/motors/most-used');
      const topMotor = res.data[0];
      if (topMotor) {
        setMonthlyStats((prev) => [...prev, { label: 'Most Used Motor ID', value: topMotor._id || 'Unknown' }]);
      }
    } catch (error) {
      console.error('Error fetching top motors:', error);
    }
  };

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]} minHeight="100vh">
      <FlexBetween>
        <Header title="Trip Analytics" textAlign="center" />
      </FlexBetween>

      {/* Overall Stats */}
      <Box mt="2rem" p="2rem" backgroundColor={theme.palette.background.alt} borderRadius="0.75rem">
        <Typography variant="h6" mb={3} color="textPrimary">
          OVERALL STATS
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={4}
                sx={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: theme.palette.background.default,
                  borderRadius: '0.75rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: `0 4px 20px ${theme.palette.secondary[300]}`,
                  },
                }}
              >
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.secondary[500]}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Monthly Breakdown */}
      <Box mt="3rem" p="2rem" backgroundColor={theme.palette.background.alt} borderRadius="0.75rem">
        <Typography variant="h6" mb={3} color="textPrimary">
          THIS MONTH
        </Typography>
        <Grid container spacing={3}>
          {monthlyStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={4}
                sx={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: theme.palette.background.default,
                  borderRadius: '0.75rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: `0 4px 20px ${theme.palette.secondary[300]}`,
                  },
                }}
              >
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={theme.palette.secondary[500]}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default TripAnalytics;
