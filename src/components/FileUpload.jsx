// File upload component with progress tracking and validation
import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  FilePresent,
  Image,
  Description,
  CheckCircle,
  Error,
  Close
} from '@mui/icons-material';
import { uploadService } from '../services/uploadService';

const FileUpload = ({ 
  onUpload,
  onError,
  multiple = false,
  accept = '*/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/*', 'application/pdf', 'text/*'],
  showPreview = true,
  disabled = false
}) => {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isValidType) {
        errors.push(`File type ${file.type} is not allowed`);
      }
    }

    return errors;
  };

  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push({
          file,
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending'
        });
      } else {
        errors.push(`${file.name}: ${fileErrors.join(', ')}`);
      }
    });

    if (errors.length > 0) {
      onError?.(errors);
    }

    if (validFiles.length > 0) {
      setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    if (disabled) return;
    handleFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const uploadPromises = files.map(async (fileItem, index) => {
        try {
          let result;
          
          if (fileItem.type.startsWith('image/')) {
            result = await uploadService.uploadImage(fileItem.file);
          } else if (fileItem.type === 'application/pdf' || fileItem.type.startsWith('text/')) {
            result = await uploadService.uploadDocument(fileItem.file);
          } else {
            result = await uploadService.uploadImage(fileItem.file); // fallback
          }

          setUploadProgress(((index + 1) / files.length) * 100);
          return { ...fileItem, status: 'success', result };
        } catch (error) {
          setUploadProgress(((index + 1) / files.length) * 100);
          return { ...fileItem, status: 'error', error: error.message };
        }
      });

      const results = await Promise.all(uploadPromises);
      setFiles(results);
      
      const successfulUploads = results.filter(r => r.status === 'success');
      const failedUploads = results.filter(r => r.status === 'error');

      if (successfulUploads.length > 0) {
        onUpload?.(successfulUploads);
      }

      if (failedUploads.length > 0) {
        onError?.(failedUploads.map(f => f.error));
      }

    } catch (error) {
      console.error('Upload error:', error);
      onError?.([error.message]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handlePreview = (fileItem) => {
    setPreviewFile(fileItem);
    setShowPreviewDialog(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image />;
    if (type === 'application/pdf') return <Description />;
    return <FilePresent />;
  };

  return (
    <Box>
      <Card
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: dragActive ? '2px dashed #1976d2' : '2px dashed #ccc',
          backgroundColor: dragActive ? '#f5f5f5' : 'transparent',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1
        }}
      >
        <CardContent>
          <Box textAlign="center" py={2}>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {dragActive ? 'Drop files here' : 'Upload Files'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Drag and drop files here, or click to select files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Max file size: {maxSize / (1024 * 1024)}MB
            </Typography>
          </Box>

          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleFileInput}
            style={{ display: 'none' }}
            disabled={disabled}
          />

          <Button
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            fullWidth
          >
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {files.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            Selected Files ({files.length})
          </Typography>
          
          <List>
            {files.map((fileItem) => (
              <ListItem key={fileItem.id} divider>
                <ListItemIcon>
                  {getFileIcon(fileItem.type)}
                </ListItemIcon>
                <ListItemText
                  primary={fileItem.name}
                  secondary={`${formatFileSize(fileItem.size)} • ${fileItem.type}`}
                />
                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={1}>
                    {fileItem.status === 'success' && (
                      <CheckCircle color="success" />
                    )}
                    {fileItem.status === 'error' && (
                      <Error color="error" />
                    )}
                    {showPreview && (
                      <IconButton
                        size="small"
                        onClick={() => handlePreview(fileItem)}
                      >
                        <FilePresent />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFile(fileItem.id)}
                      disabled={isUploading}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {isUploading && (
            <Box mt={2}>
              <Typography variant="body2" gutterBottom>
                Uploading... {Math.round(uploadProgress)}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}

          <Box mt={2} display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              startIcon={<CloudUpload />}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      )}

      <Dialog
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          File Preview
          <IconButton
            onClick={() => setShowPreviewDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {previewFile && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {previewFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Size: {formatFileSize(previewFile.size)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Type: {previewFile.type}
              </Typography>
              
              {previewFile.type.startsWith('image/') && (
                <Box mt={2}>
                  <img
                    src={URL.createObjectURL(previewFile.file)}
                    alt={previewFile.name}
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;
