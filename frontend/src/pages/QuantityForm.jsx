
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const QuantityForm = () => {
  const api = import.meta.env.VITE_APP_URL_BACKEND;
  const [showDropdown, setShowDropdown] = useState(false);

  const { product, AllProducts, getStocks, stock = [] } = useAuth();
  const [formData, setFormData] = useState({
    productId: "",
    productIdReal: "",
    quantity: "",
  });

  const [items, setItems] = useState([]);

  const handleSelectChange = (e) => {
    setFormData((prev) => ({ ...prev, productId: e.target.value }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.productIdReal || !formData.quantity) {
      toast({
        title: "Validation Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch(api + "/api/store_stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: formData.productIdReal,
          qty: parseInt(formData.quantity),
        }),
      });
      if (!response.ok) throw new Error("Failed to add quantity");
      getStocks();
      toast({
        title: "Added",
        description: `Product ${formData.productIdReal} added with quantity ${formData.quantity}`,
      });

      setFormData({ productId: "", quantity: "" });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    toast({
      title: "Removed",
      description: "Item removed from list",
      variant: "destructive",
    });
  };
  const filteredInventory = product.filter((item) =>
    item.name.toLowerCase().includes(formData.productId.toLowerCase())
  );
  useEffect(() => {
    AllProducts();
    getStocks();
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Quantity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="space-y-4">
          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(categories).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subcategory *</Label>
              <Select
                value={formData.subcategory}
                onValueChange={(v) => handleSelectChange('subcategory', v)}
                disabled={!formData.category}
              >
                <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                <SelectContent>
                  {formData.category &&
                    categories[formData.category].map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>

          {/* Product ID & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input
                value={formData.productId}
                onChange={(e) => {
                  handleSelectChange(e); // updates formData.productId
                  setShowDropdown(true); // show dropdown when typing
                }}
                placeholder="Enter Product Name"
              />

              {/* Dropdown suggestions */}
              {showDropdown &&
                formData.productId &&
                filteredInventory.length > 0 && (
                  <div className="w-full max-h-40 border bg-white rounded mt-1 flex flex-col overflow-auto">
                    {filteredInventory.map((item) => (
                      <div key={item.id} className="text-left">
                        <p
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              productId: item.name, // display name
                              productIdReal: item.id, // store real id
                            }));
                            setShowDropdown(false); // close dropdown after selection
                          }}
                          className="cursor-pointer hover:bg-gray-200 px-4 py-1"
                        >
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="space-y-2">
              <Label>Quantity *</Label>
              <Input
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="bg-green-700 text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </form>

        {/* Added Items Table */}
        {stock.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-200">
                  <th className="text-left py-2 px-4">Category</th>
                  <th className="text-left py-2 px-4">Subcategory</th>
                  <th className="text-left py-2 px-4">Product Name</th>
                  <th className="text-left py-2 px-4">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {stock.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/50 hover:bg-blue-50"
                  >
                    <td className="py-2 px-4">{item.category}</td>
                    <td className="py-2 px-4">{item.subcategory}</td>
                    <td className="py-2 px-4">{item?.name}</td>
                    <td className="py-2 px-4">{item.qty || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuantityForm;
