import { createSlice } from "@reduxjs/toolkit";
import { login, signup, forgotPassword, resetPassword, sendOtp, verifyOtp } from './authThunk';


// ✅ Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    forgotPasswordLoading: false,
    forgotPasswordError: null,
    forgotPasswordSuccess: false,
    resetPasswordLoading: false,
    resetPasswordError: null,
    resetPasswordSuccess: false,
    otpId: null,
    otpSent: false,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('jwt');
    },
    clearForgotPasswordState: (state) => {
      state.forgotPasswordLoading = false;
      state.forgotPasswordError = null;
      state.forgotPasswordSuccess = false;
    },
    clearResetPasswordState: (state) => {
      state.resetPasswordLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = false;
    },
    resetOtpState: (state) => {
      state.otpId = null;
      state.otpSent = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Forgot Password cases
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
        state.forgotPasswordError = null;
        
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = action.payload;
        state.forgotPasswordSuccess = false;
        state.error=action.payload
      })

      // Reset Password cases
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
        state.resetPasswordError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload;
        state.resetPasswordSuccess = false;
        state.error=action.payload
      })

      // Send OTP cases
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        // The message from backend contains "Verification ID: <uuid>"
        const message = action.payload.message;
        const id = message.split("Verification ID: ")[1];
        state.otpId = id;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify OTP cases
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.otpId = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearForgotPasswordState, clearResetPasswordState, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
