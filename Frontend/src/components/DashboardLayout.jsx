import { Link, useNavigate } from "react-router-dom";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Inventory System</h2>
        <ul>
          <li className="mb-2">
            <Link to="/dashboard" className="hover:text-gray-400">
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <button onClick={handleLogout} className="text-red-400 hover:text-red-600">
              Logout
            </button>
          </li>
        </ul>
      </div>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};

export default DashboardLayout;
