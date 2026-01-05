import React, { useState, useRef, useEffect } from "react";
import Barcode from "react-barcode";
import { Barcode as BarcodeIcon, Sparkles, Printer } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const CreateBarcode = () => {
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");

  // 🔥 SAME LOGIC AS ADD QUANTITY
  const [showDropdown, setShowDropdown] = useState(false);

  const { product, AllProducts } = useAuth();

  const [categories, setCategories] = useState([]);

  const printRef = useRef();
  const api = import.meta.env.VITE_APP_URL_BACKEND;

  /* ============================
     FETCH PRODUCTS (ONCE)
  ============================ */
  useEffect(() => {
    AllProducts();
  }, []);

  /* ============================
     FETCH CATEGORIES
  ============================ */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${api}/api/category`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  /* ============================
     FILTER PRODUCTS (LIKE ADD QTY)
  ============================ */
  const filteredProducts = product.filter((item) =>
    item.name.toLowerCase().includes(productName.toLowerCase())
  );

  /* ============================
     BARCODE GENERATION
  ============================ */
  const handleGenerate = () => {
    if (!productName || !category) return;
    setBarcodeValue(`${productName}-${category}-${Date.now()}`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-6">
      {/* Print Styles */}
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
              text-align: center;
            }
          }
        `}
      </style>

      <div className="bg-white shadow-xl rounded-2xl w-full max-w-xl p-8 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-blue-100 p-3 rounded-full">
            <BarcodeIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Create Barcode
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* PRODUCT NAME */}
          <div className="relative">
            <label className="block mb-2 font-semibold text-gray-700">
              Product / Item Name
            </label>

            <input
              type="text"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setShowDropdown(true);
              }}
              placeholder="Enter product name..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400"
            />

            {/* 🔽 SAME DROPDOWN AS ADD QUANTITY */}
            {showDropdown && productName && filteredProducts.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto">
                {filteredProducts.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setProductName(item.name);
                      setShowDropdown(false);
                    }}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 bg-white"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          {/* GENERATE BUTTON */}
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
          >
            <Sparkles className="w-5 h-5" />
            Generate Barcode
          </button>
        </div>

        {/* BARCODE PREVIEW */}
        {barcodeValue && (
          <div
            ref={printRef}
            className="print-area mt-8 border border-gray-200 rounded-xl p-6 bg-blue-50 flex flex-col items-center"
          >
            <p className="text-gray-600 text-sm mb-3">
              Barcode for{" "}
              <span className="font-semibold text-gray-800">
                {productName}
              </span>
            </p>

            <Barcode value={barcodeValue} />

            <button
              onClick={handlePrint}
              className="mt-5 flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              <Printer className="w-5 h-5" />
              Print Barcode
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateBarcode;