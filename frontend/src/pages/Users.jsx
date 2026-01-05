import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Edit, Trash2, Shield } from 'lucide-react';

const Users = () => {
  const { users, addUser, deleteUser, updateUserRole,  ExistingUsers } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    mobile: '',
    role: ''
  });
  console.log(users)

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'inward_executive', label: 'Inward Executive' },
    { value: 'outward_executive', label: 'Outward Executive' },
    { value: 'site_manager', label: 'Site Manager' },
    { value: 'owner', label: 'Owner' },
    { value: 'it_admin', label: 'IT Admin' },
    { value: 'purchase_manager', label: 'Purchase Manager' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.role || (!editingUser && !formData.password)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingUser) {
      updateUserRole(editingUser.id, formData.role);
      toast({
        title: "User Updated",
        description: `${formData.name}'s role has been updated`,
      });
    } else {
      addUser(formData);
      toast({
        title: "User Created",
        description: `${formData.name} has been added successfully`,
      });
    }

    setFormData({ name: '', username: '', password: '', role: '', mobile: '' });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      mobile: user.mobile || '',
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (userId, userName) => {
    deleteUser(userId);
    toast({
      title: "User Deleted",
      description: `${userName} has been removed from the system`,
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'owner': return 'bg-primary text-primary-foreground';
      case 'it_admin': return 'bg-accent text-accent-foreground';
      case 'inward_executive': return 'bg-success text-success-foreground';
      case 'outward_executive': return 'bg-warning text-warning-foreground';
      case 'site_manager': return 'bg-muted text-muted-foreground';
      case 'purchase_manager': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  useEffect(()=>{
    ExistingUsers()
  },[])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
    User Management
  </h1>

  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogTrigger asChild>
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md px-4 py-2"
        onClick={() => {
          setEditingUser(null);
          setFormData({ name: '', username: '', password: '', role: '', mobile: '' });
        }}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>
    </DialogTrigger>

  <DialogContent className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 md:p-8 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto text-gray-800">
  {/* Header */}
  <DialogHeader className="mb-4 text-center">
    <DialogTitle className="text-2xl font-extrabold text-blue-700 tracking-tight">
      {editingUser ? 'Edit User' : 'Create New User'}
    </DialogTitle>
    <p className="text-sm text-gray-500 mt-1">
      {editingUser
        ? 'Update user details below.'
        : 'Fill out the details to add a new user.'}
    </p>
  </DialogHeader>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <Label htmlFor="name" className="font-semibold text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name"
            className="mt-2 border-gray-300 focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        {/* Username */}
        <div>
          <Label htmlFor="username" className="font-semibold text-gray-700">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Enter username"
            className="mt-2 border-gray-300 focus:ring-2 focus:ring-blue-400"
            disabled={editingUser}
            required
          />
        </div>

        {/* Mobile */}
        <div>
          <Label htmlFor="mobile" className="font-semibold text-gray-700">
            Mobile Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="mobile"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            placeholder="Enter mobile number"
            className="mt-2 border-gray-300 focus:ring-2 focus:ring-blue-400"
            disabled={editingUser}
            required
          />
        </div>

        {/* Password */}
        {!editingUser && (
          <div>
            <Label htmlFor="password" className="font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              className="mt-2 border-gray-300 focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
        )}

        {/* Role */}
        <div>
          <Label htmlFor="role" className="font-semibold text-gray-700">
            Role <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value })}
          >
            <SelectTrigger className="mt-2 border-gray-300 focus:ring-2 focus:ring-blue-400">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-md rounded-xl">
              {roles.map((role) => (
                <SelectItem
                  key={role.value}
                  value={role.value}
                  className="hover:bg-blue-50 cursor-pointer"
                >
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md"
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            System Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-200">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Username</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium text-foreground">{user.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.username}</td>
                    <td className="py-3 px-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id, user.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default Users;