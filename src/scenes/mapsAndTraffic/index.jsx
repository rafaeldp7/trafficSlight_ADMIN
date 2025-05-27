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
  const [stations, setStations] = useState([]);
  


  const REACT_LOCALHOST_IP = "https://ts-backend-1-jyit.onrender.com";

useEffect(() => {
  const fetchStations = async () => {
    try {
      const res = await fetch(`${REACT_LOCALHOST_IP}/api/gas-stations`);
      const data = await res.json();
      setStations(data);
    } catch (error) {
      console.error("Error fetching gas stations:", error);
    }
  };

  fetchStations();
}, []);


  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const res = await fetch(
          `${REACT_LOCALHOST_IP}/api/maps/active-user-location`
        );
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
        <Typography variant="h6" mb={1}>
          Live Traffic Map
        </Typography>

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
              {reports.map(
                (report) =>
                  report.location?.latitude &&
                  report.location?.longitude && (
                    <Marker
                      key={report._id}
                      position={{
                        lat: report.location.latitude,
                        lng: report.location.longitude,
                      }}
                      onClick={() => setSelectedReport(report)}
                    />
                  )
              )}

              {stations.map((station) => (
                station.location?.coordinates && (
                  <Marker
                    key={station._id}
                    position={{
                      lat: station.location.coordinates[1], // latitude
                      lng: station.location.coordinates[0], // longitude
                    }}
                    icon={{
                      url: "https://maps.google.com/mapfiles/ms/icons/gas.png",
                      scaledSize: new window.google.maps.Size(32, 32),
                    }}
                    onClick={() => setSelectedReport({
                      ...station,
                      isGasStation: true
                    })}
                  />
                )
              ))}


              {selectedReport && (
  <InfoWindow
    position={{
      lat: selectedReport.location?.latitude || selectedReport.location?.coordinates[1],
      lng: selectedReport.location?.longitude || selectedReport.location?.coordinates[0],
    }}
    onCloseClick={() => setSelectedReport(null)}
  >
    <Box>
      {selectedReport.isGasStation ? (
  <>
    <Typography fontWeight="bold" variant="subtitle1" color="black" gutterBottom>
      {selectedReport.name} ({selectedReport.brand})
    </Typography>
    <Typography variant="body2" color="black" gutterBottom>
      Gasoline: ₱{selectedReport.fuelPrices?.gasoline ?? "N/A"}<br />
      Diesel: ₱{selectedReport.fuelPrices?.diesel ?? "N/A"}<br />
      Premium: ₱{selectedReport.fuelPrices?.premium ?? "N/A"}
    </Typography>
    <Typography variant="caption" color="black" gutterBottom display="block">
      {selectedReport.address?.street}, {selectedReport.address?.barangay}, {selectedReport.address?.city}
    </Typography>
    <button
      style={{ marginTop: "0.5rem", background: "#1976d2", color: "white", border: "none", padding: "5px 10px", cursor: "pointer", borderRadius: "4px" }}
      onClick={() => {
        // redirect to your edit page (e.g., admin/stations/edit/:id)
        window.location.href = `/admin/stations/edit/${selectedReport._id}`;
      }}
    >
      Edit Station
    </button>
  </>
) : (
        <>
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
        </>
      )}
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
