// Export button component with multiple format support
import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  Box,
  Typography
} from '@mui/material';
import {
  Download,
  FileDownload,
  TableChart,
  Description,
  DataObject
} from '@mui/icons-material';
import { exportService } from '../services/exportService';

const ExportButton = ({ 
  entity, 
  data = [], 
  filters = {},
  onExport,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formats = [
    { value: 'csv', label: 'CSV', icon: <TableChart /> },
    { value: 'excel', label: 'Excel', icon: <FileDownload /> },
    { value: 'json', label: 'JSON', icon: <DataObject /> }
  ];

  const availableFields = {
    users: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'lastLogin', label: 'Last Login' }
    ],
    trips: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'startLocation', label: 'Start Location' },
      { key: 'endLocation', label: 'End Location' },
      { key: 'distance', label: 'Distance' },
      { key: 'duration', label: 'Duration' },
      { key: 'createdAt', label: 'Created At' }
    ],
    reports: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'location', label: 'Location' },
      { key: 'createdAt', label: 'Created At' }
    ],
    gasStations: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'brand', label: 'Brand' },
      { key: 'address', label: 'Address' },
      { key: 'rating', label: 'Rating' },
      { key: 'createdAt', label: 'Created At' }
    ],
    motorcycles: [
      { key: 'id', label: 'ID' },
      { key: 'brand', label: 'Brand' },
      { key: 'model', label: 'Model' },
      { key: 'year', label: 'Year' },
      { key: 'engineSize', label: 'Engine Size' },
      { key: 'fuelType', label: 'Fuel Type' }
    ]
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleFormatSelect = (format) => {
    setExportFormat(format);
    setShowExportDialog(true);
    handleClose();
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      let result;
      const exportFilters = {
        ...filters,
        fields: selectedFields.length > 0 ? selectedFields : undefined
      };

      switch (entity) {
        case 'users':
          result = await exportService.exportUsers(exportFormat, exportFilters);
          break;
        case 'trips':
          result = await exportService.exportTrips(exportFormat, exportFilters);
          break;
        case 'reports':
          result = await exportService.exportReports(exportFormat, exportFilters);
          break;
        case 'gasStations':
          result = await exportService.exportGasStations(exportFormat, exportFilters);
          break;
        case 'motorcycles':
          result = await exportService.exportMotorcycles(exportFormat, exportFilters);
          break;
        default:
          throw new Error('Unsupported entity for export');
      }

      setSnackbar({
        open: true,
        message: `Export completed successfully! File: ${result.filename}`,
        severity: 'success'
      });

      if (onExport) {
        onExport(result);
      }
    } catch (error) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: `Export failed: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsExporting(false);
      setShowExportDialog(false);
    }
  };

  const handleFieldToggle = (field) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleSelectAllFields = () => {
    const allFields = availableFields[entity]?.map(f => f.key) || [];
    setSelectedFields(allFields);
  };

  const handleDeselectAllFields = () => {
    setSelectedFields([]);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={disabled || isExporting}
        startIcon={isExporting ? <CircularProgress size={20} /> : <Download />}
        variant="outlined"
        color="primary"
      >
        {isExporting ? 'Exporting...' : 'Export'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {formats.map((format) => (
          <MenuItem
            key={format.value}
            onClick={() => handleFormatSelect(format.value)}
          >
            <ListItemIcon>
              {format.icon}
            </ListItemIcon>
            <ListItemText>{format.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Export {entity} Data
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Select the fields you want to include in the export:
            </Typography>
          </Box>
          
          <Box mb={2}>
            <Button onClick={handleSelectAllFields} size="small">
              Select All
            </Button>
            <Button onClick={handleDeselectAllFields} size="small" sx={{ ml: 1 }}>
              Deselect All
            </Button>
          </Box>

          <Box display="flex" flexDirection="column" gap={1}>
            {availableFields[entity]?.map((field) => (
              <FormControlLabel
                key={field.key}
                control={
                  <Checkbox
                    checked={selectedFields.includes(field.key)}
                    onChange={() => handleFieldToggle(field.key)}
                  />
                }
                label={field.label}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleExport} 
            variant="contained"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportButton;
