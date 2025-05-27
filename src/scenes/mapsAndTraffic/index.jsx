import React, { useEffect, useState, useMemo } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  TrafficLayer,
} from "@react-google-maps/api";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

const defaultCenter = { lat: 14.7006, lng: 120.9836 }; // Manila
const containerStyle = {
  width: "100%",
  height: "750px",
};

const MapsAndTraffic = () => {
  const theme = useTheme();
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [stations, setStations] = useState([]);

  const REACT_LOCALHOST_IP = "https://ts-backend-1-jyit.onrender.com";

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4",
  });

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch(`${REACT_LOCALHOST_IP}/api/gas-stations`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setStations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching gas stations:", error);
        setStations([]);
      }
    };

    fetchStations();
  }, []);

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const res = await fetch(`${REACT_LOCALHOST_IP}/api/maps/active-user-location`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUserLocation({ lat: data.latitude, lng: data.longitude });
      } catch (error) {
        console.error("Error fetching user location:", error);
        setUserLocation(null);
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setReports([]);
      }
    };

    fetchReports();
  }, []);

  useEffect(() => {
    if (map && window.google) {
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);
    }
  }, [map]);

  const gasIcon = useMemo(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google) return null;
    return {
      url: "https://maps.google.com/mapfiles/ms/icons/gas.png",
      scaledSize: new window.google.maps.Size(32, 32),
    };
  }, [isLoaded]);

  if (!isLoaded) return <Typography>Loading Map...</Typography>;

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

        <Paper elevation={3} sx={{ height: "800px", borderRadius: "0.55rem", overflow: "hidden" }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation || defaultCenter}
            zoom={14}
            onLoad={(map) => setMap(map)}
          >
            {/* Traffic Reports */}
            {Array.isArray(reports) &&
              reports.map((report) =>
                report.location?.latitude && report.location?.longitude ? (
                  <Marker
                    key={report._id}
                    position={{
                      lat: report.location.latitude,
                      lng: report.location.longitude,
                    }}
                    onClick={() => setSelectedReport(report)}
                  />
                ) : null
              )}

            {/* Gas Stations */}
            {Array.isArray(stations) &&
              stations.map((station) =>
                station.location?.coordinates ? (
                  <Marker
                    key={station._id}
                    position={{
                      lat: station.location.coordinates[1],
                      lng: station.location.coordinates[0],
                    }}
                    icon={gasIcon}
                    onClick={() =>
                      setSelectedReport({
                        ...station,
                        isGasStation: true,
                      })
                    }
                  />
                ) : null
              )}

            {/* InfoWindow */}
            {selectedReport && (
              <InfoWindow
                position={{
                  lat:
                    selectedReport.location?.latitude ??
                    selectedReport.location?.coordinates?.[1],
                  lng:
                    selectedReport.location?.longitude ??
                    selectedReport.location?.coordinates?.[0],
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
                        Gasoline: ₱{selectedReport.fuelPrices?.gasoline ?? "N/A"} <br />
                        Diesel: ₱{selectedReport.fuelPrices?.diesel ?? "N/A"} <br />
                        Premium: ₱{selectedReport.fuelPrices?.premium ?? "N/A"}
                      </Typography>
                      <Typography variant="caption" color="black" gutterBottom display="block">
                        {selectedReport.address?.street}, {selectedReport.address?.barangay},{" "}
                        {selectedReport.address?.city}
                      </Typography>
                      <button
                        style={{
                          marginTop: "0.5rem",
                          background: "#1976d2",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          cursor: "pointer",
                          borderRadius: "4px",
                        }}
                        onClick={() => {
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
        </Paper>
      </Box>
    </Box>
  );
};

export default MapsAndTraffic;
