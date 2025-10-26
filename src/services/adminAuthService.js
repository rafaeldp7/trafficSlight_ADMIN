// Admin Authentication Service
// Aligned with backend AdminAuthController endpoints
import API_CONFIG from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class AdminAuthService {
  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // POST /api/auth/login (using regular auth since admin auth requires Admin model)
  async login(email, password) {
    try {
      // Prepare request data
      const requestData = { 
        email: email.trim(), 
        password: password.trim() 
      };
      
      console.log('🔐 Admin Login Request:', { 
        url: `${API_BASE_URL}/auth/login`,
        data: { email: requestData.email, password: '***' }
      });
      
      // Try admin auth endpoint first, fallback to regular auth
      let response = await fetch(`${API_BASE_URL}/admin-auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      // If admin login fails, try regular auth
      if (!response.ok) {
        console.log('⚠️ Admin login failed, trying regular auth');
        response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        });
      }

      console.log('🔐 Admin Login Response:', { 
        status: response.status, 
        ok: response.ok 
      });

      const data = await response.json();
      
      console.log('🔍 Admin Login Response Data:', {
        success: data.success,
        message: data.message,
        hasToken: !!data.token,
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : 'No data object',
        fullResponse: data
      });
      
      if (response.ok && (data.token || (data.data && data.data.token))) {
        // Extract user data from response (handle both structures)
        const userData = data.user || (data.data && data.data.user) || data;
        
        // Create admin object with role for frontend compatibility
        const adminData = {
          id: userData._id || userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: {
            name: userData.role || 'super_admin',
            displayName: userData.roleInfo?.displayName || 'Super Administrator',
            level: userData.roleInfo?.level || 100,
            permissions: userData.roleInfo?.permissions || {
              canCreate: true,
              canRead: true,
              canUpdate: true,
              canDelete: true,
              canManageAdmins: true,
              canAssignRoles: true,
              canManageUsers: true,
              canManageReports: true,
              canManageTrips: true,
              canManageGasStations: true,
              canViewAnalytics: true,
              canExportData: true,
              canManageSettings: true
            }
          },
          isActive: true,
          lastLogin: new Date().toISOString()
        };
        
        // Extract token from response (handle both structures)
        const token = data.token || (data.data && data.data.token);
        
        // Store admin token and data
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminData', JSON.stringify(adminData));
        console.log('✅ Admin login successful');
        return { success: true, data: { token: token, admin: adminData } };
      } else {
        console.log('❌ Admin login failed:', {
          responseOk: response.ok,
          responseStatus: response.status,
          dataSuccess: data.success,
          dataMessage: data.message,
          hasToken: !!(data.token || (data.data && data.data.token)),
          fullData: data
        });
        
        if (response.status === 401) {
          return { success: false, error: 'Invalid credentials. Please check your email and password.' };
        }
        return { success: false, error: data.message || data.error || 'Login failed' };
      }
    } catch (error) {
      console.warn('Backend admin auth not available, using mock authentication');
      
        return { success: false, error: 'Invalid credentials.' };

    }
  }

  // GET /api/auth/check-user - Check if user exists (debugging)
  async checkUser(email) {
    try {
      console.log('🔍 Checking if user exists:', email);
      
      const response = await fetch(`${API_BASE_URL}/auth/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ User check successful:', data);
        return { success: true, data };
      } else {
        console.log('❌ User check failed:', data);
        return { success: false, error: data.message || 'User check failed' };
      }
    } catch (error) {
      console.error('Check user error:', error);
      return { success: false, error: 'Failed to check user' };
    }
  }

  // GET /api/auth/profile - Get current user with role (using regular auth since we're using /api/auth/login)
  async getCurrentAdmin() {
    try {
      // Try regular auth profile first
      let response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      // If regular auth profile fails, try admin profile
      console.log('⚠️ Regular auth profile failed, trying admin profile');
      response = await fetch(`${API_BASE_URL}/admin-auth/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      }

      // If both fail, create admin data from token
      console.log('⚠️ Both profile endpoints failed, creating admin data from token');
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const adminData = {
            _id: payload.userId,
            email: payload.email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin',
            roleInfo: {
              level: 100,
              displayName: 'Super Admin',
              permissions: {
                canCreate: true,
                canRead: true,
                canUpdate: true,
                canDelete: true,
                canManageAdmins: true,
                canAssignRoles: true,
                canManageUsers: true,
                canManageReports: true,
                canManageTrips: true,
                canManageGasStations: true,
                canViewAnalytics: true,
                canExportData: true
              }
            }
          };
          return { success: true, data: { user: adminData } };
        } catch (error) {
          console.error('Failed to decode token:', error);
        }
      }

      return { success: false, error: 'Failed to get admin data from all sources' };
    } catch (error) {
      console.error('Get current admin error:', error);
      return { success: false, error: 'Failed to get admin data' };
    }
  }

  // POST /api/auth/logout
  async logout() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return { success: true };
      }

      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      // Clear local storage regardless of response
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      return { success: true, data };
    } catch (error) {
      console.error('Admin logout error:', error);
      // Clear local storage even if logout fails
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return { success: true };
    }
  }

  // GET /api/admin-auth/profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth/profile`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to get profile' };
      }
    } catch (error) {
      console.error('Get admin profile error:', error);
      return { success: false, error: 'Failed to get profile' };
    }
  }

  // PUT /api/admin-auth/profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update stored admin data
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Update admin profile error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  }

  // PUT /api/admin-auth/change-password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth/change-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Password change failed' };
      }
    } catch (error) {
      console.error('Change admin password error:', error);
      return { success: false, error: 'Password change failed' };
    }
  }

  // GET /api/admin-auth/verify-token
  async verifyToken() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      // Check if it's a mock token
      if (token.startsWith('mock-admin-token-')) {
        const adminData = localStorage.getItem('adminData');
        if (adminData) {
          return { 
            success: true, 
            data: { 
              admin: JSON.parse(adminData) 
            } 
          };
        }
      }

      // Try backend verification using regular auth endpoint (since we're using /api/auth/login)
      const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify-token`, {
        headers: this.getAuthHeaders()
      });

      if (!verifyResponse.ok) {
        // Token is invalid, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        return { success: false, error: 'Token verification failed' };
      }

      // Then get the current admin data with role
      const adminResponse = await this.getCurrentAdmin();
      
      if (adminResponse.success) {
        // Transform user data to admin format for frontend compatibility
        const user = adminResponse.data.user;
        const adminData = {
          id: user._id,
          firstName: user.firstName || 'Admin',
          lastName: user.lastName || 'User',
          email: user.email,
          role: {
            name: user.role || 'super_admin',
            displayName: user.roleInfo?.displayName || 'Super Admin',
            level: user.roleInfo?.level || 100,
            permissions: user.roleInfo?.permissions || {
              canCreate: true,
              canRead: true,
              canUpdate: true,
              canDelete: true,
              canManageAdmins: true,
              canAssignRoles: true,
              canManageUsers: true,
              canManageReports: true,
              canManageTrips: true,
              canManageGasStations: true,
              canViewAnalytics: true,
              canExportData: true
            }
          }
        };
        
        // Store admin data for future use
        localStorage.setItem('adminData', JSON.stringify(adminData));
        
        return { success: true, data: { admin: adminData } };
      } else {
        // Clear storage on error
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        return { success: false, error: 'Failed to get admin data' };
      }
    } catch (error) {
      console.warn('Backend token verification not available, using mock authentication');
      
      // Mock token verification fallback
      const adminData = localStorage.getItem('adminData');
      if (adminData) {
        return { 
          success: true, 
          data: { 
            admin: JSON.parse(adminData) 
          } 
        };
      }
      
      // Clear storage on error
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return { success: false, error: 'Token verification failed' };
    }
  }

  // Helper methods
  isAuthenticated() {
    const token = localStorage.getItem('adminToken');
    return !!token;
  }

  getToken() {
    return localStorage.getItem('adminToken');
  }

  getAdmin() {
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
  }

  removeToken() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  }
}

export const adminAuthService = new AdminAuthService();
