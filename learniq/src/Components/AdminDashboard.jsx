import { Link } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar";

function AdminDashboard() {
  return (
    <>
      <AdminNavbar />

      <div className="container mt-4">
        <div className="card shadow p-4">
          <h4 className="mb-4">📊 Admin Dashboard</h4>

          <div className="d-flex flex-wrap gap-3">
            <Link to="/create-test" className="btn btn-success">
              ➕ Create Test
            </Link>

            <Link to="/schedule-test" className="btn btn-primary">
              🗓 Schedule Test
            </Link>

            <Link to="/test-requests" className="btn btn-warning">
              📩 Test Requests
            </Link>

            <Link to="/results" className="btn btn-info">
              📈 View Results
            </Link>

            {/* NEW BUTTON */}
            <Link to="/student" className="btn btn-dark">
              👨‍🎓 View All Students
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
