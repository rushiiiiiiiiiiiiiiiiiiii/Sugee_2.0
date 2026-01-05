import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Eye } from "lucide-react";

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mockPurchaseOrders, setMockAssignedItems] = useState([]);
  const api = import.meta.env.VITE_APP_URL_BACKEND;
  
  const fetchItems = async () => {
    try {
      const response = await fetch(`${api}/api/get_purchase`);

      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }

      const data = await response.json();
      setMockAssignedItems(data);
      console.log("Assigned items:", data);
      return data;
    } catch (error) {
      console.error("Error fetching assigned items:", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);
  const filteredOrders = mockPurchaseOrders.filter((order) => {
    const id = order.id.toString(); // convert number to string
    const supplier = order.supplier?.toLowerCase() || "";

    // Join items array into a string (assuming items is an array of objects with a 'name' property)
    const itemsString = Array.isArray(order.items)
      ? order.items
          .map((item) => item.name)
          .join(" ")
          .toLowerCase()
      : "";

    const term = searchTerm.toLowerCase();

    return (
      id.includes(term) || supplier.includes(term) || itemsString.includes(term)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-success text-success-foreground";
      case "Pending":
        return "bg-warning text-warning-foreground";
      case "Rejected":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">45</div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">32</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">8</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">5</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Purchase Item List</CardTitle>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
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
                  {/* <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    PO ID
                  </th> */}
                  {/* <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Expected Delivery
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Supplier
                  </th> */}
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Items
                  </th>
                  {/* <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Sub Category
                  </th> */}
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Quantity
                  </th>
                  {/* <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th> */}
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Order Date
                  </th>
                  {/* <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    {/* <td className="py-3 px-4 font-medium text-foreground">
                      {order.id}
                    </td> */}
                    {/* <td className="py-3 px-4 text-muted-foreground">
                      {order.expected_delivery}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {order.supplier}
                    </td> */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {order.product_name}
                    </td>
                    {/* <td className="py-3 px-4 text-muted-foreground">
                      {order.category.category}
                    </td><td className="py-3 px-4 text-muted-foreground">
                      {order.sub_category.sub_category}
                    </td> */}

                    <td className="py-3 px-4 text-foreground">
                      {order.quantity}
                    </td>

                    {/* <td className="py-3 px-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td> */}
                    <td className="py-3 px-4 text-muted-foreground">
                      {order.created_at.split("T")[0]}
                    </td>
                    {/* <td className="py-3 px-4">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrders;