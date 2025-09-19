import React, { useState, useRef } from "react";
import {
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import { useJsApiLoader } from "@react-google-maps/api";

const PlaceAutocompleteBox = ({ onPlaceSelected }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const typingTimeout = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const handleChangeText = (text) => {
    setQuery(text);

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      if (!autocompleteService.current && window.google) {
        autocompleteService.current =
          new window.google.maps.places.AutocompleteService();
      }

      if (text.length > 0 && autocompleteService.current) {
        autocompleteService.current.getPlacePredictions(
          { input: text },
          (predictions, status) => {
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setSuggestions(predictions);
            } else {
              setSuggestions([]);
            }
          }
        );
      } else {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSelectSuggestion = (place) => {
    setQuery(place.description);
    setSuggestions([]);

    if (!placesService.current && window.google) {
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
    }

    if (placesService.current) {
      placesService.current.getDetails(
        {
          placeId: place.place_id,
          fields: ["formatted_address", "geometry"],
        },
        (details, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            details
          ) {
            const location = details.geometry.location;
            const data = {
              description: place.description,
              address: details.formatted_address,
              lat: location.lat(),
              lng: location.lng(),
            };
            onPlaceSelected(data);
          }
        }
      );
    }
  };

  if (!isLoaded) return null;

  return (
    <div>
      <TextField
        fullWidth
        value={query}
        onChange={(e) => handleChangeText(e.target.value)}
        placeholder="Search place..."
        variant="outlined"
        size="small"
      />
      {suggestions.length > 0 && (
        <Paper
          style={{
            position: "absolute",
            zIndex: 1000,
            width: "100%",
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          <List>
            {suggestions.map((item) => (
              <ListItem key={item.place_id} disablePadding>
                <ListItemButton onClick={() => handleSelectSuggestion(item)}>
                  <ListItemText primary={item.description} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );
};

export default PlaceAutocompleteBox;
