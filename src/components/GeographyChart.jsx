// Geography chart component for location-based analytics
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Bar,
  Doughnut,
  Line
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { geographyService } from '../services/geographyService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const GeographyChart = ({ 
  type = 'bar',
  title = 'Geographic Distribution',
  height = 400,
  showControls = true
}) => {
  const [chartType, setChartType] = useState(type);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch geographic data
  const fetchGeographicData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await geographyService.getStatistics();
      setData(response);
    } catch (err) {
      console.error('Fetch geographic data error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchGeographicData();
  }, []);

  // Get chart data based on type
  const getChartData = () => {
    if (!data) return null;

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: title,
        },
      },
    };

    switch (chartType) {
      case 'bar':
        return {
          type: 'bar',
          data: {
            labels: data.cities?.map(city => city.name) || [],
            datasets: [
              {
                label: 'Users',
                data: data.cities?.map(city => city.userCount) || [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
              {
                label: 'Trips',
                data: data.cities?.map(city => city.tripCount) || [],
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
              }
            ]
          },
          options: {
            ...commonOptions,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }
        };

      case 'doughnut':
        return {
          type: 'doughnut',
          data: {
            labels: data.regions?.map(region => region.name) || [],
            datasets: [
              {
                data: data.regions?.map(region => region.userCount) || [],
                backgroundColor: [
                  '#FF6384',
                  '#36A2EB',
                  '#FFCE56',
                  '#4BC0C0',
                  '#9966FF',
                  '#FF9F40'
                ],
                borderWidth: 2,
              }
            ]
          },
          options: {
            ...commonOptions,
            cutout: '50%',
          }
        };

      case 'line':
        return {
          type: 'line',
          data: {
            labels: data.monthlyTrends?.map(trend => trend.month) || [],
            datasets: [
              {
                label: 'User Growth',
                data: data.monthlyTrends?.map(trend => trend.userCount) || [],
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
                fill: true,
              },
              {
                label: 'Trip Growth',
                data: data.monthlyTrends?.map(trend => trend.tripCount) || [],
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.1)',
                tension: 0.4,
                fill: true,
              }
            ]
          },
          options: {
            ...commonOptions,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }
        };

      default:
        return null;
    }
  };

  const chartData = getChartData();

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" height={height}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            No geographic data available
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {showControls && (
          <Box mb={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                label="Chart Type"
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="doughnut">Doughnut Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        <Box height={height}>
          {chartData && (
            <>
              {chartType === 'bar' && <Bar {...chartData} />}
              {chartType === 'doughnut' && <Doughnut {...chartData} />}
              {chartType === 'line' && <Line {...chartData} />}
            </>
          )}
        </Box>

        {/* Additional statistics */}
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {data.totalUsers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="secondary">
                {data.totalTrips || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Trips
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {data.totalCities || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cities Covered
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {data.totalRegions || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Regions
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GeographyChart;
