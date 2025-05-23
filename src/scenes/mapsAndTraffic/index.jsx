import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  TrafficLayer,
} from "@react-google-maps/api";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 14.7006, lng: 120.9836 }; // Manila

const MapsAndTraffic = () => {
  const theme = useTheme();
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const REACT_LOCALHOST_IP = "https://ts-backend-1-jyit.onrender.com";

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const res = await fetch(`${REACT_LOCALHOST_IP}/api/maps/active-user-location`);
        const data = await res.json();
        setUserLocation({ lat: data.latitude, lng: data.longitude });
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };

    fetchUserLocation();
    const interval = setInterval(fetchUserLocation, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${REACT_LOCALHOST_IP}/api/reports`);
        const data = await res.json();
        setReports(data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setReports([]);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    if (map) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    }
  }, [map]);

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]}>
      <FlexBetween>
        <Header title="Maps & Traffic" />
      </FlexBetween>

      <Box
        mt="2rem"
        width="100%"
        height="100%"
        backgroundColor={theme.palette.background.alt}
        borderRadius="0.55rem"
        p="1.25rem 1rem"
        display="flex"
        flexDirection="column"
      >
        <Typography variant="h6" mb={1}>Live Traffic Map</Typography>

        <Paper
          elevation={3}
          sx={{ height: "800px", borderRadius: "0.55rem", overflow: "hidden" }}
        >
          <LoadScript googleMapsApiKey="AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "750px" }}
              center={userLocation || defaultCenter}
              zoom={14}
              onLoad={(map) => setMap(map)}
            >
              {reports.map((report) => (
                report.location?.latitude && report.location?.longitude && (
                  <Marker
                    key={report._id}
                    position={{
                      lat: report.location.latitude,
                      lng: report.location.longitude,
                    }}
                    onClick={() => setSelectedReport(report)}
                  />
                )
              ))}

              {selectedReport && (
                <InfoWindow
  position={{
    lat: selectedReport.location.latitude,
    lng: selectedReport.location.longitude,
  }}
  onCloseClick={() => setSelectedReport(null)}
>
  <Box>
    <Typography fontWeight="bold" variant="subtitle1" color="black" gutterBottom>
      {selectedReport.reportType}
    </Typography>

    <Typography variant="body2" gutterBottom color="black">
      {selectedReport.description || "No description provided."}
    </Typography>

    <Typography variant="caption" color="black" display="block" gutterBottom>
      {selectedReport.timestamp
        ? `Reported: ${new Date(selectedReport.timestamp).toLocaleString()}`
        : "Timestamp unknown"}
    </Typography>

    <Typography variant="caption" color="black">
      Submitted by: {selectedReport._id || "Unknown user"}
    </Typography>
  </Box>
</InfoWindow>

              )}

              <TrafficLayer />
            </GoogleMap>
          </LoadScript>
        </Paper>
      </Box>
    </Box>
  );
};

export default MapsAndTraffic;
