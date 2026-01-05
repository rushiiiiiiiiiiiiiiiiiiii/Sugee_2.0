import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, Truck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "@/hooks/use-toast";

const OutwardOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [requestDetails, setRequestDetails] = useState([]);
  const [dispatchedQty, setDispatchedQty] = useState(0);
  const [details, setDetails] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [assign, setassign] = useState([]);

  // ✅ ADDED
  const [modalMode, setModalMode] = useState(null); // "dispatch" | "complete"

  const { Outwards, OutwardTransaction } = useAuth();
  const api = import.meta.env.VITE_APP_URL_BACKEND;

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

  // ✅ UPDATED (mode-aware)
  const OrderDetails = (order, mode) => {
    setDetails(order);
    setModalMode(mode);
    setDispatchedQty(0);
    setIsOpen(true);
  };

  const handleChange = (e) => {
    const remaining =
      details.issued_qty -
      (details?.dispatched_qty > 0 ? details.dispatched_qty : 0);

    if (e.target.value > remaining) {
      toast("Dispatched quantity cannot exceed issued quantity");
      return;
    }
    setDispatchedQty(e.target.value);
  };

  // ✅ DISPATCH REQUESTED ITEM
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (details.issued_qty < dispatchedQty) {
      toast("Dispatched quantity cannot exceed issued quantity");
      return;
    }

    try {
      const response = await fetch(api + `/api/update_request/${details.id}`, {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dispatched_qty: parseInt(dispatchedQty), // ✅ ONLY NEW QTY
        }),
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
            type: "dispatched", // ✅ FIXED
          }),
        });

        toast("Item dispatched successfully");
        setIsOpen(false);
        Request();
        OutwardTransaction();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ MARK AS COMPLETED (Dispatched Item)
  const markAsCompleted = async () => {
    try {
      await fetch(api + "/api/dispatch/complete", {
        method: "post",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dispatch_id: details.id,
        }),
      });

      toast("Item marked as completed");
      setIsOpen(false);
      OutwardTransaction();
    } catch (error) {
      console.log(error);
    }
  };
  const fetchSiteTransfers = async () => {
    try {
      const response = await fetch(`${api}/api/transfer/history`);
      const data = await response.json();

      // only transfers RECEIVED by this manager's sites
      const filtered = data.filter(
        (t) =>
          siteIds.includes(t.to_site_id) &&
          t.transfer_status === "site_to_site" &&
          t.status === "dispatched"
      );

      setSiteTransfers(filtered);
    } catch (error) {
      console.error(error);
    }
  };
  const filteredOrders = requestDetails.filter((order) => {
    const search = searchTerm.toLowerCase();
    if (!search) {
      return order.status.toLowerCase() === "pending";
    }
    if (order.status.toLowerCase() !== "completed") {
      return (
        order.status.toLowerCase().includes(search) ||
        order.site?.name.toLowerCase().includes(search) ||
        order.product?.name.toLowerCase().includes(search)
      );
    }
  });

  useEffect(() => {
    Request();
    assignList();
  }, []);

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
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Outward Orders
        </h1>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5">
          <Truck className="h-4 w-4 mr-2" />
          Schedule Delivery
        </Button>
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
      {/* Requested Item List */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Requested Item List
            </CardTitle>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 rounded-lg border-gray-300"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <table className="w-full border-collapse text-sm">
            <thead className="bg-blue-200">
              <tr>
                {[
                  "Order ID",
                  "Date",
                  "Delivery Site",
                  "Items",
                  "Quantity",
                  "Status",
                  "Delivered By",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="py-3 px-4 font-semibold text-black">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{order.id}</td>
                  <td className="py-3 px-4">
                    {order.created_at.split("T")[0]}
                  </td>
                  <td className="py-3 px-4">{order.site.name}</td>
                  <td className="py-3 px-4">{order.product?.name}</td>
                  <td className="py-3 px-4">
                    {order.issued_qty - (parseInt(order.dispatched_qty) || 0)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge>{order.status}</Badge>
                  </td>
                  <td className="py-3 px-4">{order.deliveryDate}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => OrderDetails(order, "dispatch")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dispatched Item List */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Dispatched Item List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="bg-blue-200 text-left">
              <tr>
                {[
                  "Order ID",
                  "Date",
                  "Delivery Site",
                  "Items",
                  "Quantity",
                  "Status",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="py-3 px-4 font-semibold text-black">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Outwards?.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{order.id}</td>
                  <td className="py-3 px-4">
                    {order.created_at.split("T")[0]}
                  </td>
                  <td className="py-3 px-4">{order.site?.name}</td>
                  <td className="py-3 px-4">{order.product?.name}</td>
                  <td className="py-3 px-4">{order?.quantity}</td>
                  <td className="py-3 px-4">
                    <Badge>{order?.type}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => OrderDetails(order, "complete")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal */}
      {isOpen && details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative w-11/12 md:w-3/5 bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex justify-between mb-6">
              {modalMode === "dispatch" ? (
                <h2 className="text-2xl font-semibold">
                  Requested Items Details
                </h2>
              ) : (
                <h2 className="text-2xl font-semibold">
                  Dispatched Item Details
                </h2>
              )}
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6 mb-8 text-base text-gray-800">
              <div>
                <p className="text-sm text-gray-500 font-medium">Site</p>
                <p className="text-lg font-semibold text-gray-900">
                  {details.site.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium">Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {details.created_at.split("T")[0]}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium">Item</p>
                <p className="text-lg font-semibold text-gray-900">
                  {details.product?.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium">Quantity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {details.issued_qty ?? details.quantity}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium">Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  {details.type || details.status}
                </p>
              </div>
            </div>

            {/* DISPATCH MODE */}
            {modalMode === "dispatch" && (
              <form onSubmit={handleSubmit} className="border-t pt-6">
                <h4 className="text-md font-semibold pb-2">
                  Dispatch Requested Quantity
                </h4>

                <Input
                  type="number"
                  placeholder="Dispatch Quantity"
                  value={dispatchedQty}
                  onChange={handleChange}
                />
                <div className="flex justify-end mt-4">
                  <Button>Dispatch</Button>
                </div>
              </form>
            )}

            {/* COMPLETE MODE */}
            {/* {modalMode === "complete" && details.type === "dispatched" && (
              <div className="border-t pt-6 flex justify-end">
                <Button
                  className="bg-green-600 text-white"
                  onClick={markAsCompleted}
                >
                  Mark as Completed
                </Button>
              </div>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutwardOrders;
// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Search, Eye, Truck } from "lucide-react";
// import { useAuth } from "../context/AuthContext";
// const OutwardOrders = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [requestDetails, setRequestDetails] = useState([]);
//   const [dispatchedQty, setDispatchedQty] = useState(0);
//   const [details, setDetails] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [assign, setassign] = useState([]);
//   const { Outwards } = useAuth();
//   const api = import.meta.env.VITE_APP_URL_BACKEND;

//   const Request = async () => {
//     try {
//       const response = await fetch(api + "/api/get_request");
//       const data = await response.json();
//       setRequestDetails(data);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const assignList = async () => {
//     try {
//       const rsponse = await fetch(api + "/api/assigned_items");
//       if (rsponse.ok) {
//         const data = await rsponse.json();
//         setassign(data);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const OrderDetails = (order) => {
//     setDetails(order);
//     setIsOpen(true);
//   };

//   const handleChange = (e) => {
//     if (
//       e.target.value >
//       details.issued_qty -
//         (details?.dispatched_qty > 0 ? details.dispatched_qty : 0)
//     ) {
//       toast("Dispatched quantity cannot exceed issued quantity");
//       return;
//     }
//     setDispatchedQty(e.target.value);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (details.issued_qty < dispatchedQty) {
//       toast("Dispatched quantity cannot exceed issued quantity");
//       return;
//     }
//     try {
//       const response = await fetch(api + `/api/update_request/${details.id}`, {
//         method: "post",
//         headers: { "content-type": "application/json" },
//         body: JSON.stringify({ dispatched_qty: parseInt(dispatchedQty) }),
//       });

//       if (response.ok) {
//         await fetch(api + "/api/outward_transaction", {
//           method: "post",
//           headers: { "content-type": "application/json" },
//           body: JSON.stringify({
//             request_id: details.id,
//             product_id: details.product.id,
//             site_id: details.site.id,
//             quantity: dispatchedQty,
//             type: "manual",
//           }),
//         });
//         toast("Dispatched quantity updated successfully");
//         setIsOpen(false);
//         Request();
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const filteredOrders = requestDetails.filter((order) => {
//     const search = searchTerm.toLowerCase();
//     if (!search) {
//       return order.status.toLowerCase() === "pending" || "dispatched";
//     }
//     return (
//       order.status.toLowerCase().includes(search) ||
//       order.site?.name.toLowerCase().includes(search) ||
//       order.product?.name.toLowerCase().includes(search)
//     );
//   });

//   useEffect(() => {
//     Request();
//     assignList();
//   }, []);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Delivered":
//         return "bg-green-100 text-green-700";
//       case "In Transit":
//         return "bg-blue-100 text-blue-700";
//       case "Preparing":
//         return "bg-yellow-100 text-yellow-800";
//       case "Cancelled":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-gray-100 text-gray-600";
//     }
//   };

//   return (
//     <div className="space-y-8 p-4 md:p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//           Outward Orders
//         </h1>
//         <Button className="bg-blue-600 hover:bg-blue-700 text-white px-5">
//           <Truck className="h-4 w-4 mr-2" />
//           Schedule Delivery
//         </Button>
//       </div>

//       {/* Summary cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {[
//           { label: "Total Shipments", value: 34, color: "text-black" },
//           { label: "Delivered", value: 28, color: "text-black" },
//           { label: "In Transit", value: 4, color: "text-black" },
//           { label: "Preparing", value: 2, color: "text-black" },
//         ].map((item, i) => (
//           <Card
//             key={i}
//             className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
//           >
//             <CardContent className="p-4 text-center">
//               <div className={`text-2xl font-bold ${item.color}`}>
//                 {item.value}
//               </div>
//               <p className="text-sm text-gray-500">{item.label}</p>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Orders Table */}
//       <Card className="shadow-sm border border-gray-200">
//         <CardHeader className="pb-2">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-lg font-semibold">
//               Requested Item List
//             </CardTitle>
//             <div className="relative">
//               <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//               <Input
//                 placeholder="Search orders..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 w-64 rounded-lg border-gray-300"
//               />
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse text-sm">
//               <thead className="bg-blue-200">
//                 <tr>
//                   {[
//                     "Order ID",
//                     "Date",
//                     "Delivery Site",
//                     "Items",
//                     "Quantity",
//                     "Status",
//                     "Delivered By",
//                     "Actions",
//                   ].map((head) => (
//                     <th
//                       key={head}
//                       className="text-left py-3 px-4 font-semibold text-black"
//                     >
//                       {head}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredOrders.map((order) => (
//                   <tr
//                     key={order.id}
//                     className="border-b hover:bg-gray-50 transition"
//                   >
//                     <td className="py-3 px-4 font-medium">{order.id}</td>
//                     <td className="py-3 px-4 text-gray-500">
//                       {order.created_at.split("T")[0]}
//                     </td>
//                     <td className="py-3 px-4">{order.site.name}</td>
//                     <td className="py-3 px-4 text-gray-600">
//                       {order.product?.name}
//                     </td>
//                     <td className="py-3 px-4">
//                       {parseInt(order.issued_qty) -
//                         (parseInt(order.dispatched_qty) || 0)}
//                     </td>
//                     <td className="py-3 px-4">
//                       <Badge className={`${getStatusColor(order.status)} px-3`}>
//                         {order.status}
//                       </Badge>
//                     </td>
//                     <td className="py-3 px-4 text-gray-500">
//                       {order.deliveryDate}
//                     </td>
//                     <td className="py-3 px-4">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => OrderDetails(order)}
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Assign Item List */}
//       <Card className="shadow-sm border border-gray-200">
//         <CardHeader className="pb-2">
//           <div className="flex items-center justify-between">
//             <CardTitle className="text-lg font-semibold">
//               Dispatched Item List
//             </CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse text-sm">
//               <thead className="bg-blue-200">
//                 <tr>
//                   {[
//                     "Order ID",
//                     "Date",
//                     "Delivery Site",
//                     "Items",
//                     "Quantity",
//                     "Type",
//                     // "Delivered By",
//                     // "Dispatched Qty",
//                     "Actions",
//                   ].map((head) => (
//                     <th
//                       key={head}
//                       className="text-left py-3 px-4 font-semibold text-black"
//                     >
//                       {head}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {Outwards.map((order) => (
//                   <tr
//                     key={order.id}
//                     className="border-b hover:bg-gray-50 transition"
//                   >
//                     <td className="py-3 px-4 font-medium">{order.id}</td>
//                     <td className="py-3 px-4 text-gray-500">
//                       {order.created_at.split("T")[0]}
//                     </td>
//                     <td className="py-3 px-4">{order.site.name}</td>
//                     <td className="py-3 px-4 text-gray-600">
//                       {order.site.name}
//                     </td>
//                     <td className="py-3 px-4">{order.quantity}</td>
//                     <td className="py-3 px-4">
//                       <Badge className={`${getStatusColor(order.status)} px-3`}>
//                         {order.type}
//                       </Badge>
//                     </td>
//                     {/* <td className="py-3 px-4 text-gray-500">
//                       {order.expected_delivery}
//                     </td>
//                     <td className="py-3 px-4 text-gray-600">
//                       {order.dispatched_qty}
//                     </td> */}
//                     <td className="py-3 px-4">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => OrderDetails(order)} // ✅ PASS FULL OBJECT
//                       >
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Modal */}
//       {isOpen && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
//           <div className="relative w-11/12 md:w-3/5 bg-white rounded-2xl shadow-2xl p-8 z-10">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-2xl font-semibold text-gray-800">
//                 Dispatched Items Details
//               </h2>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ✕
//               </button>
//             </div>
//             {details && (
//               <>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-700">
//                   <p>
//                     <span className="font-semibold text-gray-900">Date:</span>{" "}
//                     {details.created_at.split("T")[0]}
//                   </p>
//                   <p>
//                     <span className="font-semibold text-gray-900">
//                       Delivery Site:
//                     </span>{" "}
//                     {details.site.name}
//                   </p>
//                   <p>
//                     <span className="font-semibold text-gray-900">Items:</span>{" "}
//                     {details.product?.name}
//                   </p>
//                   <p>
//                     <span className="font-semibold text-gray-900">
//                       Quantity:
//                     </span>{" "}
//                     {details.issued_qty}
//                   </p>
//                   <p>
//                     <span className="font-semibold text-gray-900">Status:</span>{" "}
//                     <Badge className={getStatusColor(details.type)}>
//                       {details.type}
//                     </Badge>
//                   </p>
//                   <p>
//                     <span className="font-semibold text-gray-900">
//                       Address:
//                     </span>{" "}
//                     {details.site.site_address}
//                   </p>
//                 </div>

//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default OutwardOrders