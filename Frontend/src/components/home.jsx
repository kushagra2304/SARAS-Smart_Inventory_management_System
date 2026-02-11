import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, PackageSearch, BarChart2, Lock, RefreshCw, Activity, AlertTriangle } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  const features = [
    { icon: <PackageSearch className="h-6 w-6 text-blue-600" />, text: "Barcode Scanning for real-time product lookup" },
    { icon: <Activity className="h-6 w-6 text-green-600" />, text: "Role-based dashboards (Admin, User, Stock User)" },
    { icon: <BarChart2 className="h-6 w-6 text-purple-600" />, text: "Smart Inventory Forecasting" },
    { icon: <AlertTriangle className="h-6 w-6 text-red-600" />, text: "Transaction logs and analytics" },
    { icon: <Lock className="h-6 w-6 text-gray-700" />, text: "Secure login system" },
    { icon: <RefreshCw className="h-6 w-6 text-yellow-600" />, text: "Product issuing & replenishment workflows" },
    // { icon: <CheckCircle className="h-6 w-6 text-teal-600" />, text: "Visual reports and insights for management" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-800">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-[#010D2A]">SARAS Inventory System</h1>
        <Button
          onClick={() => navigate("/login")}
          className="bg-[#010D2A] hover:bg-blue-950 text-white px-6 py-2 rounded-full shadow-md"
        >
          Login
        </Button>
      </nav>
      <section className="text-center py-16 px-6">
        <motion.h2
          className="text-4xl font-extrabold text-[#010D2A] mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to <span className="inline-block text-4xl font-bold text-sky-700 border-b-4 border-red-600 pb-1">
              SA <span className="text-red-600 text-5xl">R</span> AS
            </span>
        </motion.h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
          SARAS is a smart inventory management platform that helps organizations track, manage, 
          and forecast inventory across departments. With features like role-based access, barcode scanning, 
          low-stock alerts, and interactive dashboards, SARAS streamlines stock operations and improves accuracy.
        </p>
      </section>
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, idx) => (
          <Card key={idx} className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="flex items-center gap-4 p-6">
              {feature.icon}
              <span className="text-gray-700 font-medium">{feature.text}</span>
            </CardContent>
          </Card>
        ))}
      </section>
      <div className="text-center pb-16">
        <p className="text-lg text-gray-600 mb-4">
          This system aims to reduce manual effort, improve stock visibility, and streamline supply chains.
        </p>
        <Button
          size="lg"
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full shadow-lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
