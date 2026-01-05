import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { MapPin, Package, Loader2, Repeat } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const AssignItems = () => {
  const [formData, setFormData] = useState({
    product_id: "",
    site_id: "",
    item: "",
    quantity: "",
    expected_delivery: "",
    site: "",
    notes: "",
  });

  const api = import.meta.env.VITE_APP_URL_BACKEND;
  const [loading, setLoading] = useState(false);
  const [allSites, setAllSites] = useState([]);
  const { product, Outwards, AllProducts, getStocks, stock } = useAuth();

  const [sites, setSites] = useState([]);
  const [activeTab, setActiveTab] = useState("assign"); // 🔹 Tab state

  // fallback data
  const MOCK_SITES = [
    { id: 1, name: "Mock Site A", site_address: "123 Main St" },
    { id: 2, name: "Mock Site B", site_address: "Industrial Zone" },
  ];
  const MOCK_STOCK = [
    { product_id: 1, product: { name: "Hammer" }, qty: 50 },
    { product_id: 2, product: { name: "Cement Bags" }, qty: 100 },
    { product_id: 3, product: { name: "Steel Rods" }, qty: 200 },
  ];

  useEffect(() => {
    AllProducts();
  }, []);

  const handleSubmitItems = async (e) => {
    e.preventDefault();

    if (!formData.item || !formData.quantity || !formData.site) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const selectedSite = allSites.find((s) => s.name === formData.site);

      const payload = {
        product_id: Number(formData.item), // ✅ selected product id
        site_id: selectedSite?.id,
        quantity: Number(formData.quantity),
        expected_delivery: formData.expected_delivery,
        notes: formData.notes,
      };

      const response = await axios.post(`${api}/api/assign_items`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Items assigned successfully!",
        });
        setFormData({
          item: "",
          quantity: "",
          expected_delivery: "",
          site: "",
          notes: "",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to assign items.",
          variant: "destructive",
        });
      }
      getStocks();
    } catch (error) {
      console.error("Error posting data:", error);
      toast({
        title: "Error",
        description: "Something went wrong while assigning items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
  // const fetchDestination = async () => {
  //   try {
  //     const response = await fetch(`${api}/api/transfer_stock`);
  //     if (!response.ok) throw new Error("Failed to fetch sites");
  //     const result = await response.json();

  //     if (Array.isArray(result) && result.length > 0) setSites(result);
  //     else setSites(MOCK_SITES);
  //   } catch (err) {
  //     console.error("Error fetching sites:", err);
  //     setSites(MOCK_SITES);
  //   }
  // };

  useEffect(() => {
    // fetchDestination();
    getStocks();
  }, []);

  const displayStock = Outwards?.length > 0 ? Outwards : MOCK_STOCK;
 const displayPro = product?.length > 0 ? product : MOCK_STOCK;
  // 🟢 Transfer State
  const [transferData, setTransferData] = useState({
    fromSite: "",
    toSite: "",
    product_id: "",
    quantity: "",
  });

  // ⬇⬇⬇ ONLY CHANGE IS INSIDE handleTransfer ⬇⬇⬇

    const handleTransfer = async (e) => {
      e.preventDefault();

      if (
        !transferData.fromSite ||
        !transferData.toSite ||
        !transferData.product_id ||
        !transferData.quantity
      ) {
        toast({
          title: "Missing Information",
          description: "Please fill in all fields to transfer items.",
          variant: "destructive",
        });
        return;
      }

      if (transferData.fromSite === transferData.toSite) {
        toast({
          title: "Invalid Transfer",
          description: "Cannot transfer between the same site.",
          variant: "destructive",
        });
        return;
      }

      try {
        const fromSiteObj = allSites.find(
          (s) => s.name === transferData.fromSite
        );
        const toSiteObj = allSites.find((s) => s.name === transferData.toSite);

        if (!fromSiteObj || !toSiteObj) {
          toast({
            title: "Invalid Site",
            description: "Selected site not found.",
            variant: "destructive",
          });
          return;
        }

        // 🔥 Find the selected assign_items record
        const selectedAssignItem = transferProducts.find(
          (item) => item.id === Number(transferData.product_id)
        );

        if (!selectedAssignItem || !selectedAssignItem.product) {
          toast({
            title: "Invalid Product",
            description: "Selected product not found for this site.",
            variant: "destructive",
          });
          return;
        }

        const payload = {
          from_site_id: fromSiteObj.id,
          to_site_id: toSiteObj.id,
          product_id: selectedAssignItem.product.id, // ✅ REAL product id
          qty: Number(transferData.quantity),
          assign_item_id: selectedAssignItem.id, // 🔥 CRITICAL
        };

        const response = await axios.post(`${api}/api/transfer_stock`, payload, {
          headers: { "Content-Type": "application/json" },
        });

        if (response.status === 200) {
          toast({
            title: "Transfer Successful",
            description: `Transferred ${transferData.quantity} items successfully.`,
          });

          getStocks(); // refresh assigned items
        } else {
          toast({
            title: "Transfer Failed",
            description: "Unable to transfer items.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Transfer error:", error);
        toast({
          title: "Error",
          description:
            error.response?.data?.message ||
            "Something went wrong while transferring items.",
          variant: "destructive",
        });
      }

      setTransferData({
        fromSite: "",
        toSite: "",
        product_id: "",
        quantity: "",
      });
    };
  const [transferProducts, setTransferProducts] = useState([]);
  useEffect(() => {
    if (!transferData.fromSite) {
      setTransferProducts([]);
      return;
    }

    const fromSiteObj = allSites.find((s) => s.name === transferData.fromSite);

    if (!fromSiteObj) {
      setTransferProducts([]);
      return;
    }

    // ✅ Filter assigned items based on selected FROM site
    const filtered = Outwards.filter((item) => item.site.id === fromSiteObj.id);

    setTransferProducts(filtered);
  }, [transferData.fromSite, Outwards, allSites]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary rounded-lg">
          <MapPin className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Site Inventory Management
        </h1>
      </div>

      {/* Tabs */}  
      <div className="flex border-b mb-4 space-x-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "assign"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("assign")}
        >
          Assign Items to Sites
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "transfer"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("transfer")}
        >
          Transfer Between Sites
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "assign" ? (
        // 🔹 Original Assign Items Form
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitItems} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="item">Select Item *</Label>
                      <select
                        id="item"
                        value={formData.item}
                        onChange={(e) =>
                          setFormData({ ...formData, item: e.target.value })
                        }
                        className="w-full h-12 px-3 border rounded-xl"
                      >
                        <option value="">-- Choose an item --</option>
                        {displayPro.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name || "Unknown"} (Stock: {item?.qty})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="Enter quantity"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="expected_delivery">
                        Expected Delivery Date *
                      </Label>
                      <Input
                        id="expected_delivery"
                        type="date"
                        value={formData.expected_delivery}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expected_delivery: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="site">Destination Site *</Label>
                      <select
                        id="site"
                        value={formData.site}
                        onChange={(e) =>
                          setFormData({ ...formData, site: e.target.value })
                        }
                        className="w-full h-12 px-3 border rounded-xl"
                      >
                        <option value="">-- Select site --</option>
                        {allSites.map((site) => (
                          <option key={site.id} value={site.name}>
                            {site.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Add any special instructions"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex gap-6">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      ) : (
                        <Package className="h-5 w-5 mr-2" />
                      )}
                      {loading ? "Assigning..." : "Assign Items"}
                    </Button>

                    <Button
                      type="button"
                      onClick={() =>
                        setFormData({
                          item: "",
                          quantity: "",
                          expected_delivery: "",
                          site: "",
                          notes: "",
                        })
                      }
                      variant="destructive"
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Available Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayStock.map((item) => (
                    <div
                      key={item.product_id}
                      className="p-3 bg-muted rounded-lg"
                    >
                      <div className="font-medium text-foreground">
                        {item?.product?.name || "Unknown"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Stock: {item.product?.qty || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // 🔸 Site-to-Site Transfer Form
        <Card className="border-primary shadow-md">
          <CardHeader className="flex items-center space-x-2">
            <Repeat className="text-primary h-5 w-5" />
            <CardTitle>Transfer Items Between Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>From Site *</Label>
                  <select
                    value={transferData.fromSite}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        fromSite: e.target.value,
                      })
                    }
                    className="w-full h-12 px-3 border rounded-xl"
                  >
                    <option value="">-- Select source site --</option>
                    {allSites.map((site) => (
                      <option key={site.id} value={site.name}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>To Site *</Label>
                  <select
                    value={transferData.toSite}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        toSite: e.target.value,
                      })
                    }
                    className="w-full h-12 px-3 border rounded-xl"
                  >
                    <option value="">-- Select destination site --</option>
                    {allSites.map((site) => (
                      <option key={site.id} value={site.name}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Item *</Label>
                  <select
                    value={transferData.product_id}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        product_id: e.target.value,
                      })
                    }
                    className="w-full h-12 px-3 border rounded-xl"
                  >
                    <option value="">-- Select item --</option>
                    {transferProducts.length > 0 ? (
                      transferProducts
                        .filter((item) => item.product !== null) // 🔥 IMPORTANT
                        .map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.product.name} ( Stock:{" "}
                            {item.quantity - (item.dispatched_qty ?? 0)})
                          </option>
                        ))
                    ) : (
                      <option disabled>No products available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={transferData.quantity}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      quantity: e.target.value,
                    })
                  }
                  placeholder="Enter quantity"
                />
              </div>

              <Button
                type="submit"
                className="h-12 px-6 bg-green-600 hover:bg-green-700"
              >
                <Repeat className="mr-2 h-5 w-5" /> Transfer Items
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignItems;