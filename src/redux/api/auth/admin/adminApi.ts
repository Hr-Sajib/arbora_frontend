// // import baseApi from "../../baseApi";

// // interface LoginRequest {
// //   email: string;
// //   password: string;
// // }

// // interface LoginResponseData {
// //   success: boolean;
// //   message: string;
// //   data: {
// //     accessToken: string;
// //   };
// // }

// // interface AdminProfile {
// //   id: number;
// //   email: string;
// //   role: string;
// // }

// // const adminApi = baseApi.injectEndpoints({
// //   endpoints: (builder) => ({
// //     login: builder.mutation<LoginResponseData, LoginRequest>({
// //       query: (credentials) => ({
// //         url: "/auth/login",
// //         method: "POST",
// //         body: credentials,
// //       }),
// //       // Remove jwtDecode from onQueryStarted to avoid the error
// //       // Role check will be handled in the component
// //     }),
// //     logout: builder.mutation<void, void>({
// //       query: () => ({
// //         url: "/auth/logout",
// //         method: "POST",
// //       }),
// //       invalidatesTags: ["Admin"],
// //     }),
// //     getAdminProfile: builder.query<AdminProfile, void>({
// //       query: () => "/admin/profile",
// //       providesTags: ["Admin"],
// //     }),
// //   }),
// // });

// // export const { useLoginMutation, useLogoutMutation, useGetAdminProfileQuery } = adminApi;
// // export default adminApi;


// import baseApi from "../../baseApi";
// import Cookies from "js-cookie";

// interface LoginRequest {
//   email: string;
//   password: string;
// }

// interface SignupRequest extends LoginRequest {
//   role: string;
// }

// interface LoginResponseData {
//   success: boolean;
//   message: string;
//   data: {
//     accessToken: string;
//   };
// }

// interface AdminProfile {
//   id: number;
//   email: string;
//   role: string;
// }

// // Load admin token from environment variable
// const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

// const adminApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     login: builder.mutation<LoginResponseData, LoginRequest>({
//       query: (credentials) => ({
//         url: "/auth/login",
//         method: "POST",
//         body: credentials,
//       }),
//     }),
//     signup: builder.mutation<LoginResponseData, SignupRequest>({
//       query: (credentials) => {
//         const token = ADMIN_TOKEN || Cookies.get("token"); // Fallback to cookie if env var not set
//         if (!token) {
//           throw new Error("No authorization token available. Please configure a valid admin token.");
//         }
//         return {
//           url: "/user/",
//           method: "POST",
//           body: credentials,
//           headers: { Authorization: `Bearer ${token}` }, // Use persistent token
//         };
//       },
//     }),
//     logout: builder.mutation<void, void>({
//       query: () => ({
//         url: "/auth/logout",
//         method: "POST",
//       }),
//       invalidatesTags: ["Admin"],
//     }),
//     getAdminProfile: builder.query<AdminProfile, void>({
//       query: () => "/admin/profile",
//       providesTags: ["Admin"],
//     }),
//   }),
// });

// export const { useLoginMutation, useSignupMutation, useLogoutMutation, useGetAdminProfileQuery } = adminApi;
// export default adminApi;


import baseApi from "../../baseApi";
import Cookies from "js-cookie";

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest extends LoginRequest {
  role: string;
}

interface LoginResponseData {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}

interface AdminProfile {
  id: number;
  email: string;
  role: string;
}

interface SalesUser {
  _id: string;
  email: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  image?: string; // Optional based on Postman data
}

interface SalesUsersResponse {
  success: boolean;
  message?: string;
  data: SalesUser[];
}

// Load admin token from environment variable, falling back to cookie
const getToken = () => process.env.ADMIN_TOKEN || Cookies.get("token");

const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    signup: builder.mutation<LoginResponseData, SignupRequest>({
      query: (credentials) => {
        const token = getToken();
        if (!token) {
          throw new Error("No authorization token available. Please configure a valid admin token.");
        }
        return {
          url: "/user/",
          method: "POST",
          body: credentials,
          headers: { Authorization: `Bearer ${token}` },
        };
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Admin"],
    }),
    getAdminProfile: builder.query<AdminProfile, void>({
      query: () => ({
        url: "/admin/profile",
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
      providesTags: ["Admin"],
    }),
    getSalesUsers: builder.query<SalesUsersResponse, void>({
      query: () => ({
        url: "/user/",
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
      providesTags: ["SalesUsers"],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useGetAdminProfileQuery,
  useGetSalesUsersQuery,
} = adminApi;
export default adminApi;
