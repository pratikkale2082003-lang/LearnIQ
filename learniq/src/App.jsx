import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";

import AdminDashboard from "./components/AdminDashboard";
import CreateTest from "./components/CreateTest";
import ScheduleTest from "./components/ScheduleTest";
import TestRequests from "./components/TestRequests";
import AdminResults from "./components/AdminResults";   // NEW

import StudentDashboard from "./components/StudentDashboard";
import TestPage from "./components/TestPage";
import Result from "./components/Result";
import MyResults from "./components/MyResults";         // NEW
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <>
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

        {/* NEW: admin la sarva students che results */}
        <Route
          path="/results"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminResults />
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

        {/* NEW: student la fakt swatache results */}
        <Route
          path="/student/results"
          element={
            <ProtectedRoute allowedRole="student">
              <MyResults />
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
