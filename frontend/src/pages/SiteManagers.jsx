import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Edit, Trash2, MapPin } from "lucide-react";

const SiteManager = () => {
  const api = import.meta.env.VITE_APP_URL_BACKEND;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    user_id: "",
    siteName: "",
    siteAddress: "",
    siteDetails: "",
    managerName: "",
  });
  const [managers, setManagers] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [sites, setSites] = useState([
    {
      id: 1,
      user_id: 1,
      siteName: "Site A - Main Building",
      siteAddress: "123 Main St",
      siteDetails: "Main corporate building",
      managerName: "Mike Johnson",
      joinDate: "2023-06-15",
      status: "Active",
      totalRequests: 45,
      pendingRequests: 3,
    },
    {
      id: 2,
      user_id: 2,
      siteName: "Site B - Residential Complex",
      siteAddress: "456 Elm St",
      siteDetails: "Residential apartments",
      managerName: "Sarah Brown",
      joinDate: "2023-08-20",
      status: "Active",
      totalRequests: 38,
      pendingRequests: 2,
    },
  ]);

  // Fetch managers
  const fetchManagers = async () => {
    try {
      const response = await fetch(`${api}/api/getManagers`);
      if (!response.ok)
        throw new Error(`Failed to fetch managers: ${response.status}`);
      const data = await response.json();
      setManagers(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch managers",
        variant: "destructive",
      });
    }
  };
  // Fetch managers

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { user_id, siteName, siteAddress, managerName, siteDetails } =
      formData;

    // ✅ Frontend validation
    if (!user_id || !siteName || !siteAddress || !managerName) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // ✅ Backend payload
    const payload = {
      user_id,
      name: siteName,
      site_address: siteAddress,
      site_details: siteDetails,
    };

    try {
      const url = editingSite
        ? `${api}/api/update_site/${editingSite.id}`
        : `${api}/api/store_site`;

      const method = editingSite ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // ✅ Handle duplicate site name
      if (response.status === 409) {
        const res = await response.json();
        toast({
          title: "Duplicate Site",
          description: res.message || "Site name already exists",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend response:", data);

      // ✅ Refresh data
      fetchSites();

      toast({
        title: editingSite ? "Site Updated" : "Site Added",
        description: `${siteName} has been ${
          editingSite ? "updated" : "added"
        } successfully`,
      });

      // ✅ Reset form
      setFormData({
        user_id: "",
        siteName: "",
        siteAddress: "",
        siteDetails: "",
        managerName: "",
      });

      setEditingSite(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
    fetchManagers();
    fetchSites();
  }, []);

  const handleEdit = (site) => {
    setEditingSite(site);
    setFormData({
      user_id: site.user_id,
      siteName: site.name,
      siteAddress: site.site_address,
      siteDetails: site.site_details,
      managerName: site.user?.name || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (siteId, siteName) => {
    try {
      const response = await fetch(`${api}/api/delete_site/${siteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      toast({
        title: "Site Removed",
        description: `${siteName} has been removed`,
      });

      fetchSites();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete site",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = (siteId) => {
    setSites(
      sites.map((site) =>
        site.id === siteId
          ? {
              ...site,
              status: site.status === "Active" ? "Inactive" : "Active",
            }
          : site
      )
    );
  };

  const getStatusColor = (status) =>
    status === "Active"
      ? "bg-success text-success-foreground"
      : "bg-muted text-muted-foreground";

  return (
    <div className="space-y-6">
      {/* Header + Add Site Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Sites
        </h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() =>
                setFormData({
                  user_id: "",
                  siteName: "",
                  siteAddress: "",
                  siteDetails: "",
                  managerName: "",
                })
              }
            >
              <UserPlus className="h-4 w-4 mr-2" /> Add Site
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-md rounded-xl bg-white p-6 md:p-8 shadow-2xl border border-gray-200">
            <DialogHeader className="border-b pb-4 mb-4">
              <DialogTitle className="text-xl font-semibold text-gray-800">
                {editingSite ? "Edit Site" : "Add New Site"}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                {editingSite
                  ? "Update existing site details below."
                  : "Fill in the form to add a new site."}
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Site Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="siteName"
                  className="text-sm font-medium text-gray-700"
                >
                  Site Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="siteName"
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData({ ...formData, siteName: e.target.value })
                  }
                  placeholder="Enter site name"
                  required
                />
              </div>

              {/* Site Address */}
              <div className="space-y-2">
                <Label
                  htmlFor="siteAddress"
                  className="text-sm font-medium text-gray-700"
                >
                  Site Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="siteAddress"
                  value={formData.siteAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, siteAddress: e.target.value })
                  }
                  placeholder="Enter site address"
                  required
                />
              </div>

              {/* Site Details */}
              <div className="space-y-2">
                <Label
                  htmlFor="siteDetails"
                  className="text-sm font-medium text-gray-700"
                >
                  Site Details
                </Label>
                <textarea
                  id="siteDetails"
                  value={formData.siteDetails}
                  onChange={(e) =>
                    setFormData({ ...formData, siteDetails: e.target.value })
                  }
                  placeholder="Enter site details"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                  rows={3}
                />
              </div>

              {/* Manager Selection */}
              <div className="space-y-2">
                <Label
                  htmlFor="managerName"
                  className="text-sm font-medium text-gray-700"
                >
                  Manager <span className="text-red-500">*</span>
                </Label>
                <select
                  id="managerName"
                  value={formData.user_id}
                  onChange={(e) => {
                    const selected = managers.find(
                      (m) => m.id === Number(e.target.value)
                    );
                    setFormData({
                      ...formData,
                      user_id: selected?.id || "",
                      managerName: selected?.name || "",
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                  required
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingSite ? "Update Site" : "Add Site"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{sites.length}</div>
            <p className="text-sm text-muted-foreground">Total Sites</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {sites.filter((s) => s.status === "Active").length}
            </div>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {sites.reduce((sum, s) => sum + s.pendingRequests, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Pending Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {sites.reduce((sum, s) => sum + s.totalRequests, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Site Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-200">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Site Name
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Manager
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Address
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Join Date
                  </th>
                  {/* <th className="text-left py-3 px-4 font-medium text-muted-foreground">Requests</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th> */}
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allSites.map((site) => (
                  <tr
                    key={site.id}
                    className="border-b border-border/50 hover:bg-muted/30"
                  >
                    <td className="py-3 px-4 font-medium">{site.name}</td>
                    <td className="py-3 px-4">{site.user.name}</td>
                    <td className="py-3 px-4">{site.site_address}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {site.created_at}
                    </td>
                    {/* <td className="py-3 px-4">
                      <div>{site.totalRequests} total</div>
                      {site.pendingRequests > 0 && (<div className="text-sm text-warning">{site.pendingRequests} pending</div>)}
                    </td> */}
                    {/* <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" onClick={() => toggleStatus(site.id)}><Badge className={getStatusColor(site.status)}>{site.status}</Badge></Button>
                    </td> */}
                    <td className="py-3 px-4 flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(site)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(site.id, site.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
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

export default SiteManager;