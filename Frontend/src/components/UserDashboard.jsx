import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  PackageCheck,
  Camera,
} from "lucide-react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BASE_URL = import.meta.env.VITE_API_URL;

const UserDashboard = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Hello");
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/inventory/low-stock`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((response) => {
        setItems(response.data.lowStock);
      })
      .catch((error) => {
        console.error("Error fetching low stock items:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/inventory-pie`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      })
      .then((response) => {
        setAllProducts(response.data.products || []);
      })
      .catch((error) => {
        console.error("Error fetching all products:", error);
      });
  }, []);

  const lowStockItems = items.filter((item) => item.quantity < 10);

  const dashboardItems = [
    {
      title: "View Inventory",
      icon: <PackageCheck className="w-6 h-6 text-indigo-600" />,
      description: "See a complete list of all inventory products.",
      path: "/user/inventory",
    },
    {
      title: "Scan Product",
      icon: <Camera className="w-6 h-6 text-indigo-600" />,
      description: "Scan barcodes, fetch product details, and purchase.",
      path: "/user/read",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleProductClick = (item) => {
    setSelectedProduct(item);
    setShowModal(true);
  };

  const pieData = allProducts
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      name: item.comp_code,
      value: item.quantity,
    }));

  const totalQuantity = pieData.reduce((sum, item) => sum + item.value, 0);

  const COLORS = [
    "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6",
    "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554",
  ];
const user = JSON.parse(localStorage.getItem("user"));
const username = user?.name || "User";
  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <div className="space-y-1 text-center">
        <h1 className="text-4xl font-bold text-blue-900 relative inline-block after:block after:h-1 after:bg-red-600 after:w-full after:mt-1">
          {greeting}, {username} 👋
        </h1>
        <p className="text-gray-500">Here’s a quick summary of your inventory.</p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dashboard Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Card
              key={index}
              onClick={() => handleNavigation(item.path)}
              className="cursor-pointer bg-white hover:shadow-xl transition rounded-2xl border border-gray-200 p-4 group"
            >
              <CardContent className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-full group-hover:bg-indigo-200 transition">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-700">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedProduct.comp_code} Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p><strong>Code:</strong> {selectedProduct.comp_code}</p>
              <p><strong>Description:</strong> {selectedProduct.description || 'N/A'}</p>
              <p><strong>Category:</strong> {selectedProduct.category || 'N/A'}</p>
              <p>
                <strong>Unit:</strong>{" "}
                {selectedProduct.unit_type === "Pack"
                  ? `Pack (${selectedProduct.pack_size})`
                  : selectedProduct.unit_type || "N/A"}
              </p>
              <p><strong>Weight:</strong> {selectedProduct.weight || 'N/A'}</p>
              <p><strong>Price:</strong> ₹{selectedProduct.price || 'N/A'}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserDashboard;
