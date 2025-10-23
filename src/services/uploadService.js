// Upload service for file upload functionality
import { apiService } from './apiService';

export const uploadService = {
  // Upload image
  async uploadImage(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      // Add additional options
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
      
      const response = await fetch(`${apiService.baseURL}/upload/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  },

  // Upload document
  async uploadDocument(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      // Add additional options
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
      
      const response = await fetch(`${apiService.baseURL}/upload/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Upload document error:', error);
      throw error;
    }
  },

  // Upload multiple files
  async uploadMultiple(files, options = {}) {
    try {
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      // Add additional options
      Object.keys(options).forEach(key => {
        formData.append(key, options[key]);
      });
      
      const response = await fetch(`${apiService.baseURL}/upload/multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Upload multiple files error:', error);
      throw error;
    }
  },

  // Get uploaded file
  async getUploadedFile(filename) {
    try {
      return await apiService.get(`/upload/${filename}`);
    } catch (error) {
      console.error('Get uploaded file error:', error);
      throw error;
    }
  },

  // Delete uploaded file
  async deleteUploadedFile(filename) {
    try {
      return await apiService.delete(`/upload/${filename}`);
    } catch (error) {
      console.error('Delete uploaded file error:', error);
      throw error;
    }
  },

  // Get upload history
  async getUploadHistory() {
    try {
      return await apiService.get('/upload/history');
    } catch (error) {
      console.error('Get upload history error:', error);
      throw error;
    }
  },

  // Get file info
  async getFileInfo(filename) {
    try {
      return await apiService.get(`/upload/info/${filename}`);
    } catch (error) {
      console.error('Get file info error:', error);
      throw error;
    }
  },

  // Update file metadata
  async updateFileMetadata(filename, metadata) {
    try {
      return await apiService.put(`/upload/metadata/${filename}`, metadata);
    } catch (error) {
      console.error('Update file metadata error:', error);
      throw error;
    }
  },

  // Get file download URL
  async getFileDownloadUrl(filename) {
    try {
      const response = await apiService.get(`/upload/download-url/${filename}`);
      return response.downloadUrl;
    } catch (error) {
      console.error('Get file download URL error:', error);
      throw error;
    }
  },

  // Download file
  async downloadFile(filename) {
    try {
      const response = await fetch(`${apiService.baseURL}/upload/download/${filename}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Download file error:', error);
      throw error;
    }
  },

  // Get upload progress
  async getUploadProgress(uploadId) {
    try {
      return await apiService.get(`/upload/progress/${uploadId}`);
    } catch (error) {
      console.error('Get upload progress error:', error);
      throw error;
    }
  },

  // Cancel upload
  async cancelUpload(uploadId) {
    try {
      return await apiService.delete(`/upload/cancel/${uploadId}`);
    } catch (error) {
      console.error('Cancel upload error:', error);
      throw error;
    }
  },

  // Get storage usage
  async getStorageUsage() {
    try {
      return await apiService.get('/upload/storage-usage');
    } catch (error) {
      console.error('Get storage usage error:', error);
      throw error;
    }
  },

  // Clean up old files
  async cleanupOldFiles() {
    try {
      return await apiService.post('/upload/cleanup');
    } catch (error) {
      console.error('Cleanup old files error:', error);
      throw error;
    }
  }
};
