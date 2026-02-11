import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import axios from "axios";
import upgov from "../assets/upgov.jpg"; 
const BASE_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    if (newRole) {
      setRole(newRole);
      setError("");
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await axios.post(
      `${BASE_URL}/login`,
      { email, password, role },
      { withCredentials: true }
    );

    localStorage.setItem("jwtToken", res.data.token);
    localStorage.setItem("role", res.data.user.role);

    const userRole = res.data.user.role;
    if (userRole === "admin") navigate("/admin");
    else if (userRole === "user") navigate("/user");
    else if (userRole === "stock_operator") navigate("/stock");
    else navigate("/dashboard");
  } catch (err) {
    console.error("Login Error:", err);
    setError(err.response?.data?.message || "Invalid email or password!");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 px-4">
      <Card className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
        <CardHeader className="flex items-center justify-between">
    <img 
      src="/upgov1.jpg" 
      alt="Logo"
      className="w-20 h-20 object-contain"
    />
          <CardTitle className="text-center text-2xl font-bold text-[#010D2A]">
            
            <span className="inline-block text-4xl font-bold text-[#010D2A] border-b-4 border-red-600 pb-1">
              SA <span className="text-red-600 text-5xl">R</span> AS
            </span>

          </CardTitle>
        </CardHeader>

        <CardContent>
          <ToggleGroup
            type="single"
            value={role}
            onValueChange={handleRoleChange}
            className="mb-6 flex justify-center space-x-2"
          >
            <ToggleGroupItem
              value="admin"
              className={`px-4 py-2 rounded-full text-sm ${role === "admin"
                  ? "bg-[#010D2A] text-white shadow-md border border-[#010D2A]"
                  : "bg-gray-200 text-gray-700"
                }`}
            >
              Admin
            </ToggleGroupItem>

            <ToggleGroupItem
              value="stock_operator"
              className={`px-4 py-2 rounded-full text-sm ${role === "stock_operator"
                  ? "bg-[#010D2A] text-white shadow-md border border-[#010D2A]"
                  : "bg-gray-200 text-gray-700"
                }`}
            >
              Stock User
            </ToggleGroupItem>

            <ToggleGroupItem
              value="user"
              className={`px-4 py-2 rounded-full text-sm ${role === "user"
                  ? "bg-[#010D2A] text-white shadow-md border border-[#010D2A]"
                  : "bg-gray-200 text-gray-700"
                }`}
            >
              User
            </ToggleGroupItem>
          </ToggleGroup>


          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full px-4 py-2 border border-gray-300"
              required
              autoComplete="off"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-full px-4 py-2 border border-gray-300"
              required
              autoComplete="off"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-[#010D2A] hover:bg-blue-950 text-white py-2 rounded-full"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
