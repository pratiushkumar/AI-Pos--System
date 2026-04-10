import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../utils/api";

// ✅ Signup
export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/signup", userData);
      localStorage.setItem("jwt", res.data.data.jwt);
      console.log("Signup success:", res.data.data);
      return res.data.data;
    } catch (err) {
      console.error("Signup error:", err);
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

// ✅ Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {

    console.log("Credentials:", credentials);
    try {
      const res = await api.post("/auth/login", credentials);
      const data = res.data.data;
      console.log("Login success:", data);
      localStorage.setItem("jwt", data.jwt);
      // Optional: Save token to localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      return data;
    } catch (err) {
      console.error("Login error:", err);
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

// ✅ Forgot Password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/forgot-password", { email });
      console.log("Forgot password success:", res.data);
      return res.data;
    } catch (err) {
      console.error("Forgot password error:", err);
      return rejectWithValue(err.response?.data?.message || "Failed to send reset email");
    }
  }
);

// ✅ Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/reset-password", { token, password });
      console.log("Reset password success:", res.data);
      return res.data;
    } catch (err) {
      console.error("Reset password error:", err);
      return rejectWithValue(err.response?.data?.message || "Failed to reset password");
    }
  }
);

// ✅ Send OTP
export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/send-otp", { email });
      console.log("OTP sent successfully:", res.data);
      return res.data; // Should contain verification ID
    } catch (err) {
      console.error("Send OTP error:", err);
      return rejectWithValue(err.response?.data?.message || "Failed to send OTP");
    }
  }
);

// ✅ Verify OTP
export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ id, otp }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/verify-otp", { id, otp });
      const data = res.data.data;
      console.log("OTP verification success:", data);
      localStorage.setItem("jwt", data.jwt);
      return data;
    } catch (err) {
      console.error("OTP verification error:", err);
      return rejectWithValue(err.response?.data?.message || "OTP verification failed");
    }
  }
);