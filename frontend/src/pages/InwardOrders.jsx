import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InwardOrders = () => {
  const api = import.meta.env.VITE_APP_URL_BACKEND;

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [inwardOrders, setInwardOrders] = useState([]);

  // 🔥 NEW STATES
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [receivedQty, setReceivedQty] = useState('');

  const itemsPerPage = 3;
  const maxPageButtons = 5;

  // ✅ FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const response = await fetch(api + '/api/get_purchase');
      const data = await response.json();
      setInwardOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🔍 Search filter
  const filteredBySearch = inwardOrders.filter(order =>
    order.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📅 Date filter
  const filteredOrders = filteredBySearch.filter(order => {
    const orderDate = order.created_at?.split('T')[0];
    if (startDate && orderDate < startDate) return false;
    if (endDate && orderDate > endDate) return false;
    return true;
  });

  // 📄 Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let end = Math.min(totalPages, start + maxPageButtons - 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // 📄 Export PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Inward Orders Report', 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [['Item', 'Ordered', 'Received', 'Date']],
      body: filteredOrders.map(order => [
        order.product_name,
        order.quantity,
        order.received_qty ?? 0,
        order.created_at.split('T')[0],
      ]),
    });

    doc.save('inward_orders.pdf');
  };

  // 🔥 OPEN RECEIVE MODAL
  const openReceiveModal = (order) => {
    setSelectedOrder(order);
    setReceivedQty(order.received_qty ?? '');
    setReceiveModalOpen(true);
  };

  // 🔥 SUBMIT RECEIVED QTY
  const submitReceivedQty = async () => {
    if (receivedQty === '') return alert('Enter received quantity');

    if (Number(receivedQty) > selectedOrder.quantity) {
      return alert('Received quantity cannot exceed ordered quantity');
    }

    await fetch(`${api}/api/purchase/${selectedOrder.id}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received_qty: Number(receivedQty) }),
    });

    setReceiveModalOpen(false);
    fetchOrders();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Inward Orders</h1>
        <Button onClick={handleExportPDF} className="bg-blue-600 text-white">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inward Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead className="bg-blue-200">
              <tr className="text-left">
                <th className="p-3">Item</th>
                <th className="p-3">Ordered</th>
                <th className="p-3">Received</th>
                <th className="p-3">Date</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="p-3">{order.product_name}</td>
                  <td className="p-3">{order.quantity}</td>
                  <td className="p-3">{order.received_qty ?? 0}</td>
                  <td className="p-3">{order.created_at.split('T')[0]}</td>
                  <td className="p-3">
                    <Button size="sm" onClick={() => openReceiveModal(order)}>
                      Receive
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-4">
            {getPageNumbers().map(page => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* RECEIVE MODAL */}
      {receiveModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Receive Items</h2>

            <p><b>Item:</b> {selectedOrder.product_name}</p>
            <p><b>Ordered:</b> {selectedOrder.quantity}</p>

            <Input
              type="number"
              value={receivedQty}
              onChange={(e) => setReceivedQty(e.target.value)}
              placeholder="Enter received quantity"
              className="mt-4"
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setReceiveModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitReceivedQty}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InwardOrders;