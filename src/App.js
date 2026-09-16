import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './Pages/AuthPages/Register';
import Login from './Pages/AuthPages/Login';
import Dashboard from './Pages/Dashboard';
import LeaveListPage from './Pages/LeaveFormPages/LeaveListPage';
import AdminLeaveForm from './Pages/LeaveFormPages/AdminLeaveForm';
import LeaveTypesPage from './Pages/LeaveFormPages/LeaveTypesPage';
import LeaveBalancePage from './Pages/LeaveFormPages/LeaveBalancePage';
import HierarchyPage from './Pages/LeaveFormPages/HierarchyPage';
import HolidayManagementPage from './Pages/LeaveFormPages/HolidayManagementPage';
import LeaveCalendarPage from './Pages/LeaveFormPages/LeaveCalendarPage';
import ManageDepartmentsPage from './Pages/LeaveFormPages/ManageDepartmentsPage';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';
import ResetPasswordPage from './Pages/ResetPasswordPage';
import Layout from './Components/Layout/Layout';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Authenticated Routes wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user-leaves" element={<LeaveListPage />} />
            <Route path="/admin-apply-leave" element={<AdminLeaveForm />} />
            <Route path="/manage-leave-types" element={<LeaveTypesPage />} />
            <Route path="/leave-balance" element={<LeaveBalancePage />} />
            <Route path="/manage-hierarchy" element={<HierarchyPage />} />
            <Route path="/manage-holidays" element={<HolidayManagementPage />} />
            <Route path="/manage-departments" element={<ManageDepartmentsPage />} />
            <Route path="/calendar" element={<LeaveCalendarPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
