import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "../context/AuthContext";
import * as html2pdf from "html2pdf.js";

const ProductReport = () => {
  const api = import.meta.env.VITE_APP_URL_BACKEND;
  const { product: allProducts, AllProducts } = useAuth();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [report, setReport] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const isDateRangeSelected = Boolean(fromDate && toDate);

  const reportRef = useRef(null);

  // 🔍 Fetch report
  const fetchReport = async (productId) => {
    const res = await fetch(`${api}/api/product-report/${productId}`);
    const data = await res.json();
    setSelectedProduct(data.product);
    setReport(data.report);
  };

  const filteredReport = report.filter((r) => {
    if (!fromDate || !toDate) return false; // 🚫 block report
    const rowDate = new Date(r.date);
    return rowDate >= new Date(fromDate) && rowDate <= new Date(toDate);
  });

  const sortedReport = [...filteredReport].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // 1️⃣ Start from FINAL stock
  let runningStock = selectedProduct?.current_stock ?? 0;

  // 2️⃣ Reverse transactions AFTER selected range
  sortedReport
    .slice() // clone
    .reverse()
    .forEach((row) => {
      switch (row.type) {
        case "Inward (Purchase)":
        case "Inward (Store)":
          runningStock -= row.in || 0;
          break;

        case "Dispatched":
          runningStock += row.out || 0;
          break;

        // Assigned & Site-to-site → no effect
        default:
          break;
      }
    });

  const rows = sortedReport.map((row) => {
    switch (row.type) {
      case "Inward (Purchase)":
      case "Inward (Store)":
        runningStock += row.in || 0;
        break;

      case "Dispatched":
        runningStock -= row.out || 0;
        break;

      case "Assigned":
      case "Site to Site Transfer":
        // ❌ NO CHANGE
        break;
    }

    return {
      ...row,
      currentStock: runningStock,
    };
  });

  const filteredProducts =
    search.length > 0
      ? allProducts.filter((p) =>
          p.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  useEffect(() => {
    if (!allProducts.length) AllProducts();
  }, []);

  // 🖨️ PRINT
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    if (!reportRef.current || !selectedProduct) return;

    const opt = {
      margin: 10,
      filename: `${selectedProduct.name}-stock-report.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    };

    html2pdf.default().set(opt).from(reportRef.current).save();
  };

  useEffect(() => {
    if (!search) setShowSuggestions(false);
  }, [search]);

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Print CSS */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

      <h1 className="text-3xl font-bold text-gray-800">Product Stock Report</h1>

      {/* 🔍 Product Search */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search product..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSuggestions(true);
          }}
        />

        {showSuggestions && search && filteredProducts.length > 0 && (
          <div className="absolute bg-white border w-full z-20 rounded-md shadow max-h-56 overflow-auto">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSearch(p.name);
                  setShowSuggestions(false); // 🔥 CLOSE DROPDOWN
                  fetchReport(p.id);
                }}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
              >
                {p.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📅 Date Filters */}
      <div className="flex gap-4">
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        {selectedProduct && !isDateRangeSelected && (
          <p className="text-sm text-red-500">
            Please select both From Date and To Date to view the report.
          </p>
        )}
      </div>

      {/* 🖨️ ACTION BUTTONS */}
      {selectedProduct && isDateRangeSelected && (
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Print
          </button>
        </div>
      )}

      {/* 🧾 REPORT */}
      {selectedProduct && isDateRangeSelected && (
        <div ref={reportRef} className="print-area space-y-6">
          <Card>
            <CardContent className="grid grid-cols-3 gap-6 p-6">
              <div>
                <p className="text-sm text-gray-500">Product</p>
                <p className="font-semibold">{selectedProduct.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p>{selectedProduct.category}</p>
                <p className="text-sm text-gray-500 mt-1">Subcategory</p>
                <p>{selectedProduct.subcategory}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedProduct.current_stock}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 📊 TABLE */}
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="w-full text-sm">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">In</th>
                  <th className="px-3 py-2">Out</th>
                  <th className="px-3 py-2">From</th>
                  <th className="px-3 py-2">To</th>
                  <th className="px-3 py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-3 py-2">{r.date?.split("T")[0]}</td>
                    <td className="px-3 py-2">{r.type}</td>
                    <td className="px-3 py-2 text-green-600">{r.in || "-"}</td>
                    <td className="px-3 py-2 text-red-600">{r.out || "-"}</td>
                    <td className="px-3 py-2">{r.from || "-"}</td>
                    <td className="px-3 py-2">{r.to || "-"}</td>
                    <td className="px-3 py-2 font-bold">{r.currentStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReport;
