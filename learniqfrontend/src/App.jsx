import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";

import AdminDashboard from "./components/AdminDashboard";
import CreateTest from "./components/CreateTest";
import ScheduleTest from "./components/ScheduleTest";
import TestRequests from "./components/TestRequests";

import StudentDashboard from "./components/StudentDashboard";
import TestPage from "./components/TestPage";
import Result from "./components/Result";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ===== ADMIN ROUTES ===== */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-test"
          element={
            <ProtectedRoute allowedRole="admin">
              <CreateTest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schedule-test"
          element={
            <ProtectedRoute allowedRole="admin">
              <ScheduleTest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/test-requests"
          element={
            <ProtectedRoute allowedRole="admin">
              <TestRequests />
            </ProtectedRoute>
          }
        />

        {/* ===== STUDENT ROUTES ===== */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/test/:testId"
          element={
            <ProtectedRoute allowedRole="student">
              <TestPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/result"
          element={
            <ProtectedRoute allowedRole="student">
              <Result />
            </ProtectedRoute>
          }
        />

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
