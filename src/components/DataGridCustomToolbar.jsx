import React from "react";
import { Search } from "@mui/icons-material";
import { IconButton, TextField, InputAdornment, useTheme } from "@mui/material";
import {
  GridToolbarDensitySelector,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
} from "@mui/x-data-grid";
import FlexBetween from "./FlexBetween";

const DataGridCustomToolbar = ({ searchInput, setSearchInput, setSearch }) => {
  const theme = useTheme();
  return (
    <GridToolbarContainer>
      <FlexBetween width="100%">
        <FlexBetween>
          <GridToolbarColumnsButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
        </FlexBetween>
        <TextField
          label="Search..."
          sx={{
            mb: "0.5rem",
            width: "15rem",
            "& .MuiInputBase-root": {
              color: theme.palette.secondary[100],
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.secondary[300],
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: theme.palette.secondary[200],
            },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: theme.palette.primary[100],
            },
          }}
          onChange={(e) => setSearchInput(e.target.value)}
          value={searchInput}
          variant="standard"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    setSearch(searchInput);
                    setSearchInput("");
                  }}
                  sx={{ color: theme.palette.secondary[300] }}
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </FlexBetween>
    </GridToolbarContainer>
  );
};

export default DataGridCustomToolbar;