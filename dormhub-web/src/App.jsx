import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import { ROLE_ADMIN } from './constants';
// Guest
import Home from './pages/Home';
import Dorms from './pages/Dorms';
import DormDetail from './pages/DormDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
// Member
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import MyBookings from './pages/MyBookings';
// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDorms from './pages/admin/AdminDorms';
import AdminDormForm from './pages/admin/AdminDormForm';
import AdminBookings from './pages/admin/AdminBookings';
import AdminMembers from './pages/admin/AdminMembers';

function App() {
  return (
    // AuthProvider ครอบทั้งแอป ทุกหน้าข้างในจึงเรียก useAuth() ได้
    <AuthProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Guest: ทุกคนเข้าได้ */}
            <Route path="/" element={<Home />} />
            <Route path="/dorms" element={<Dorms />} />
            <Route path="/dorms/:id" element={<DormDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Member: ต้อง login */}
            <Route path="/me/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/me/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/me/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />

            {/* Admin: ต้อง login และ role = admin  หน้าย่อยแสดงใน <Outlet /> ของ AdminLayout */}
            <Route path="/admin" element={<ProtectedRoute role={ROLE_ADMIN}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="dorms" element={<AdminDorms />} />
              <Route path="dorms/new" element={<AdminDormForm />} />
              <Route path="dorms/:id/edit" element={<AdminDormForm />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="members" element={<AdminMembers />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
