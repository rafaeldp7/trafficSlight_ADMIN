import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";

const BASE_URL = process.env.REACT_APP_BASE_URL || "https://ts-backend-1-jyit.onrender.com/api/";

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  reducerPath: "adminApi",
  tagTypes: [
    "User",
    "Products",
    "Customers",
    "Transactions",
    "Geography",
    "Sales",
    "Admins",
    "Performance",
    "Dashboard",
    "Reports",
  ],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 30,
  endpoints: (build) => ({
    getUser: build.query({
      query: (id) => `general/user/${id}`,
      providesTags: ["User"],
    }),
    getProducts: build.query({
      query: () => "client/products",
      providesTags: ["Products"],
    }),
    getCustomers: build.query({
      query: () => "client/customers",
      providesTags: ["Customers"],
    }),
    getTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: "client/transactions",
        method: "GET",
        params: { page, pageSize, sort, search },
      }),
      providesTags: ["Transactions"],
    }),
    getGeography: build.query({
      query: () => "client/geography",
      providesTags: ["Geography"],
    }),
    getSales: build.query({
      query: () => "sales/sales",
      providesTags: ["Sales"],
    }),
    getAdmins: build.query({
      query: () => "management/admins",
      providesTags: ["Admins"],
    }),
    getUserPerformance: build.query({
      query: (id) => `management/performance/${id}`,
      providesTags: ["Performance"],
    }),
    getDashboard: build.query({
      query: () => "general/dashboard",
      providesTags: ["Dashboard"],
    }),
    // Reports endpoints
    getReports: build.query({
      query: () => `reports`,
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((r) => ({ type: "Reports", id: r._id })),
              { type: "Reports", id: "LIST" },
            ]
          : [{ type: "Reports", id: "LIST" }],
    }),
    getArchivedReports: build.query({
      query: () => `reports`,
      transformResponse: (data) => data?.filter((r) => r.archived === true) || [],
      providesTags: [{ type: "Reports", id: "ARCHIVE_LIST" }],
    }),
    createReport: build.mutation({
      query: (body) => ({ url: `reports`, method: "POST", body }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }, { type: "Reports", id: "ARCHIVE_LIST" }],
    }),
    updateReport: build.mutation({
      query: ({ id, body }) => ({ url: `reports/${id}`, method: "PUT", body }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Reports", id: arg?.id },
        { type: "Reports", id: "LIST" },
        { type: "Reports", id: "ARCHIVE_LIST" },
      ],
    }),
    archiveReport: build.mutation({
      query: (id) => ({ url: `reports/${id}/archive`, method: "PUT" }),
      invalidatesTags: [{ type: "Reports", id: "LIST" }, { type: "Reports", id: "ARCHIVE_LIST" }],
    }),
    verifyReportByAdmin: build.mutation({
      query: ({ id, verifiedByAdmin = 1 }) => ({
        url: `reports/${id}/verify`,
        method: "PUT",
        body: { verifiedByAdmin },
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: "Reports", id: arg?.id },
        { type: "Reports", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetTransactionsQuery,
  useGetGeographyQuery,
  useGetSalesQuery,
  useGetAdminsQuery,
  useGetUserPerformanceQuery,
  useGetDashboardQuery,
  useGetReportsQuery,
  useGetArchivedReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useArchiveReportMutation,
  useVerifyReportByAdminMutation,
} = api;