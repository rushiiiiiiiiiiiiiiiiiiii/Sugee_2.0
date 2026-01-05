<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CategoryModel;
use App\Models\ProductModel;   // ✅ CORRECT MODEL
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StocksController extends Controller
{
    // ✅ ADD / UPDATE PRODUCT QUANTITY
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'product_id' => 'required|integer|exists:products,id',
                'qty'        => 'required|integer|min:1',
            ]);

            // 🔹 Fetch product from PRODUCTS table
            $product = ProductModel::find($data['product_id']);

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            // 🔹 Update quantity
            $product->qty += $data['qty'];
            $product->save();

            return response()->json([
                'message' => 'Product quantity updated successfully',
                'product' => $product
            ], 200);

        } catch (\Throwable $th) {
            Log::error('Error updating product quantity', [
                'error' => $th->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to update product quantity',
                'error'   => $th->getMessage()
            ], 500);
        }
    }

    // OPTIONAL
    public function Quantity(Request $request)
    {
        try {
            $qty = $request->qty;

            $products = ProductModel::where('qty', '>=', $qty)->get();

            return response()->json($products, 200);

        } catch (\Throwable $th) {
            Log::error('Error fetching products by quantity', [
                'error' => $th->getMessage()
            ]);

            return response()->json([
                'message' => 'Failed to fetch products',
                'error'   => $th->getMessage()
            ], 500);
        }
    }

    // ✅ FETCH PRODUCTS WITH CATEGORY & SUBCATEGORY
    public function getStocks()
    {
        try {
            $products = ProductModel::all();

            foreach ($products as $item) {
                $category = CategoryModel::find($item->category_id);
                $subcategory = SubCategory::find($item->sub_category_id);

                $item->category = $category ? $category->category : 'N/A';
                $item->subcategory = $subcategory ? $subcategory->sub_category : 'N/A';
            }

            return response()->json($products, 200);

        } catch (\Throwable $th) {
            Log::error("Something went wrong", [
                'error' => $th->getMessage()
            ]);

            return response()->json("Internal server error", 500);
        }
    }
}
