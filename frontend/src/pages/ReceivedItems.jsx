import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Truck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "@/hooks/use-toast";

const Receiveditems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [requestDetails, setRequestDetails] = useState([]);
  const [dispatchedQty, setDispatchedQty] = useState(0);
  const [details, setDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [assign, setassign] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const { user, Outwards, OutwardTransaction } = useAuth();
  const [confirmRemark, setConfirmRemark] = useState("");
  const [completedTransfers, setCompletedTransfers] = useState([]);

  // ✅ get all site ids for this site manager
  const siteIds = useMemo(() => {
    return allSites
      .filter((site) => site.user_id === user?.id)
      .map((site) => site.id);
  }, [allSites, user?.id]);
  // ✅ completed outward transactions for this site manager
  const completedOutwards = Outwards.filter(
    (order) => siteIds.includes(order.site?.id) && order.type === "completed"
  );

  const completedItems = [
    ...completedOutwards.map((item) => ({
      ...item,
      source: "outward",
    })),
    ...completedTransfers.map((item) => ({
      ...item,
      source: "transfer",
    })),
  ];

  const api = import.meta.env.VITE_APP_URL_BACKEND;
  console.log(user);
  const Request = async () => {
    try {
      const response = await fetch(api + "/api/get_request");
      const data = await response.json();
      setRequestDetails(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const assignList = async () => {
    try {
      const rsponse = await fetch(api + "/api/assigned_items");
      if (rsponse.ok) {
        const data = await rsponse.json();
        setassign(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const OrderDetails = (order) => {
    setDetails(order);
    setIsOpen(true);
  };

  const handleChange = (e) => {
    if (
      e.target.value >
      details.issued_qty -
        (details?.dispatched_qty > 0 ? details.dispatched_qty : 0)
    ) {
      alert("Dispatched quantity cannot exceed issued quantity");
      return;
    }
    setDispatchedQty(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (details.issued_qty < dispatchedQty) {
      alert("Dispatched quantity cannot exceed issued quantity");
      return;
    }
    try {
      const response = await fetch(api + `/api/update_request/${details.id}`, {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ dispatched_qty: parseInt(dispatchedQty) }),
      });

      if (response.ok) {
        await fetch(api + "/api/outward_transaction", {
          method: "post",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            request_id: details.id,
            product_id: details.product.id,
            site_id: details.site.id,
            quantity: dispatchedQty,
            type: "manual",
          }),
        });
        alert("Dispatched quantity updated successfully");
        setIsOpen(false);
        Request();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredOrders = requestDetails.filter((order) => {
    const search = searchTerm.toLowerCase();
    if (!search) {
      return order.status.toLowerCase() === "pending" || "dispatched";
    }
    return (
      order.status.toLowerCase().includes(search) ||
      order.site?.name.toLowerCase().includes(search) ||
      order.product?.name.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    Request();
    assignList();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await fetch(`${api}/api/get_site`);
      if (!response.ok)
        throw new Error(`Failed to fetch managers: ${response.status}`);
      const data = await response.json();
      setAllSites(data);
      console.log("all sites", data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch managers",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchSites();
  }, []);

  const fetchCompletedTransfers = async () => {
    try {
      const response = await fetch(`${api}/api/transfer/history`);
      const data = await response.json();

      const filtered = data.filter(
        (t) =>
          siteIds.includes(t.to_site_id) &&
          t.transfer_status === "site_to_site" &&
          t.status === "completed"
      );

      setCompletedTransfers(filtered);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (siteIds.length > 0) {
      fetchCompletedTransfers();
    }
  }, [siteIds]);

  const updateDispatchStatus = async (status) => {
    try {
      const response = await fetch(`${api}/api/dispatch/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispatch_id: details.id,
          status,
          remark: confirmRemark,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      toast({
        title: "Success",
        description:
          status === "completed"
            ? "Item marked as received"
            : "Item marked as damaged",
      });

      setIsOpen(false);
      setConfirmRemark("");
      // refresh list
      // ideally refetch Outwards
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update dispatch status",
        variant: "destructive",
      });
    }
  };
  const markAsCompleted = async () => {
    try {
      const response = await fetch(`${api}/api/dispatch/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispatch_id: details.id,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      toast({
        title: "Completed",
        description: "Item received successfully",
      });

      setIsOpen(false);
      OutwardTransaction();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark item as completed",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "In Transit":
        return "bg-blue-100 text-blue-700";
      case "Preparing":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "damaged":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ✅ filter dispatched items for only those sites
  const siteDispatchedItems = Outwards.filter((order) =>
    siteIds.includes(order.site?.id)
  );

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          All Receied Items
        </h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Shipments", value: 34, color: "text-black" },
          { label: "Delivered", value: 28, color: "text-black" },
          { label: "In Transit", value: 4, color: "text-black" },
          { label: "Preparing", value: 2, color: "text-black" },
        ].map((item, i) => (
          <Card
            key={i}
            className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </div>
              <p className="text-sm text-gray-500">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assign Item List */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              All Received Items List
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-blue-200">
                <tr>
                  {[
                    "Order ID",
                    "Date",
                    "Delivery Site",
                    "From Site", // ✅ NEW
                    "Transfer Status",
                    "Items",
                    "Quantity",
                    "Status",
                    // "Delivered By",
                    // "Dispatched Qty",
                    // "Actions",
                  ].map((head) => (
                    <th
                      key={head}
                      className="text-left py-3 px-4 font-semibold text-black"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completedItems.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium">{order.id}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {order.source === "outward"
                        ? order.created_at?.split("T")[0]
                        : order.transfer_date}
                    </td>

                    <td className="py-3 px-4">
                      {order.source === "outward"
                        ? order.site?.name
                        : order.to_site}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {order.source === "transfer" ? order.from_site : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
             
                      {order.source === "outward"
                        ? "from_warehouse"
                        : order.transfer_status}
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {order.source === "outward"
                        ? order.product?.name
                        : order.product}
                    </td>

                    <td className="py-3 px-4">
                      {order.source === "outward" ? order.quantity : order.qty}
                    </td>

                    <td className="py-3 px-4">
                      <Badge className={`${getStatusColor("Delivered")} px-3`}>
                        Completed
                      </Badge>
                    </td>

                    {/* <td className="py-3 px-4 text-gray-500">
                        {order.expected_delivery}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {order.dispatched_qty}
                      </td> */}
                    {/* <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => OrderDetails(order)} // ✅ PASS FULL OBJECT
                        >
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

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
          <div className="relative w-11/12 md:w-3/5 bg-white rounded-2xl shadow-2xl p-8 z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Dispatched Items Details
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {details && (
              <div className="space-y-6 text-sm text-gray-700">
                {/* INFO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-gray-500 font-medium">Date</p>
                    <p className="font-semibold text-gray-900">
                      {details.source === "outward"
                        ? details.created_at?.split("T")[0]
                        : details.transfer_date}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Delivery Site</p>
                    <p className="font-semibold text-gray-900">
                      {details.source === "outward"
                        ? details.product?.name
                        : details.product}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Item</p>
                    <p className="font-semibold text-gray-900">
                      {details.source === "outward"
                        ? details.site?.name
                        : details.to_site}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Quantity</p>
                    <p className="font-semibold text-gray-900">
                      {details.source === "outward"
                        ? details.quantity
                        : details.qty}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Status</p>
                    {/* <Badge className={`mt-1 ${getStatusColor(details.type)}`}>
                      {details.type}
                    </Badge> */}
                    <Badge>Completed</Badge>
                  </div>

                  <div>
                    <p className="text-gray-500 font-medium">Address</p>
                    <p className="font-semibold text-gray-900">
                      {details.source === "outward"
                        ? details.site?.site_address
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* ACTION SECTION */}
                {details.type === "dispatched" && (
                  <div className="border-t pt-6 flex justify-end">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded-lg shadow-sm"
                      onClick={markAsCompleted}
                    >
                      Mark as Completed
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Receiveditems;