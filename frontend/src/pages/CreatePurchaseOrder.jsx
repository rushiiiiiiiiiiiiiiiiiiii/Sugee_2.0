import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CreatePurchaseOrder = () => {
  const api = import.meta.env.VITE_APP_URL_BACKEND;
  const { user } = useAuth(); // ✅ supplier from auth

  const [product, setProduct] = useState([]);
  const [showDropdownIndex, setShowDropdownIndex] = useState(null);

  const [formData, setFormData] = useState([
    {
      product_name: "",
      product_id: null,
      category: null,
      sub_category: null,
      quantity: "",
    },
  ]);

  /* ================= FETCH PRODUCTS ================= */
  const AllProducts = async () => {
    try {
      const response = await fetch(api + "/api/get_product");
      const result = await response.json();
      if (response.ok) {
        setProduct(result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    AllProducts();
  }, []);

  /* ================= ADD / REMOVE ITEM ================= */
  const addOrderItem = () => {
    setFormData([
      ...formData,
      {
        product_name: "",
        product_id: null,
        category: null,
        sub_category: null,
        quantity: "",
      },
    ]);
  };

  const removeOrderItem = (index) => {
    if (formData.length === 1) return;
    setFormData(formData.filter((_, i) => i !== index));
  };

  /* ================= UPDATE ITEM ================= */
  const updateItem = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const invalid = formData.some(
      (item) =>
        !item.product_id ||
        !item.category ||
        !item.sub_category ||
        !item.quantity
    );

    if (invalid) {
      toast({
        title: "Validation Error",
        description: "Please select a product and enter quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        items: formData.map((item) => ({
          supplier: user?.id || "unknown", // ✅ from auth
          category: item.category,
          sub_category: item.sub_category,
          product_id: item.product_id,
          product_name: item.product_name, // ✅ required by table
          quantity: Number(item.quantity),
          received_qty: 0, // ✅ initial
          expected_delivery: "2025-12-31", // ✅ static for now
          notes: "initial purchase", // ✅ static
        })),
      };

      const res = await fetch(`${api}/api/Purchase_order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      toast({
        title: "Success",
        description: "Purchase order created successfully",
      });

      setFormData([
        {
          product_name: "",
          product_id: null,
          category: null,
          sub_category: null,
          category_name: "",
          subcategory_name: "",
          quantity: "",
        },
      ]);
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to create purchase order",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <ShoppingCart /> Create Purchase Items
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Expected Purchase Items</CardTitle>
            <Button type="button" variant="outline" onClick={addOrderItem}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {formData.map((item, index) => {
              const filteredProducts = product.filter((p) =>
                p.name.toLowerCase().includes(item.product_name.toLowerCase())
              );

              return (
                <div key={index} className="border p-4 rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Item {index + 1}</h4>
                    {formData.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeOrderItem(index)}
                      >
                        <Trash2 className="text-red-500" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* PRODUCT AUTOSUGGEST */}
                    <div className="relative">
                      <Label>Product *</Label>
                      <Input
                        value={item.product_name}
                        placeholder="Type product name"
                        onChange={(e) => {
                          updateItem(index, "product_name", e.target.value);
                          updateItem(index, "product_id", null);
                          updateItem(index, "category", null);
                          updateItem(index, "sub_category", null);
                          setShowDropdownIndex(index);
                        }}
                      />

                      {showDropdownIndex === index &&
                        item.product_name &&
                        filteredProducts.length > 0 && (
                          <div className="absolute z-10 bg-white border w-full max-h-40 overflow-auto rounded">
                            {filteredProducts.map((p) => (
                              <div
                                key={p.id}
                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  updateItem(index, "product_name", p.name);
                                  updateItem(index, "product_id", p.id);
                                  updateItem(index, "category", p.category_id);
                                  updateItem(
                                    index,
                                    "sub_category",
                                    p.sub_category_id
                                  );

                                  // ✅ STORE NAMES FOR DISPLAY
                                  updateItem(
                                    index,
                                    "category_name",
                                    p.category?.category || ""
                                  );
                                  updateItem(
                                    index,
                                    "subcategory_name",
                                    p.subcategory?.sub_category || ""
                                  );

                                  setShowDropdownIndex(null);
                                }}
                              >
                                {p.name}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* QUANTITY */}
                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                      />
                    </div>

                    {/* INFO */}
                    <div className="text-sm text-gray-600 pt-7">
                      {item.product_id && (
                        <>
                          <p>
                            <b>Category:</b>{" "}
                            <span className="text-gray-800 font-medium">
                              {item.category_name}
                            </span>
                          </p>  
                          <p>
                            <b>Subcategory:</b>{" "}
                            <span className="text-gray-800 font-medium">
                              {item.subcategory_name}
                            </span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Button type="submit">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Submit Purchase Items
        </Button>
      </form>
    </div>
  );
};

export default CreatePurchaseOrder;