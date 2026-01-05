import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Eye, MapPin } from "lucide-react";

const AssignedItems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedItems, setAssignedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const api = import.meta.env.VITE_APP_URL_BACKEND;

  const fetchItems = async () => {
    try {
      const response = await fetch(`${api}/api/assigned_items`);
      if (!response.ok) throw new Error("Failed to fetch items");
      const data = await response.json();
      setAssignedItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setAssignedItems([]);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filteredItems = assignedItems.filter((item) => {
    const id = item?.id?.toString() || "";
    const itemName = item?.product?.name?.toLowerCase() || "";
    const siteName = item?.site?.name?.toLowerCase() || "";

    return (
      id.includes(searchTerm.toLowerCase()) ||
      itemName.includes(searchTerm.toLowerCase()) ||
      siteName.includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500 text-white";
      case "In Transit":
        return "bg-blue-500 text-white";
      case "Pending":
        return "bg-yellow-500 text-black";
      case "Cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary rounded-lg">
          <MapPin className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold">Assigned Items List</h1>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assignment History</CardTitle>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-200">
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Item</th>
                  <th className="py-3 px-4 text-left">Qty</th>
                  <th className="py-3 px-4 text-left">Site</th>
                  {/* <th className="py-3 px-4 text-left">Status</th> */}
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-4">{item.id}</td>
                    <td className="py-3 px-4">
                      {item.created_at?.split("T")[0]}
                    </td>
                    <td className="py-3 px-4">{item.product?.name}</td>
                    <td className="py-3 px-4">{item.quantity}</td>
                    <td className="py-3 px-4">{item.site?.name}</td>
                    {/* <td className="py-3 px-4">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </td> */}
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* VIEW / UPDATE MODAL */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-5xl rounded-2xl p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">
              Assigned Items Details
            </h2>
    
          </div>

          {selectedItem && (
            <div className="px-8 py-6 space-y-6">
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-10 text-sm text-gray-700">
                <div>
                  <p className="font-bold text-black text-lg">Date</p>
                  <p className="text-lg">{selectedItem.created_at?.split("T")[0]}</p>
                </div>

                <div>
                  <p className="font-bold text-black text-lg">Delivery Site</p>
                  <p className="text-lg">{selectedItem.site?.name}</p>
                </div>

                <div>
                  <p className="font-bold text-black text-lg">Items</p>
                  <p className="text-lg">{selectedItem.product?.name}</p>
                </div>

                <div>
                  <p className="font-bold text-black text-lg">Quantity</p>
                  <p className="text-lg">{selectedItem.quantity}</p>
                </div>

                <div>
                  <p className="font-bold text-black text-lg">Status</p>
                  <span className="inline-block px-3 py-1 text-lg rounded-full bg-gray-100 text-gray-700">
                    {selectedItem.status}
                  </span>
                </div>

                <div>
                  <p className="font-bold text-black text-lg">Address</p>
                  <p className="text-lg">{selectedItem.site?.site_address}</p>
                </div>

                <div className="md:col-span-3">
                  <p className="font-bold text-black text-lg">Remarks</p>
                  <p className="text-lg">{selectedItem.notes || "-"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignedItems;