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
import { Package, Plus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { useAuth } from "../context/AuthContext";

const AddProduct = () => {
  const api = import.meta.env.VITE_APP_URL_BACKEND;
  const [subcategory, setsubcategory] = useState([]);
  const [category, setcategory] = useState([]);
  const [clearLoading, setClearLoading] = useState(false);
  const { AllProducts } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sub_category_id: "",
    spec_1: "",
    spec_2: "",
    spec_3: "",
    spec_4: "",
    value: "",
    supplier: "",
    desc: "",
  });

  const [products, setProducts] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch all categories
  const categories = async () => {
    try {
      const response = await fetch(`${api}/api/category`);
      const result = await response.json();
      if (response.ok) setcategory(result);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch subcategories
  const subcategories = async (categoryId) => {
    if (!categoryId) {
      setsubcategory([]);
      return;
    }
    try {
      const response = await fetch(
        `${api}/api/get_specific_subcategory/${categoryId}`
      );
      const result = await response.json();
      if (response.ok) setsubcategory(result);
    } catch (error) {
      console.log(error);
    }
  };

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    if (name === "category_id") subcategories(value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category_id" && { sub_category_id: "" }),
    }));
  };

  // Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FRONTEND VALIDATION (REQUIRED FIELDS)
    if (
      !formData.category_id ||
      !formData.sub_category_id ||
      !formData.name.trim() ||
      !formData.value
    ) {
      toast({
        title: "Validation Error",
        description:
          "Category, Subcategory, Product Name, and Value are required.",
        variant: "destructive",
      });
      return; // ❌ STOP API CALL
    }

    setSubmitLoading(true);

    const payload = {
      name: formData.name.trim(),
      category_id: Number(formData.category_id),
      sub_category_id: Number(formData.sub_category_id),
      value: Number(formData.value),
      desc: formData.desc,
      spec_1: formData.spec_1,
      spec_2: formData.spec_2,
      spec_3: formData.spec_3,
      spec_4: formData.spec_4,
      supplier: formData.supplier,
    };

    try {
      const response = await fetch(`${api}/api/store_product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to add product");
      const result = await response.json();
      Details();
      toast({
        title: "Product Added Successfully",
        description: `${result.name} has been added to inventory`,
        variant: "success",
      });
      setProducts((prev) => [...prev, result]);
      setFormData({
        name: "",
        category_id: "",
        sub_category_id: "",
        spec_1: "",
        spec_2: "",
        spec_3: "",
        spec_4: "",
        value: "",
        supplier: "",
        desc: "",
      });
      AllProducts();
      Details();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fetch products

  const Details = async () => {
    try {
      const response = await fetch(`${api}/api/get_product`);
      const result = await response.json();
      if (response.ok) setProducts(result);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    categories();
    Details();
  }, []);

  // Delete product
  const handleDelete = async (id) => {
    try {
      const response = await fetch(api + "/api/delete/" + id, {
        method: "POST",
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Product Deleted successfully",
          variant: "success",
        });
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filteredProducts = formData.category_id
    ? products.filter(
        (p) =>
          p.category_id === Number(formData.category_id) ||
          p.sub_category_id === Number(formData.sub_category_id)
      )
    : products;

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-600 rounded-lg flex items-center justify-center">
          <Package className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
      </div>

      {/* Form Card */}
      <Card className="shadow-lg rounded-xl border border-gray-200">
        <CardHeader className="bg-gray-50 rounded-t-xl">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Product Information
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Name & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="category" className="mb-1 text-gray-700">
                  Category *
                </Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    handleSelectChange("category_id", Number(value))
                  }
                >
                  <SelectTrigger className="h-12 mt-1 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                    {category?.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="hover:bg-gray-100 cursor-pointer"
                      >
                        {c.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory (visible only if category selected) */}
              {formData.category_id && (
                <div>
                  <Label htmlFor="sub_category" className="mb-1 text-gray-700">
                    Sub Category *
                  </Label>
                  <Select
                    value={formData.sub_category_id}
                    onValueChange={(value) =>
                      handleSelectChange("sub_category_id", Number(value))
                    }
                  >
                    <SelectTrigger className="h-12 mt-1 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50">
                      <SelectValue placeholder="Select Subcategory" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                      {subcategory.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="hover:bg-gray-100 cursor-pointer"
                        >
                          {c.sub_category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="name" className="mb-1 text-gray-700">
                Product Name *
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter product name"
                className="h-12 mt-1 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            {/* Row 2: Value & Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="value" className="mb-1 text-gray-700">
                  Value (₹) *
                </Label>
                <Input
                  id="value"
                  name="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder="Enter value"
                  className="h-12 mt-1 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              {[1, 2, 3, 4].map((n) => (
                <div key={n}>
                  <Label htmlFor={`spec_${n}`} className="mb-1 text-gray-700">
                    Specification {n}
                  </Label>
                  <Input
                    id={`spec_${n}`}
                    name={`spec_${n}`}
                    value={formData[`spec_${n}`]}
                    onChange={handleInputChange}
                    placeholder={`spec ${n}`}
                    className="h-12 mt-1 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="mb-1 text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows={3}
                className="mt-1 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                type="submit"
                disabled={submitLoading}
                className={`h-12 px-6 flex items-center justify-center space-x-2 rounded-xl font-medium shadow-md transition-all
                    ${
                      submitLoading
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white active:scale-95"
                    }`}
              >
                {submitLoading ? (
                  <ClipLoader size={20} color="#fff" />
                ) : (
                  <span>Add</span>
                )}
              </Button>

              <Button
                type="button"
                onClick={() =>
                  setFormData({
                    name: "",
                    category_id: "",
                    sub_category_id: "",
                    spec_1: "",
                    spec_2: "",
                    spec_3: "",
                    spec_4: "",
                    value: "",
                    desc: "",
                  })
                }
                className="h-12 px-6 flex items-center justify-center rounded-xl font-medium shadow-md transition-all bg-red-400 hover:bg-red-500 text-white active:scale-95"
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      {filteredProducts.length > 0 && (
        <Card className="shadow-lg rounded-xl border border-gray-200">
          <CardHeader className="bg-gray-50 rounded-t-xl">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Products Table
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 text-base">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-4 py-2 text-left">Name</th>
                    <th className="border px-4 py-2 text-left">Category</th>
                    <th className="border px-4 py-2 text-left">Value (₹)</th>
                    <th className="border px-4 py-2 text-left">Description</th>
                    <th className="border px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="odd:bg-white even:bg-gray-50">
                      <td className="border px-4 py-2">{p.name}</td>
                      <td className="border px-4 py-2">
                        {p.category?.category}
                      </td>
                      <td className="border px-4 py-2">{p.value}</td>
                      <td className="border px-4 py-2">
                        {p.specification?.desc || ""}
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          onClick={() => handleDelete(p.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AddProduct; // ✅ This must be **outside the component function**