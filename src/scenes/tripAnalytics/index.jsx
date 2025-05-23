import axios from 'axios';

import React, { useEffect, useState } from 'react';

const TripAnalytics = () => {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await axios.get('https://ts-backend-1-jyit.onrender.com/api/trips');
        const tripData = response.data;
        setTrips(tripData);
        computeStats(tripData);
      } catch (error) {
        console.error('Error fetching trip data:', error);
      }
    };

    fetchTrips();
  }, []);

      const computeStats = (tripData) => {
      // Overall Stats
      const totalDistance = tripData.reduce((sum, trip) => sum + parseFloat(trip.distance || 0), 0);
      const totalTime = tripData.reduce((sum, trip) => sum + parseFloat(trip.timeArrived || 0), 0);
      const totalFuel = tripData.reduce((sum, trip) => sum + parseFloat(trip.fuelUsed || 0), 0);
      const totalTrips = tripData.length;

      setStats([
        { label: 'Total Distance Travelled', value: `${totalDistance.toFixed(2)} km` },
        { label: 'Total Time Traveled', value: `${totalTime.toFixed(2)} mins` },
        { label: 'Total Gas Consumption', value: `${totalFuel.toFixed(2)} L` },
        { label: 'Total Trips Recorded', value: totalTrips },
      ]);

      // Monthly Stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyTrips = tripData.filter((trip) => {
        const tripDate = new Date(trip.createdAt);
        return tripDate.getMonth() === currentMonth && tripDate.getFullYear() === currentYear;
      });

      const monthlyDistance = monthlyTrips.reduce((sum, trip) => sum + parseFloat(trip.distance || 0), 0);
      const monthlyTime = monthlyTrips.reduce((sum, trip) => sum + parseFloat(trip.timeArrived || 0), 0);
      const monthlyFuel = monthlyTrips.reduce((sum, trip) => sum + parseFloat(trip.fuelUsed || 0), 0);
      const monthlyTripsCount = monthlyTrips.length;

      // Placeholder values for demonstration
      const mostActiveUser = 'Marcus Aurelius';
      const averageSpeed = '35 km/h';
      const mostVisitedLocation = 'SM Valenzuela';
      const mostMotorUsed = 'Honda Click i125';

      setMonthlyStats([
        { label: 'Total Gas Expense', value: `₱ ${(monthlyFuel * 100).toFixed(2)}` }, // Assuming ₱100 per liter
        { label: 'Total Trips Finished', value: monthlyTripsCount },
        { label: 'Distance Traveled', value: `${monthlyDistance.toFixed(2)} km` },
        { label: 'Time Traveled', value: `${monthlyTime.toFixed(2)} mins` },
        { label: 'Most Active User', value: mostActiveUser },
        { label: 'Average Speed', value: averageSpeed },
        { label: 'Most Visited Location', value: mostVisitedLocation },
        { label: 'Most Motor Used', value: mostMotorUsed },
      ]);
    };

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]} minHeight="100vh">
      <FlexBetween>
        <Header title="Trip Analytics" textAlign="center" />
      </FlexBetween>

      {/* Overall Stats */}
      <Box
        mt="2rem"
        p="2rem"
        backgroundColor={theme.palette.background.alt}
        borderRadius="0.75rem"
      >
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
      <Box
        mt="3rem"
        p="2rem"
        backgroundColor={theme.palette.background.alt}
        borderRadius="0.75rem"
      >
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