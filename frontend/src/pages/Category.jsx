import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Plus } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const Category = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [newRadio, setNewRadio] = useState("existing"); // default selected
  const [showSuggestions, setShowSuggestions] = useState(false);
  const api = import.meta.env.VITE_APP_URL_BACKEND;

  const filteredInventory = categories.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-success text-success-foreground";
      case "Low Stock":
        return "bg-warning text-warning-foreground";
      case "Out of Stock":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleAddCategory = async () => {
    try {
      const data = await fetch(api + "/api/store_category", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          category: newCategory,
          sub_category: newSubCategory,
        }),
      });
      if (data.ok) {
        getCategory();
        setNewCategory("");
        setNewSubCategory("");
        setOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCategory = async () => {
    try {
      const response = await fetch(api + "/api/get_category");
      const result = await response.json();
      if (response.ok) {
        setCategories(result);
        setNewCategory("");
        setNewSubCategory("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">
          Inventory Management
        </h1>
        <Button className="bg-primary hover:bg-primary/90 text-black font-medium rounded-lg px-5 py-2 shadow-sm transition-all duration-200">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Store Items</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Add Category Modal */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button className="border border-gray-400 text-gray-700 rounded-lg px-4 py-2 font-medium hover:bg-gray-100 transition-colors duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md bg-white border border-gray-400 rounded-2xl shadow-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Add New Category
                    </DialogTitle>
                  </DialogHeader>

                  {/* Radio buttons */}
                  <div className="flex justify-evenly">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="radiobtn"
                        value="existing"
                        id="existing"
                        checked={newRadio === "existing"}
                        onChange={(e) => setNewRadio(e.target.value)}
                      />
                      <label htmlFor="existing">Existing</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="radiobtn"
                        value="new"
                        id="new"
                        checked={newRadio === "new"}
                        onChange={(e) => setNewRadio(e.target.value)}
                      />
                      <label htmlFor="new">New</label>
                    </div>
                  </div>

                  {/* Input fields */}
                  <div className="space-y-4 py-4 relative">
                    <Input
                      placeholder="Category Name"
                      value={newCategory}
                      onChange={(e) => {
                        setNewCategory(e.target.value);
                        if (newRadio === "existing") setShowSuggestions(true);
                      }}
                      onBlur={() => {
                        if (newRadio === "existing") {
                          const match = categories.find(
                            (c) =>
                              c.category?.category.toLowerCase() ===
                              newCategory.toLowerCase()
                          );
                          if (!match) setNewCategory(""); // clear invalid entry
                          setShowSuggestions(false); // close dropdown
                        }
                      }}
                      className="bg-gray-50 text-gray-900 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary rounded-lg px-3 py-2"
                    />

                    {/* Suggestions dropdown */}
                    {newRadio === "existing" &&
                      newCategory.length > 0 &&
                      showSuggestions && (
                        <div className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-full max-h-40 overflow-y-auto mt-1">
                          {[
                            ...new Set(
                              categories
                                .filter((data) =>
                                  data.category?.category
                                    ?.toLowerCase()
                                    .includes(newCategory.toLowerCase())
                                )
                                .map((data) =>
                                  data.category?.category?.toLowerCase()
                                )
                            ),
                          ].map((uniqueName, id) => (
                            <div
                              key={id}
                              onMouseDown={() => {
                                setNewCategory(
                                  categories.find(
                                    (c) =>
                                      c.category?.category?.toLowerCase() ===
                                      uniqueName
                                  )?.category?.category || ""
                                );
                                setShowSuggestions(false);
                              }}
                              className="cursor-pointer px-3 py-2 hover:bg-blue-50 text-gray-700 transition"
                            >
                              {uniqueName.charAt(0).toUpperCase() +
                                uniqueName.slice(1)}
                            </div>
                          ))}
                        </div>
                      )}

                    <Input
                      placeholder="Subcategory Name"
                      value={newSubCategory}
                      onChange={(e) => setNewSubCategory(e.target.value)}
                      className="bg-gray-50 text-gray-900 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary rounded-lg px-3 py-2"
                    />
                  </div>

                  <DialogFooter className="flex justify-end">
                    <Button
                      onClick={handleAddCategory}
                      disabled={
                        newRadio === "existing" && newCategory.trim() === ""
                      }
                      className="bg-primary hover:bg-primary/90 text-black font-medium rounded-lg px-6 py-2 shadow-md transition-all duration-200 flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-200">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Subcategory
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Created at
                  </th>
                  {/* <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Status
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border/50 hover:bg-blue-50"
                  >
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.category.category}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.sub_category}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {item.created_at.split("T")[0]}
                    </td>
                    {/* <td className="py-3 px-4">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
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

export default Category;