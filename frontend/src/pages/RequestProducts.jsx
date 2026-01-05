import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const RequestProducts = () => {
  const { user, product, AllProducts, stock = [], getStocks } = useAuth();
  const [allSites, setAllSites] = useState({});
  const [requestItems, setRequestItems] = useState([
    {
      item: "",
      quantity: "",
      urgency: "",
      reason: "",
    },
  ]);
  const api = import.meta.env.VITE_APP_URL_BACKEND;

  const [requestDetails, setRequestDetails] = useState({
    siteId: sessionStorage.getItem("currentUser")
      ? JSON.parse(sessionStorage.getItem("currentUser")).id
      : "",
    deliveryDate: "",
  });
  const urgencyLevels = [
    { value: "low", label: "Low - Can wait 1 week" },
    { value: "medium", label: "Medium - Need within 3 days" },
    { value: "high", label: "High - Need within 24 hours" },
    { value: "critical", label: "Critical - Immediate need" },
  ];

  const addRequestItem = () => {
    setRequestItems([
      ...requestItems,
      {
        item: "",
        quantity: "",
        urgency: "",
        reason: "",
      },
    ]);
  };

  const removeRequestItem = (index) => {
    if (requestItems.length > 1) {
      setRequestItems(requestItems.filter((_, i) => i !== index));
    }
  };

  const updateRequestItem = (index, field, value) => {
    let updatedValue = value;

    // if (field === 'item') {
    //   const selectedStock = stock.find(s => s.product_id === parseInt(value));
    // }

    if (field === "quantity") {
      const selectedItem = requestItems[index].item;
      const selectedStock = stock.find(
        (s) => s.product_id === parseInt(selectedItem)
      );

      if (selectedStock) {
        const maxQty = selectedStock.qty || 0;
        if (parseInt(value) > maxQty) {
          toast({
            title: "Quantity Limit Exceeded",
            description: `You cannot request more than ${maxQty} units for this product.`,
            variant: "destructive",
          });
          updatedValue = maxQty; // ✅ Reset to max allowed
        }
      }
    }

    const updatedItems = requestItems.map((item, i) =>
      i === index ? { ...item, [field]: updatedValue } : item
    );

    setRequestItems(updatedItems);
  };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate request details
    if (!requestDetails.siteId || !requestDetails.deliveryDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all request details",
        variant: "destructive",
      });
      return;
    }

    // Validate request items
    const incompleteItems = requestItems.some(
      (item) => !item.item || !item.quantity || !item.urgency
    );

    if (incompleteItems) {
      toast({
        title: "Validation Error",
        description: "Please complete all item details",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        items: requestItems.map((item) => ({
          site_id: Number(requestDetails.siteId),
          requestDate: new Date().toISOString().split("T")[0],
          deliveryDate: requestDetails.deliveryDate,
          product_request_id: Number(item.item), // ✅ FIXED
          issued_qty: Number(item.quantity),
          urgency: item.urgency,
          remark: item.reason || null,
        })),
      };

      const response = await fetch(api + "/api/store_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // ✅ send JSON
      });

      const data = await response.json();
      console.log(data);
      toast({
        title: "Request Submitted Successfully",
        description: `Request for ${requestItems.length} item(s) has been submitted`,
      });
    } catch (error) {
      console.error("Error submitting request:", error);
    }

    // Reset form
    setRequestItems([
      {
        item: "",
        quantity: "",
        urgency: "",
        reason: "",
      },
    ]);
    setRequestDetails({
      siteId: localStorage.getItem("currentUser")
        ? JSON.parse(localStorage.getItem("currentUser")).id
        : "",
      requestDate: "",
      deliveryDate: "",
      additionalNotes: "",
    });
  };
  useEffect(() => {
    if (!stock.length) {
      getStocks();
    }
  }, [stock.length]);

  useEffect(() => {
    AllProducts();
  }, []);

  const managerSites = Array.isArray(allSites)
    ? allSites.filter((site) => site.user_id === user?.id)
    : [];
  useEffect(() => {
    if (
      managerSites.length === 1 &&
      requestDetails.siteId !== managerSites[0].id
    ) {
      setRequestDetails((prev) => ({
        ...prev,
        siteId: managerSites[0].id,
      }));
    }
  }, [managerSites, requestDetails.siteId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary rounded-lg">
          <ShoppingCart className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Request Products</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Request Details */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Preferred Delivery Date *</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={requestDetails.deliveryDate}
                  onChange={(e) =>
                    setRequestDetails({
                      ...requestDetails,
                      deliveryDate: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Requested Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                onClick={addRequestItem}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requestItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    {requestItems.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRequestItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2 flex flex-col">
                      <Label>Item *</Label>
                      <select
                        className="p-2 border rounded-md"
                        value={item.item}
                        onChange={(e) =>
                          updateRequestItem(index, "item", e.target.value)
                        }
                      >
                        <option value="">Select Option</option>

                        {stock.map((availableItem) => (
                          <option
                            key={availableItem.id}
                            value={availableItem.id} // ✅ product id
                          >
                            {availableItem.name} (Stock:{" "}
                            {availableItem.qty || 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        placeholder="Enter quantity"
                        value={item.quantity}
                        onChange={(e) =>
                          updateRequestItem(index, "quantity", e.target.value)
                        }
                        required
                      />
                    </div>
                    {managerSites.length > 1 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Select Site <span className="text-red-500">*</span>
                        </Label>

                        <div className="relative">
                          <select
                            className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={requestDetails.siteId}
                            onChange={(e) =>
                              setRequestDetails({
                                ...requestDetails,
                                siteId: e.target.value,
                              })
                            }
                          >
                            <option value="">Choose site</option>
                            {managerSites.map((site) => (
                              <option key={site.id} value={site.id}>
                                {site.name}
                              </option>
                            ))}
                          </select>

                          {/* dropdown arrow */}
                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            ▼
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 flex flex-col">
                      <Label>Urgency *</Label>
                      <select
                        className="p-2 border rounded-md"
                        value={item.urgency} // correct state
                        onChange={(e) =>
                          updateRequestItem(index, "urgency", e.target.value)
                        } // update urgency
                      >
                        <option value="">Select urgency</option>
                        {urgencyLevels.map((level, id) => (
                          <option key={id} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Input
                        placeholder="Purpose of request"
                        value={item.reason}
                        onChange={(e) =>
                          updateRequestItem(index, "reason", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-3">
          <Button type="submit" className="bg-primary hover:bg-primary-hover">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setRequestItems([
                { item: "", quantity: "", urgency: "", reason: "" },
              ]);
              setRequestDetails({ siteId: "", deliveryDate: "" });
            }}
          >
            Clear All
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestProducts;
