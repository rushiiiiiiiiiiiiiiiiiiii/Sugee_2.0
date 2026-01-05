import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  PackagePlus,
  PackageMinus,
  ShoppingCart,
  Users,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Barcode,
} from "lucide-react";

const Dashboard = () => {
  const { user, Outwards, OutwardTransaction, product, users } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    OutwardTransaction();
  }, []);

  // ----------------------------
  // 🔢 CALCULATED COUNTS
  // ----------------------------
  const stats = useMemo(() => {
    const totalProducts = product.length;

    const dispatched = Outwards.filter(o => o.type === "dispatched");
    const completed = Outwards.filter(o => o.type === "completed");

    const mySiteItems =
      user?.role === "site_manager"
        ? Outwards.filter(o => o.site?.user_id === user.id)
        : [];

    return {
      totalProducts,
      totalOutwards: Outwards.length,
      dispatchedCount: dispatched.length,
      completedCount: completed.length,
      mySiteCount: mySiteItems.length,
    };
  }, [Outwards, product, user]);

  // ----------------------------
  // 🧠 ROLE BASED DASHBOARD
  // ----------------------------
  const dashboardData = {
    admin: {
      title: "Admin Dashboard",
      cards: [
        { title: "Total Products", value: stats.totalProducts, icon: Package },
        { title: "Outward Items", value: stats.totalOutwards, icon: PackageMinus },
        { title: "Completed", value: stats.completedCount, icon: TrendingUp },
        { title: "Users", value: users?.length || 0, icon: Users },
      ],
    },

    inward_executive: {
      title: "Inward Executive Dashboard",
      cards: [
        { title: "Products", value: stats.totalProducts, icon: Package },
        { title: "Inward Entries", value: stats.totalOutwards, icon: PackagePlus },
        { title: "Completed", value: stats.completedCount, icon: TrendingUp },
        { title: "Barcodes", value: stats.totalProducts, icon: Barcode },
      ],
    },

    outward_executive: {
      title: "Outward Executive Dashboard",
      cards: [
        { title: "Dispatched", value: stats.dispatchedCount, icon: PackageMinus },
        { title: "Completed", value: stats.completedCount, icon: TrendingUp },
        { title: "Total Outwards", value: stats.totalOutwards, icon: BarChart3 },
        { title: "Pending", value: stats.dispatchedCount, icon: AlertTriangle },
      ],
    },

    site_manager: {
      title: "Site Manager Dashboard",
      cards: [
        { title: "My Deliveries", value: stats.mySiteCount, icon: Package },
        { title: "Completed", value: stats.completedCount, icon: TrendingUp },
        { title: "Pending", value: stats.dispatchedCount, icon: AlertTriangle },
        { title: "This Month", value: stats.mySiteCount, icon: BarChart3 },
      ],
    },

    owner: {
      title: "Owner Dashboard",
      cards: [
        { title: "Products", value: stats.totalProducts, icon: Package },
        { title: "Outwards", value: stats.totalOutwards, icon: BarChart3 },
        { title: "Completed", value: stats.completedCount, icon: TrendingUp },
        { title: "Active Sites", value: users?.length || 0, icon: Users },
      ],
    },
  };

  const currentDashboard = dashboardData[user?.role] || dashboardData.admin;

  // ----------------------------
  // 🧾 FILTERED TABLE DATA
  // ----------------------------
  const filteredOutwards = Outwards
    .slice()
    .reverse()
    .filter((t) => {
      const productName = t.product?.name?.toLowerCase() || "";
      const siteName = t.site?.name?.toLowerCase() || "";
      return (
        productName.includes(searchQuery.toLowerCase()) ||
        siteName.includes(searchQuery.toLowerCase())
      );
    })
    .slice(0, 15);

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{currentDashboard.title}</h1>
        <p className="text-gray-600">
          Welcome, <b>{user?.name}</b>
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentDashboard.cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="rounded-xl">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-sm text-gray-500">
                  {card.title}
                </CardTitle>
                <Icon className="w-6 h-6 text-blue-600" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-center">{card.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">Latest Outward Transactions</h2>
          <input
            className="border rounded px-3 py-1"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Product</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Site</th>
              <th className="p-2">Status</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOutwards.map((o) => (
              <tr key={o.id} className="border-b">
                <td className="p-2">{o.product?.name}</td>
                <td className="p-2">{o.quantity}</td>
                <td className="p-2">{o.site?.name}</td>
                <td className="p-2 capitalize">{o.type}</td>
                <td className="p-2">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
