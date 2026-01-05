import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Plus } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddProduct from './AddProduct'; // ✅ Import your AddProduct form
import { useAuth } from '../context/AuthContext';

const Inventory = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { product, AllProducts, stock, getStocks } = useAuth()


  const productsWithStock = product.map(product => {
    const stockItem = stock.find(s => s.product_id === product.id);
    return {
      ...product,
      stock: stockItem ? stockItem.qty : 0
    };
  });
  // Apply search filter
  const filteredInventory = productsWithStock.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.category?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item?.subcategory?.sub_category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    AllProducts()
    getStocks()
  }, [])
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
        <Button className="bg-primary hover:bg-primary-hover">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Store Items</CardTitle>
            <div className="flex items-center space-x-2">
              {/* Search Input */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              {/* <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button> */}
              

              {/* ✅ Add Product Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                      Add New Product
                    </DialogTitle>
                  </DialogHeader>
                  {/* ✅ Add Product Form goes here */}

                  <AddProduct product = {AllProducts}/>
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Item Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subcategory</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory?.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-gray-100">

                    <td className="py-3 px-4 font-medium text-foreground">{item.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.category?.category}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.subcategory?.sub_category}</td>
                    <td className="py-3 px-4 text-foreground">{item.stock}</td>
                    <td className="py-3 px-4 text-foreground">{item.value} Rs</td>

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

export default Inventory;