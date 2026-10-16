import { Navigate, Routes, Route, Outlet } from 'react-router-dom';

import Header from '../Components/Sections/Header';
import Footer from '../Components/Sections/Footer';
import ScrollToTop from '../Components/ScrollToTop';

// Pages
import Home from '../Pages/Home/Home';
import Work from '../Pages/Work/Work';
import Services from '../Pages/Services/Services';
import AllServices from '../Pages/Services/Sections/AllServices';
import InspectServices from '../Pages/Services/Sections/InspectServices';
import About from '../Pages/About/About';
import Blog from '../Pages/Blog/Blog';
import Contact from '../Pages/Contact/Contact';
import Profiles from '../Pages/Profile/Profile';

// Auth
import Login from '../Pages/Auth/Pages/Login';
import Register from '../Pages/Auth/Pages/Register';
import OAuthCallback from '../Pages/Auth/Pages/OAuthCallback';
import PasswordRecovery from '../Pages/Auth/Pages/PasswordRecovery';
import ProtectedRoute from '../Components/Auth/ProtectedRoute';
import DashboardLayout from '../Pages/App/DashboardLayout';
import AdminLayout from '../Pages/App/Admin/AdminLayout';
import { useAuth } from '../Core/AuthHooks';


// ===============================
// Website Layout
// ===============================
function WebsiteLayout() {
    return (
        <>
            <Header />

            <Outlet />

            <Footer />
        </>
    );
}

function DashboardRedirect() {
    const { user } = useAuth();
    return <Navigate to={`/app/${user.role}`} replace />;
}


// ===============================
// Routing
// ===============================
function Routing() {
    return (
        <>
            <ScrollToTop />

            <Routes>

                {/* =========================
                    WEBSITE PAGES
                ========================== */}
                <Route element={<WebsiteLayout />}>

                    <Route path="/" element={<Home />} />

                    <Route path="/work" element={<Work />} />

                    <Route path="/services" element={<Services />} />

                    <Route path="/blog" element={<Blog />} />

                    <Route path="/contact" element={<Contact />} />

                    <Route path="/profile" element={<Profiles />} />

                    <Route
                        path="/AllServices"
                        element={<AllServices />}
                    />

                    <Route
                        path="/InspectServices"
                        element={<InspectServices />}
                    />

                    <Route
                        path="/About"
                        element={<About />}
                    />

                </Route>


                {/* =========================
                    AUTH PAGES
                    NO HEADER / FOOTER
                ========================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/auth/callback"
                    element={<OAuthCallback />}
                />
                <Route path="/forgot-password" element={<PasswordRecovery />} />
                <Route path="/reset-password" element={<PasswordRecovery />} />

                <Route path="/app" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
                <Route path="/app/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>} />
                <Route path="/app/:role" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>} />

            </Routes>
        </>
    );
}

export default Routing;