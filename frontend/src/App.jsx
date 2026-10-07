import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CompleteProfile from './pages/CompleteProfile';
import NotFound from './pages/NotFound';

// Private Student Pages
import StudentDashboard from './pages/StudentDashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import ComplaintHistory from './pages/ComplaintHistory';
import ComplaintDetails from './pages/ComplaintDetails';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

// Private Staff Pages
import StaffDashboard from './pages/StaffDashboard';
import AssignedComplaints from './pages/AssignedComplaints';

// Private Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageComplaints from './pages/ManageComplaints';
import ManageStudents from './pages/ManageStudents';
import ManageStaff from './pages/ManageStaff';
import ManageDepartments from './pages/ManageDepartments';
import Reports from './pages/Reports';
import StorageManager from './pages/StorageManager';
import Settings from './pages/Settings';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <Routes>
            {/* PUBLIC PAGES LAYER */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-admin" element={<Register defaultRole="admin" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* COMPLETE PROFILE ROUTE FOR LEGACY STUDENTS */}
            <Route
              path="/complete-profile"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <CompleteProfile />
                </ProtectedRoute>
              }
            />

            {/* STUDENT DASHBOARD LAYER */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="raise-complaint" element={<RaiseComplaint />} />
              <Route path="complaints" element={<ComplaintHistory />} />
              <Route path="complaints/:id" element={<ComplaintDetails />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* DEPARTMENT STAFF LAYER */}
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['staff']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StaffDashboard />} />
              <Route path="complaints" element={<AssignedComplaints />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* SYSTEM ADMINISTRATOR LAYER */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="complaints" element={<ManageComplaints />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="staff" element={<ManageStaff />} />
              <Route path="departments" element={<ManageDepartments />} />
              <Route path="reports" element={<Reports />} />
              <Route path="storage" element={<StorageManager />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 FALLBACK LAYER */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
      <ToastContainer
        position="bottom-left"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        closeButton={true}
        theme="colored"
        style={{ zIndex: 99999 }}
      />
    </ThemeProvider>
  </ErrorBoundary>
  );
};

export default App;
