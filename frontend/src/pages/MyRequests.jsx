import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, Edit, Trash2, Delete } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const MyRequests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [mockAssignedItems, setMockAssignedItems] = useState([]);
  const api = import.meta.env.VITE_APP_URL_BACKEND;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    type: "",
    id: "",
    return_qty: "",
    received_qty: "",
  });

  // Fetch requests
  const fetchRequests = async () => {
    try {
      const response = await fetch(`${api}/api/specific_request/${user.id}`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    }
  };
  const id = JSON.parse(sessionStorage.getItem("currentUser"));
  // Fetch assigned items
  const fetchItems = async () => {
    try {
      const response = await fetch(`${api}/api/assign_site/${id?.id}`);
      const data = await response.json();
      setMockAssignedItems(data);
    } catch (error) {
      console.error("Error fetching assigned items:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchItems();
  }, []);
  console.log("id:", id?.id);

  const filteredRequests = Array.isArray(requests)
    ? requests.filter(
        (req) =>
          req.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredAssignItms = Array.isArray(mockAssignedItems)
    ? mockAssignedItems.filter(
        (req) =>
          req.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-500 text-white";
      case "Delivered":
        return "bg-blue-500 text-white";
      case "In Transit":
        return "bg-purple-500 text-white";
      case "Pending":
        return "bg-yellow-400 text-black";
      case "Rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-yellow-500 text-black";
      case "medium":
        return "bg-blue-400 text-white";
      case "low":
        return "bg-gray-300 text-black";
      default:
        return "bg-gray-300 text-black";
    }
  };

  const handleEdit = (type, item) => {
    setEditData({
      type,
      id: item.id,
      return_qty: item.return_qty || "",
      received_qty: item.received_qty || "",
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    console.log("Updated Data:", editData);
    setIsModalOpen(false);
    // You can send this updated data to your backend API here
  };
  const pendingRequests = filteredRequests.filter(
    (req) => req.status === "pending" || req.status === "dispatched"
  );

  const completedRequests = filteredRequests.filter(
    (req) => req.status === "completed" || req.status === "approved"
  );

  return (
    <div className="space-y-8 h-full px-4 md:px-8 lg:px-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Requests</h1>
        </div>
        <p className="text-gray-500">
          Welcome back, <span className="font-medium">{user?.name}</span>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { title: "Total Requests", value: 23, color: "text-foreground" },
          { title: "Approved", value: 8, color: "text-success" },
          { title: "Delivered", value: 5, color: "text-primary" },
          { title: "Pending", value: 7, color: "text-warning" },
          { title: "Rejected", value: 3, color: "text-destructive" },
        ].map((card, idx) => (
          <Card
            key={idx}
            className="hover:shadow-lg transition-shadow rounded-xl border border-gray-200 bg-white"
          >
            <CardContent className="p-5 text-center">
              <div className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-sm text-gray-500 mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 🟡 PENDING REQUESTS */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b">
            <CardTitle className="text-lg font-semibold text-black">
              Pending Requests
            </CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["ID", "Site", "Urgency", "Status", "Delivery"].map((h) => (
                    <th key={h} className="py-3 px-4 bg-yellow-300 text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-yellow-50">
                      <td className="px-4 py-2">{req.id}</td>
                    
                      <td className="px-4 py-2">{req.site?.name}</td>
                      <td className="px-4 py-2">
                        <Badge className={getUrgencyColor(req.urgency)}>
                          {req.urgency}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-black">{req.status}</td>

                      <td className="px-4 py-2">{req.deliveryDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">
                      No pending requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* 🟢 COMPLETED REQUESTS */}
        <Card className="shadow-lg rounded-xl">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-3 border-b">
            <CardTitle className="text-lg font-semibold text-black">
              Completed Requests
            </CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto p-4">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {["ID", "Date", "Site", "Urgency", "Status", "Delivery"].map(
                    (h) => (
                      <th key={h} className="py-3 px-4 bg-green-300 text-left">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {completedRequests.length > 0 ? (
                  completedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-green-50">
                      <td className="px-4 py-2">{req.id}</td>
                      <td className="px-4 py-2">
                        {req.created_at.split("T")[0]}
                      </td>
                      <td className="px-4 py-2">{req.site?.name}</td>
                      <td className="px-4 py-2">
                        <Badge className={getUrgencyColor(req.urgency)}>
                          {req.urgency}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">
                        <Badge className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2">{req.deliveryDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      No completed requests
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit {editData.type === "request" ? "Request" : "Assigned Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Return Quantity</Label>
              <Input
                value={editData.return_qty}
                onChange={(e) =>
                  setEditData({ ...editData, return_qty: e.target.value })
                }
                placeholder="Update Return quantity"
              />
            </div>
            <div>
              <Label>Received Quantity</Label>
              <Input
                value={editData.received_qty}
                onChange={(e) =>
                  setEditData({ ...editData, received_qty: e.target.value })
                }
                placeholder="Update Received Quantity"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyRequests;