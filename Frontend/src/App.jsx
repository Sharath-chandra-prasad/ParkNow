import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import PageBackground from './components/PageBackground';
import CursorGlow from './components/CursorGlow';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ParkingAreas from './pages/ParkingAreas';
import ParkingSlots from './pages/ParkingSlots';
import BookingHistory from './pages/BookingHistory';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageParkingAreas from './pages/admin/ManageParkingAreas';
import ManageBookings from './pages/admin/ManageBookings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <PageBackground />
          <CursorGlow />
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/parking-areas" element={
                <ProtectedRoute><ParkingAreas /></ProtectedRoute>
              } />
              <Route path="/parking-slots/:areaId" element={
                <ProtectedRoute><ParkingSlots /></ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute><BookingHistory /></ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
              } />
              <Route path="/admin/parking-areas" element={
                <ProtectedRoute adminOnly><ManageParkingAreas /></ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute adminOnly><ManageBookings /></ProtectedRoute>
              } />
            </Routes>
          </main>
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
