import React, { useState, useEffect } from "react";
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
import { Truck, Send } from "lucide-react";

const SendItems = () => {
  const [formData, setFormData] = useState({
    site_id: "",
    product_id: "",
    quantity: "",
    request_id: "",
    type: "assign",
  });

  const [mockAssignedItems, setMockAssignedItems] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProductData, setSelectedProductData] = useState(null);

  const api = import.meta.env.VITE_APP_URL_BACKEND;

  // ✅ Fetch assigned items from backend
  const fetchSites = async () => {
    try {
      const response = await fetch(`${api}/api/assigned_items`);
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }

      const data = await response.json();
      setMockAssignedItems(data);
    } catch (error) {
      console.error("Error fetching assigned items:", error);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  // ✅ Filter products based on selected site
  useEffect(() => {
    if (formData.site) {
      const filtered = mockAssignedItems.filter(
        (item) => item.site.name === formData.site
      );
      setFilteredProducts(filtered);
      setFormData((prev) => ({ ...prev, product: "", quantity: "" }));
    } else {
      setFilteredProducts([]);
    }
  }, [formData.site, mockAssignedItems]);

  // ✅ When product changes, find its data to limit quantity input
  useEffect(() => {
    if (formData.product) {
      const found = filteredProducts.find(
        (p) => p.product.name === formData.product
      );
      setSelectedProductData(found || null);
    } else {
      setSelectedProductData(null);
    }
  }, [formData.product, filteredProducts]);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.site ||
      !formData.product ||
      !formData.quantity ||
      !formData.deliveryDateTime
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find selected assigned item (this has id, site, product, etc.)
      const selectedAssignedItem = mockAssignedItems.find(
        (item) =>
          item.site.name === formData.site &&
          item.product.name === formData.product
      );

      if (!selectedAssignedItem) {
        toast({
          title: "Invalid Data",
          description: "Selected site or product not found in assigned items.",
          variant: "destructive",
        });
        return;
      }

      // Prepare payload for outward transaction
      const payload = {
        site_id: selectedAssignedItem.site.id,
        product_id: selectedAssignedItem.product.id,
        quantity: Number(formData.quantity),
        delivery_datetime: formData.deliveryDateTime,
        request_id: selectedAssignedItem.id,
        type: "dispatched",
      };

      const response = await fetch(`${api}/api/outward_transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to send data");
      }
      const res = await fetch(`${api}/api/send_assign_item/${selectedAssignedItem.id}`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({dispatched_qty:Number(formData.quantity)}),
      })
      console.log(res)  
      const result = await response.json();

      toast({
        title: "Items Dispatched Successfully 🎉",
        description: `${formData.quantity} of ${formData.product} dispatched to ${formData.site} (Request ID: ${selectedAssignedItem.id}).`,
      });

      // Reset form
      setFormData({
        site: "",
        product: "",
        quantity: "",
        deliveryDateTime: "",
        remarks: "",
      });
      setSelectedProductData(null);
    } catch (error) {
      console.error("Error dispatching items:", error);
      toast({
        title: "Dispatch Failed",
        description:
          error.message || "Something went wrong while sending data.",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
  if (formData.site) {
    const filtered = mockAssignedItems.filter(
      (item) => item.site.name === formData.site
    );
    setFilteredProducts(filtered);
    setFormData((prev) => ({ ...prev, product: "", quantity: "" }));
  } else {
    setFilteredProducts([]);
  }
}, [formData.site, mockAssignedItems]);


  return (
    <div className="space-y-6 ml-40">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary rounded-lg">
          <Truck className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Send Items to Sites
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dispatch Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Site Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800 tracking-wide">
                    Select Site <span className="text-red-500">*</span>
                  </Label>

                  <Select
                    value={formData.site}
                    onValueChange={(value) =>
                      setFormData({ ...formData, site: value })
                    }
                  >
                    <SelectTrigger className="w-full px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 hover:shadow-md">
                      <SelectValue placeholder="Choose a Site" />
                    </SelectTrigger>

                    <SelectContent className="bg-white rounded-xl shadow-lg border border-gray-200 mt-1">
                      {[
                        ...new Set(mockAssignedItems.map((i) => i.site.name)),
                      ].map((site) => (
                        <SelectItem
                          key={site}
                          value={site}
                          className="px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md cursor-pointer transition-colors duration-150"
                        >
                          {site}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-800 tracking-wide">
                    Select Product <span className="text-red-500">*</span>
                  </Label>

                  <Select
                    value={formData.product}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product: value, quantity: "" })
                    }
                    disabled={!formData.site}
                  >
                    <SelectTrigger
                      className={`w-full px-4 py-2 text-gray-800 bg-white border rounded-xl shadow-sm transition-all duration-200 ${
                        formData.site
                          ? "border-gray-300 hover:border-gray-400 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          : "border-gray-200 bg-gray-100 cursor-not-allowed text-gray-400"
                      }`}
                    >
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>

                    <SelectContent className="bg-white rounded-xl shadow-lg border border-gray-200 mt-1 max-h-60 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.product.name}
                            className="px-4 py-2 text-black hover:bg-blue-50 hover:text-blue-700 rounded-md cursor-pointer transition-colors duration-150"
                          >
                            <div className="flex justify-between">
                              <span>{p.product.name}</span>
                              <span className="pl-1 text-sm text-black hover:text-blue-700 rounded-md cursor-pointer transition-colors duration-150">
                                (Qty: {p.quantity})
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm italic">
                          No products for this site
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Quantity */}
                <Input
                  type="number"
                  placeholder={
                    selectedProductData
                      ? `Max: ${selectedProductData.quantity-selectedProductData.dispatched_qty}`
                      : "Enter quantity"
                  }
                  value={formData.quantity}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (
                      !selectedProductData ||
                      Number(value) <= selectedProductData.quantity
                    ) {
                      setFormData({ ...formData, quantity: value });
                    }
                  }}
                  disabled={!formData.product}
                  required
                />
                {selectedProductData && (
                  <div>
                  <p className="text-xs text-gray-500">
                    Maximum allowed: {selectedProductData.quantity-selectedProductData.dispatched_qty}
                  </p>
                  <p className="text-xs text-gray-500">
                    Dispatched Quantity: {selectedProductData.dispatched_qty}
                  </p>
                  </div>
                )}

                {/* Delivery Date */}
                <div className="space-y-2">
                  <Label>Delivery Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.deliveryDateTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryDateTime: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                {/* Remarks
                <div className="space-y-2">
                  <Label>Remarks</Label>
                  <Textarea
                    placeholder="Add remarks"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    rows={3}
                  />
                </div> */}

                {/* Buttons */}
                <div className="flex space-x-3">
                  <Button type="submit" className="bg-primary">
                    <Send className="h-4 w-4 mr-2" />
                    Dispatch Items
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormData({
                        site: "",
                        product: "",
                        quantity: "",
                        deliveryDateTime: "",
                        remarks: "",
                      })
                    }
                  >
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SendItems;