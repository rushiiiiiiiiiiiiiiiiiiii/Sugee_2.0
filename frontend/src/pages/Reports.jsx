import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Package, DollarSign } from 'lucide-react';

const Reports = () => {
  const monthlyOrdersData = [
    { month: 'Jan', inward: 45, outward: 38, purchase: 22 },
    { month: 'Feb', inward: 52, outward: 45, purchase: 28 },
    { month: 'Mar', inward: 38, outward: 42, purchase: 18 },
    { month: 'Apr', inward: 48, outward: 39, purchase: 25 },
    { month: 'May', inward: 55, outward: 48, purchase: 32 },
    { month: 'Jun', inward: 42, outward: 45, purchase: 20 },
  ];

  const inventoryValueData = [
    { month: 'Jan', value: 125000 },
    { month: 'Feb', value: 135000 },
    { month: 'Mar', value: 128000 },
    { month: 'Apr', value: 142000 },
    { month: 'May', value: 155000 },
    { month: 'Jun', value: 148000 },
  ];

  const categoryDistribution = [
    { name: 'Construction', value: 45, color: '#3B82F6' },
    { name: 'Plumbing', value: 25, color: '#10B981' },
    { name: 'Electrical', value: 15, color: '#F59E0B' },
    { name: 'Finishing', value: 10, color: '#EF4444' },
    { name: 'Carpentry', value: 5, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Monthly Reports</h1>
        <Button className="bg-primary hover:bg-primary-hover">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <div className="text-2xl font-bold text-foreground">342</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <div className="text-2xl font-bold text-foreground">$148K</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Growth Rate</p>
                <div className="text-2xl font-bold text-foreground">+12.5%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Sites</p>
                <div className="text-2xl font-bold text-foreground">8</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Orders Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Orders Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyOrdersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inward" fill="#3B82F6" name="Inward" />
                <Bar dataKey="outward" fill="#10B981" name="Outward" />
                <Bar dataKey="purchase" fill="#F59E0B" name="Purchase" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Inventory Value Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Value Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={inventoryValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, 'Inventory Value']} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                <div>
                  <p className="font-medium text-success">Orders Completed</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
                <div className="text-2xl font-bold text-success">156</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                <div>
                  <p className="font-medium text-warning">Pending Approvals</p>
                  <p className="text-sm text-muted-foreground">Purchase orders</p>
                </div>
                <div className="text-2xl font-bold text-warning">8</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="font-medium text-primary">New Products Added</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
                <div className="text-2xl font-bold text-primary">23</div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                <div>
                  <p className="font-medium text-accent">Sites Active</p>
                  <p className="text-sm text-muted-foreground">Currently operating</p>
                </div>
                <div className="text-2xl font-bold text-accent">8</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;