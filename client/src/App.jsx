import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import HomePage      from "./pages/HomePage";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import OTPPage       from "./pages/OTPPage";
import ForgotPage    from "./pages/ForgotPage";
import ResetPage     from "./pages/ResetPage";
import GigsPage      from "./pages/GigsPage";
import GigDetailPage from "./pages/GigDetailPage";
import CreateGigPage from "./pages/CreateGigPage";
import MyGigsPage    from "./pages/MyGigsPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage    from "./pages/OrdersPage";
import InboxPage     from "./pages/InboxPage";
import PaymentPage   from "./pages/PaymentPage";
import ProfilePage   from "./pages/ProfilePage";
import NotFoundPage  from "./pages/NotFoundPage";

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"80vh"}}><div className="spinner"/></div>;
  return user ? children : <Navigate to="/login" replace />;
};
const SellerOnly = ({ children }) => {
  const { user } = useAuth();
  return user?.role === "seller" ? children : <Navigate to="/dashboard" replace />;
};

function Layout() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/"                 element={<HomePage />} />
          <Route path="/login"            element={<LoginPage />} />
          <Route path="/register"         element={<RegisterPage />} />
          <Route path="/verify-otp"       element={<OTPPage />} />
          <Route path="/forgot-password"  element={<ForgotPage />} />
          <Route path="/reset-password"   element={<ResetPage />} />
          <Route path="/gigs"             element={<GigsPage />} />
          <Route path="/gigs/:id"         element={<GigDetailPage />} />
          <Route path="/profile/:id"      element={<ProfilePage />} />
          <Route path="/gigs/new"         element={<Private><SellerOnly><CreateGigPage /></SellerOnly></Private>} />
          <Route path="/my-gigs"          element={<Private><SellerOnly><MyGigsPage /></SellerOnly></Private>} />
          <Route path="/dashboard"        element={<Private><DashboardPage /></Private>} />
          <Route path="/orders"           element={<Private><OrdersPage /></Private>} />
          <Route path="/inbox"            element={<Private><InboxPage /></Private>} />
          <Route path="/payment/:orderId" element={<Private><PaymentPage /></Private>} />
          <Route path="*"                 element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><Layout /></BrowserRouter></AuthProvider>;
}
