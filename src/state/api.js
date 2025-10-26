import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import API_CONFIG from "../config/api";

const BASE_URL = API_CONFIG.BASE_URL;

// Custom base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// Custom base query with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Handle unauthorized - clear tokens and redirect
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  
  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithReauth,
  reducerPath: "adminApi",
  tagTypes: [
    "User",
    "Admin",
    "Report",
    "Trip",
    "GasStation",
    "Dashboard",
    "Analytics",
    "Notification"
  ],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 30,
  endpoints: (build) => ({
    // Authentication
    login: build.mutation({
      query: (credentials) => ({
        url: 'admin-auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    adminLogin: build.mutation({
      query: (credentials) => ({
        url: 'admin-auth/admin-login',
        method: 'POST',
        body: credentials,
      }),
    }),
    getProfile: build.query({
      query: () => 'admin-auth/profile',
      providesTags: ['User'],
    }),
    updateProfile: build.mutation({
      query: (profileData) => ({
        url: 'admin-auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Dashboard
    getDashboardOverview: build.query({
      query: () => 'admin-dashboard/overview',
      providesTags: ['Dashboard'],
    }),
    getDashboardStats: build.query({
      query: (period = '30d') => `admin-dashboard/stats?period=${period}`,
      providesTags: ['Dashboard'],
    }),
    getAdminDashboard: build.query({
      query: () => 'admin-dashboard',
      providesTags: ['Dashboard'],
    }),
    getAnalytics: build.query({
      query: ({ type, period = '30d' }) => `admin-dashboard/analytics?type=${type}&period=${period}`,
      providesTags: ['Analytics'],
    }),

    // Admin Settings
    getAdminSettings: build.query({
      query: () => 'admin-settings',
      providesTags: ['AdminSettings'],
    }),
    updateAdminSettings: build.mutation({
      query: (settings) => ({
        url: 'admin-settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['AdminSettings'],
    }),

    // System Status
    getSystemStatus: build.query({
      query: () => 'admin/status',
      providesTags: ['SystemStatus'],
    }),
    getAdminInfo: build.query({
      query: () => 'admin/info',
      providesTags: ['AdminInfo'],
    }),

    // Users (Admin only)
    getUsers: build.query({
      query: (params = {}) => ({
        url: 'admin-users',
        params,
      }),
      providesTags: (result) =>
        result?.data?.users?.length
          ? [
              ...result.data.users.map((u) => ({ type: "User", id: u._id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    // User Statistics (Admin only)
    getUserStats: build.query({
      query: () => 'admin-user-stats/statistics',
      providesTags: ['UserStats'],
    }),
    getTotalUsers: build.query({
      query: () => 'admin-user-stats/total',
      providesTags: ['UserStats'],
    }),
    getUsersThisMonth: build.query({
      query: () => 'admin-user-stats/this-month',
      providesTags: ['UserStats'],
    }),
    getUserGrowth: build.query({
      query: () => 'admin-user-stats/growth',
      providesTags: ['UserStats'],
    }),
    getUser: build.query({
      query: (id) => `admin-users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    updateUser: build.mutation({
      query: ({ id, ...userData }) => ({
        url: `admin-users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    deleteUser: build.mutation({
      query: (id) => ({
        url: `admin-users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getUserStats: build.query({
      query: () => 'admin-users/stats',
      providesTags: ['User'],
    }),

    // Admins
    getAdmins: build.query({
      query: (params = {}) => ({
        url: 'admin-management',
        params,
      }),
      providesTags: ['Admin'],
    }),
    getAdmin: build.query({
      query: (id) => `admin-management/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admin', id }],
    }),
    createAdmin: build.mutation({
      query: (adminData) => ({
        url: 'admin-management',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['Admin'],
    }),
    updateAdmin: build.mutation({
      query: ({ id, ...adminData }) => ({
        url: `admin-management/${id}`,
        method: 'PUT',
        body: adminData,
      }),
      invalidatesTags: ['Admin'],
    }),
    deleteAdmin: build.mutation({
      query: (id) => ({
        url: `admin-management/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
    getAdminRoles: build.query({
      query: () => 'admin-management/roles',
      providesTags: ['Admin'],
    }),
    createAdminRole: build.mutation({
      query: (roleData) => ({
        url: 'admin-management/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Admin'],
    }),
    updateAdminRole: build.mutation({
      query: ({ id, ...roleData }) => ({
        url: `admin-management/roles/${id}`,
        method: 'PUT',
        body: roleData,
      }),
      invalidatesTags: ['Admin'],
    }),
    deleteAdminRole: build.mutation({
      query: (id) => ({
        url: `admin-management/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
    getAdminStats: build.query({
      query: () => 'admin-management/stats',
      providesTags: ['Admin'],
    }),
    // Reports
    getReports: build.query({
      query: (params = {}) => ({
        url: 'reports',
        params,
      }),
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((r) => ({ type: "Report", id: r._id })),
              { type: "Report", id: "LIST" },
            ]
          : [{ type: "Report", id: "LIST" }],
    }),
    getReport: build.query({
      query: (id) => `reports/${id}`,
      providesTags: (result, error, id) => [{ type: 'Report', id }],
    }),
    createReport: build.mutation({
      query: (reportData) => ({
        url: 'reports',
        method: 'POST',
        body: reportData,
      }),
      invalidatesTags: [{ type: "Report", id: "LIST" }],
    }),
    updateReport: build.mutation({
      query: ({ id, ...reportData }) => ({
        url: `reports/${id}`,
        method: 'PUT',
        body: reportData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Report", id },
        { type: "Report", id: "LIST" },
      ],
    }),
    deleteReport: build.mutation({
      query: (id) => ({
        url: `reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: "Report", id: "LIST" }],
    }),
    verifyReport: build.mutation({
      query: ({ id, notes }) => ({
        url: `reports/${id}/verify`,
        method: 'PUT',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Report", id },
        { type: "Report", id: "LIST" },
      ],
    }),
    resolveReport: build.mutation({
      query: ({ id, notes, actions }) => ({
        url: `reports/${id}/resolve`,
        method: 'PUT',
        body: { notes, actions },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Report", id },
        { type: "Report", id: "LIST" },
      ],
    }),
    archiveReport: build.mutation({
      query: (id) => ({
        url: `reports/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: [{ type: "Report", id: "LIST" }],
    }),
    addReportComment: build.mutation({
      query: ({ id, content }) => ({
        url: `reports/${id}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Report", id }],
    }),
    getReportsByLocation: build.query({
      query: ({ lat, lng, radius = 1000 }) => 
        `reports/location?lat=${lat}&lng=${lng}&radius=${radius}`,
      providesTags: ['Report'],
    }),
    // Removed getReportStats - endpoint doesn't exist on backend (404 error)

    // Motors (Admin only)
    getMotors: build.query({
      query: (params = {}) => ({
        url: 'admin-motors',
        params,
      }),
      providesTags: (result) =>
        result?.data?.motors?.length
          ? [
              ...result.data.motors.map((m) => ({ type: "Motor", id: m._id })),
              { type: "Motor", id: "LIST" },
            ]
          : [{ type: "Motor", id: "LIST" }],
    }),

    // Motor Statistics (Admin only)
    getMotorStats: build.query({
      query: () => 'admin-motor-stats/statistics',
      providesTags: ['MotorStats'],
    }),
    getTotalMotors: build.query({
      query: () => 'admin-motor-stats/total',
      providesTags: ['MotorStats'],
    }),
    getMotorModels: build.query({
      query: () => 'admin-motor-stats/models',
      providesTags: ['MotorStats'],
    }),
    getMotorGrowth: build.query({
      query: () => 'admin-motor-stats/growth',
      providesTags: ['MotorStats'],
    }),
    getMotorModelsList: build.query({
      query: () => 'admin-motor-stats/models-list',
      providesTags: ['MotorStats'],
    }),

    // Trips
    getTrips: build.query({
      query: (params = {}) => ({
        url: 'admin-trips',
        params,
      }),
      providesTags: (result) =>
        result?.data?.trips?.length
          ? [
              ...result.data.trips.map((t) => ({ type: "Trip", id: t._id })),
              { type: "Trip", id: "LIST" },
            ]
          : [{ type: "Trip", id: "LIST" }],
    }),
    getTrip: build.query({
      query: (id) => `admin-trips/${id}`,
      providesTags: (result, error, id) => [{ type: 'Trip', id }],
    }),
    createTrip: build.mutation({
      query: (tripData) => ({
        url: 'admin-trips',
        method: 'POST',
        body: tripData,
      }),
      invalidatesTags: [{ type: "Trip", id: "LIST" }],
    }),
    updateTrip: build.mutation({
      query: ({ id, ...tripData }) => ({
        url: `admin-trips/${id}`,
        method: 'PUT',
        body: tripData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Trip", id },
        { type: "Trip", id: "LIST" },
      ],
    }),
    deleteTrip: build.mutation({
      query: (id) => ({
        url: `admin-trips/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: "Trip", id: "LIST" }],
    }),
    getUserTrips: build.query({
      query: ({ userId, ...params }) => ({
        url: `admin-trips/user/${userId}`,
        params,
      }),
      providesTags: ['Trip'],
    }),
    getTripsByDateRange: build.query({
      query: ({ startDate, endDate, userId }) => ({
        url: 'admin-trips/date-range',
        params: { startDate, endDate, userId },
      }),
      providesTags: ['Trip'],
    }),
    getTripAnalytics: build.query({
      query: (userId = null) => ({
        url: 'admin-trips/analytics/summary',
        params: userId ? { userId } : {},
      }),
      providesTags: ['Analytics'],
    }),
    getMonthlyTripSummary: build.query({
      query: ({ year, month, userId }) => ({
        url: 'admin-trips/analytics/monthly',
        params: { year, month, userId },
      }),
      providesTags: ['Analytics'],
    }),
    getTopUsersByTripCount: build.query({
      query: (limit = 5) => `admin-trips/insights/top-users?limit=${limit}`,
      providesTags: ['Analytics'],
    }),
    getMostUsedMotors: build.query({
      query: (limit = 5) => `admin-trips/insights/top-motors?limit=${limit}`,
      providesTags: ['Analytics'],
    }),
    addRoutePoint: build.mutation({
      query: ({ tripId, coordinates, speed, altitude }) => ({
        url: `admin-trips/${tripId}/route-points`,
        method: 'POST',
        body: { coordinates, speed, altitude },
      }),
      invalidatesTags: (result, error, { tripId }) => [{ type: "Trip", id: tripId }],
    }),
    addExpense: build.mutation({
      query: ({ tripId, type, amount, description, location }) => ({
        url: `admin-trips/${tripId}/expenses`,
        method: 'POST',
        body: { type, amount, description, location },
      }),
      invalidatesTags: (result, error, { tripId }) => [{ type: "Trip", id: tripId }],
    }),

    // Gas Stations
    getGasStations: build.query({
      query: (params = {}) => ({
        url: 'admin-gas-stations',
        params,
      }),
      providesTags: (result) =>
        result?.data?.stations?.length
          ? [
              ...result.data.stations.map((s) => ({ type: "GasStation", id: s._id })),
              { type: "GasStation", id: "LIST" },
            ]
          : [{ type: "GasStation", id: "LIST" }],
    }),
    getGasStation: build.query({
      query: (id) => `admin-gas-stations/${id}`,
      providesTags: (result, error, id) => [{ type: 'GasStation', id }],
    }),
    createGasStation: build.mutation({
      query: (stationData) => ({
        url: 'admin-gas-stations',
        method: 'POST',
        body: stationData,
      }),
      invalidatesTags: [{ type: "GasStation", id: "LIST" }],
    }),
    updateGasStation: build.mutation({
      query: ({ id, ...stationData }) => ({
        url: `admin-gas-stations/${id}`,
        method: 'PUT',
        body: stationData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "GasStation", id },
        { type: "GasStation", id: "LIST" },
      ],
    }),
    deleteGasStation: build.mutation({
      query: (id) => ({
        url: `admin-gas-stations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: "GasStation", id: "LIST" }],
    }),
    updateFuelPrices: build.mutation({
      query: ({ id, prices }) => ({
        url: `admin-gas-stations/${id}/fuel-prices`,
        method: 'PUT',
        body: { prices },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "GasStation", id }],
    }),
    addGasStationReview: build.mutation({
      query: ({ id, rating, comment, categories }) => ({
        url: `admin-gas-stations/${id}/reviews`,
        method: 'POST',
        body: { rating, comment, categories },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "GasStation", id }],
    }),
    verifyGasStation: build.mutation({
      query: (id) => ({
        url: `admin-gas-stations/${id}/verify`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: "GasStation", id }],
    }),
    getGasStationsByBrand: build.query({
      query: (brand) => `admin-gas-stations/brand/${brand}`,
      providesTags: ['GasStation'],
    }),
    getGasStationsByCity: build.query({
      query: (city) => `admin-gas-stations/city/${city}`,
      providesTags: ['GasStation'],
    }),
    getGasStationStats: build.query({
      query: () => 'admin-gas-stations/stats',
      providesTags: ['GasStation'],
    }),
    getNearbyGasStations: build.query({
      query: ({ lat, lng, radius = 5000, limit = 20 }) => 
        `admin-gas-stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`,
      providesTags: ['GasStation'],
    }),
    archiveGasStation: build.mutation({
      query: (id) => ({
        url: `admin-gas-stations/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: [{ type: "GasStation", id: "LIST" }],
    }),
    getFuelPriceTrends: build.query({
      query: ({ stationId, fuelType, days = 30 }) => 
        `admin-gas-stations/${stationId}/price-trends?fuelType=${fuelType}&days=${days}`,
      providesTags: ['GasStation'],
    }),

    // Archived Reports
    getArchivedReports: build.query({
      query: (params = {}) => ({
        url: 'reports',
        params: { ...params, archived: true },
      }),
      transformResponse: (response) => {
        // Filter archived reports from the response
        if (Array.isArray(response)) {
          return response.filter(report => report.archived === true);
        }
        return [];
      },
      providesTags: ['Report'],
    }),

    // Verify Report by Admin
    verifyReportByAdmin: build.mutation({
      query: ({ id, verifiedByAdmin }) => ({
        url: `reports/${id}/verify`,
        method: 'PUT',
        body: { verifiedByAdmin },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Report", id },
        { type: "Report", id: "LIST" },
      ],
    }),
  }),
});

export const {
  // Authentication
  useLoginMutation,
  useAdminLoginMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,

  // Dashboard
  useGetDashboardOverviewQuery,
  useGetDashboardStatsQuery,
  useGetAdminDashboardQuery,
  useGetAnalyticsQuery,

  // Admin Settings
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,

  // System Status
  useGetSystemStatusQuery,
  useGetAdminInfoQuery,

  // Users
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,

  // User Statistics
  useGetTotalUsersQuery,
  useGetUsersThisMonthQuery,
  useGetUserGrowthQuery,

  // Admins
  useGetAdminsQuery,
  useGetAdminQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
  useGetAdminRolesQuery,
  useCreateAdminRoleMutation,
  useUpdateAdminRoleMutation,
  useDeleteAdminRoleMutation,
  useGetAdminStatsQuery,

  // Reports
  useGetReportsQuery,
  useGetReportQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useDeleteReportMutation,
  useVerifyReportMutation,
  useResolveReportMutation,
  useArchiveReportMutation,
  useAddReportCommentMutation,
  useGetReportsByLocationQuery,
  useGetReportStatsQuery,

  // Trips
  useGetTripsQuery,
  useGetTripQuery,
  useCreateTripMutation,
  useUpdateTripMutation,
  useDeleteTripMutation,
  useGetUserTripsQuery,
  useGetTripsByDateRangeQuery,
  useGetTripAnalyticsQuery,
  useGetMonthlyTripSummaryQuery,
  useGetTopUsersByTripCountQuery,
  useGetMostUsedMotorsQuery,
  useGetMotorsQuery,
  useAddRoutePointMutation,
  useAddExpenseMutation,

  // Motor Statistics
  useGetMotorStatsQuery,
  useGetTotalMotorsQuery,
  useGetMotorModelsQuery,
  useGetMotorGrowthQuery,
  useGetMotorModelsListQuery,

  // Gas Stations
  useGetGasStationsQuery,
  useGetGasStationQuery,
  useCreateGasStationMutation,
  useUpdateGasStationMutation,
  useDeleteGasStationMutation,
  useUpdateFuelPricesMutation,
  useAddGasStationReviewMutation,
  useVerifyGasStationMutation,
  useGetGasStationsByBrandQuery,
  useGetGasStationsByCityQuery,
  useGetGasStationStatsQuery,
  useGetNearbyGasStationsQuery,
  useArchiveGasStationMutation,
  useGetFuelPriceTrendsQuery,

  // Archived Reports
  useGetArchivedReportsQuery,

  // Verify Report by Admin
  useVerifyReportByAdminMutation,
} = api;