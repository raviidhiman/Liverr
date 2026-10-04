import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Spinner from "./components/common/Spinner";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPage from "./pages/ForgotPage";
import GigsPage from "./pages/GigsPage";
import GigDetailPage from "./pages/GigDetailPage";
import CreateGigPage from "./pages/CreateGigPage";
import MyGigsPage from "./pages/MyGigsPage";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import InboxPage from "./pages/InboxPage";
import PaymentPage from "./pages/PaymentPage";
import ProfilePage from "./pages/ProfilePage";
import FavoritesPage from "./pages/FavoritesPage";
import NotFoundPage from "./pages/NotFoundPage";

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner full />;
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
};

const SellerOnly = ({ children }) => {
  const { user } = useAuth();
  return user?.role === "seller" ? children : <Navigate to="/dashboard" replace />;
};

const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner full />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollTop />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
              <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
              <Route path="/forgot-password" element={<GuestOnly><ForgotPage /></GuestOnly>} />
              <Route path="/gigs" element={<GigsPage />} />
              <Route path="/gigs/new" element={<Private><SellerOnly><CreateGigPage /></SellerOnly></Private>} />
              <Route path="/gigs/:id/edit" element={<Private><SellerOnly><CreateGigPage /></SellerOnly></Private>} />
              <Route path="/gigs/:id" element={<GigDetailPage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/my-gigs" element={<Private><SellerOnly><MyGigsPage /></SellerOnly></Private>} />
              <Route path="/dashboard" element={<Private><DashboardPage /></Private>} />
              <Route path="/orders" element={<Private><OrdersPage /></Private>} />
              <Route path="/favorites" element={<Private><FavoritesPage /></Private>} />
              <Route path="/inbox" element={<Private><InboxPage /></Private>} />
              <Route path="/payment/:orderId" element={<Private><PaymentPage /></Private>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
