import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";

// Auth and Store Routes
import AuthRoutes from "./routes/AuthRoutes";
import StoreRoutes from "./routes/StoreRoutes";
import BranchManagerRoutes from "./routes/BranchManagerRoutes";
import { getUserProfile } from "./Redux Toolkit/features/user/userThunks";
import Landing from "./pages/common/Landing/Landing";
import CashierRoutes from "./routes/CashierRoutes";
import Onboarding from "./pages/onboarding/Onboarding";
import { getStoreByAdmin } from "./Redux Toolkit/features/store/storeThunks";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import PageNotFound from "./pages/common/PageNotFound";
import ChatBotWidget from "./components/ChatBotWidget";
import VisionCheckout from "./pages/vision-checkout/VisionCheckout";

const App = () => {
  const dispatch = useDispatch();
  const { userProfile } = useSelector((state) => state.user);
  const { store } = useSelector((state) => state.store);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      dispatch(getUserProfile(jwt));
    }
  }, [dispatch]);

  useEffect(() => {
    if (userProfile && userProfile.role === "ROLE_STORE_ADMIN") {
      dispatch(getStoreByAdmin(userProfile.jwt));
    }
  }, [dispatch, userProfile]);

  let content;

  if (userProfile && userProfile.role) {
    if (userProfile.role === "ROLE_ADMIN") {
      content = (
        <Routes>
          <Route path="/" element={<Navigate to="/super-admin" replace />} />
          <Route path="/super-admin/*" element={<SuperAdminRoutes />} />
          <Route path="*" element={<PageNotFound/>} />
        </Routes>
      );
    } else if (userProfile.role === "ROLE_BRANCH_CASHIER") {
      content = (
        <Routes>
          <Route path="/" element={<Navigate to="/cashier" replace />} />
          <Route path="/cashier/*" element={<CashierRoutes />} />
          <Route path="*" element={<PageNotFound/>} />
        </Routes>
      );
    } else if (
      userProfile.role === "ROLE_STORE_ADMIN" ||
      userProfile.role === "ROLE_STORE_MANAGER"
    ) {
      if (!store) {
        return (
          <Routes>
            <Route path="/auth/onboarding" element={<Onboarding />} />
            <Route path="*" element={<PageNotFound/>} />
          </Routes>
        );
      } else {
        content = (
          <Routes>
            <Route path="/" element={<Navigate to="/store" replace />} />
            <Route path="/store/*" element={<StoreRoutes />} />
            <Route path="*" element={<PageNotFound/>} />
          </Routes>
        );
      }
    } else if (
      userProfile.role === "ROLE_BRANCH_MANAGER" ||
      userProfile.role === "ROLE_BRANCH_ADMIN"
    ) {
      content = (
        <Routes>
          <Route path="/" element={<Navigate to="/branch" replace />} />
          <Route path="/branch/*" element={<BranchManagerRoutes />} />
          <Route path="*" element={<PageNotFound/>} />
        </Routes>
      );
    } else {
      content = (
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="*" element={<PageNotFound/>} />
        </Routes>
      );
    }
  } else {
    content = (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth/*" element={<AuthRoutes />} />
        <Route path="/vision-checkout" element={<VisionCheckout />} />
        <Route path="*" element={<PageNotFound/>} />
      </Routes>
    );
  }

  return (
    <>
      {content}
      <ChatBotWidget />
    </>
  );
};

export default App;
