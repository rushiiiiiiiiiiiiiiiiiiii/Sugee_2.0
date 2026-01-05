import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import AddProduct from "./pages/AddProduct";
import InwardOrders from "./pages/InwardOrders";
import OutwardOrders from "./pages/OutwardOrders";
import PurchaseOrders from "./pages/PurchaseOrders";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import AssignItems from "./pages/AssignItems";
import AssignedItems from "./pages/AssignedItems";
import SendItems from "./pages/SendItems";
import RequestProducts from "./pages/RequestProducts";
import MyRequests from "./pages/MyRequests";
import ReceivedItems from "./pages/ReceivedItems";
import SiteActivities from "./pages/SiteActivities";
import SiteManagers from "./pages/SiteManagers";
import CreatePurchaseOrder from "./pages/CreatePurchaseOrder";
import CreateBarcode from "./pages/CreateBarcode";
import Category from "./pages/Category"; // ✅ added
import QuantityFormPage from "./pages/QuantityForm"; // ✅ add this
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { useEffect, useState } from "react";
import Dispatched_Items_Site from "./pages/Dispatched_Items_Site";
import ProductReport from "./pages/ProductReport";

const queryClient = new QueryClient();
const api = import.meta.env.VITE_APP_URL_BACKEND;
const App = () => {
  const [data, setdata] = useState([]);
  const getcategory = async () => {
    try {
      const response = await fetch(api + "/api/get_category");
      const result = await response.json();
      if (response.ok) {
        setdata(result);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getcategory();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster className="" />
          <Sonner />
          <div className="min-h-screen bg-[#F4F6F8] text-black">
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                {/* Redirect root to dashboard */}
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        "admin",
                        "inward_executive",
                        "owner",
                        "purchase_manager",
                      ]}
                    >
                      <Layout>
                        <Inventory category={data} />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-product"
                  element={
                    <ProtectedRoute allowedRoles={["inward_executive"]}>
                      <Layout>
                        <AddProduct category={data} />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inward"
                  element={
                    <ProtectedRoute
                      allowedRoles={["admin", "inward_executive"]}
                    >
                      <Layout>
                        <InwardOrders />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/productreport"
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        "admin",
                        "outward_executive",
                        "outward_executive_inward_executive",
                      ]}
                    >
                      <Layout>
                        <ProductReport />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/outward"
                  element={
                    <ProtectedRoute
                      allowedRoles={["admin", "outward_executive"]}
                    >
                      <Layout>
                        <OutwardOrders />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/purchase-orders"
                  element={
                    <ProtectedRoute
                      allowedRoles={["admin", "purchase_manager"]}
                    >
                      <Layout>
                        <PurchaseOrders />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "owner"]}>
                      <Layout>
                        <Reports />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "it_admin"]}>
                      <Layout>
                        <Users />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assign-items"
                  element={
                    <ProtectedRoute allowedRoles={["inward_executive"]}>
                      <Layout>
                        <AssignItems />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/quantity-form"
                  element={
                    <ProtectedRoute allowedRoles={["inward_executive"]}>
                      <Layout>
                        <QuantityFormPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assigned-items"
                  element={
                    <ProtectedRoute allowedRoles={["inward_executive"]}>
                      <Layout>
                        <AssignedItems />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/send-items"
                  element={
                    <ProtectedRoute allowedRoles={["outward_executive"]}>
                      <Layout>
                        <SendItems />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/request-products"
                  element={
                    <ProtectedRoute allowedRoles={["site_manager"]}>
                      <Layout>
                        <RequestProducts />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-requests"
                  element={
                    <ProtectedRoute allowedRoles={["site_manager"]}>
                      <Layout>
                        <MyRequests />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dispatched-items"
                  element={
                    <ProtectedRoute allowedRoles={["site_manager"]}>
                      <Layout>
                        <Dispatched_Items_Site />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/received-items"
                  element={
                    <ProtectedRoute allowedRoles={["site_manager"]}>
                      <Layout>
                        <ReceivedItems />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/site-activities"
                  element={
                    <ProtectedRoute allowedRoles={["owner"]}>
                      <Layout>
                        <SiteActivities />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/site-managers"
                  element={
                    <ProtectedRoute allowedRoles={["it_admin"]}>
                      <Layout>
                        <SiteManagers />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-purchase-order"
                  element={
                    <ProtectedRoute allowedRoles={["purchase_manager"]}>
                      <Layout>
                        <CreatePurchaseOrder />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                {/* Barcode Page */}
                <Route
                  path="/barcode"
                  element={
                    <ProtectedRoute allowedRoles={["inward_executive"]}>
                      <Layout>
                        <CreateBarcode />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                {/* ✅ Category Management Page */}
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute
                      allowedRoles={["admin", "inward_executive"]}
                    >
                      <Layout>
                        <Category />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                {/* Catch-all 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
export default App;