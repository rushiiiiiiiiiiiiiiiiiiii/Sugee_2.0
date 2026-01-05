<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ProductModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    // ✅ CREATE PRODUCT
    public function store(Request $request)
    {
        $products = $request->validate([
            'name'            => 'string|required|unique:products,name',
            'value'           => 'integer|required',
            'category_id'     => 'integer|required',
            'sub_category_id' => 'required|integer',
            'details_id'      => 'integer|nullable',
        ]);

        try {
            // 🔹 Store specification
            $specController = new SpecificationController();
            $specResponse   = $specController->store($request);

            if ($specResponse->getStatusCode() !== 201) {
                return response()->json(['message' => 'Failed to store specification'], 400);
            }

            $specData = $specResponse->getData()->data;

            // 🔹 Attach specification & default qty
            $products['details_id'] = $specData->id;
            $products['qty'] = 0; // ✅ IMPORTANT (default stock)

            $store = ProductModel::create($products);

            return response()->json([
                "message" => "Product created successfully",
                "product" => $store
            ], 201);

        } catch (\Throwable $th) {
            Log::error("Product store error", ['error' => $th->getMessage()]);
            return response()->json("Internal server error", 500);
        }
    }

    // ✅ GET ALL PRODUCT DETAILS
    public function AllDetails()
    {
        try {
            $data = ProductModel::with([
                'category',
                'specification',
                'subcategory'
            ])->get();

            return response()->json($data, 200);

        } catch (\Throwable $th) {
            Log::error("Fetch product error", ['error' => $th->getMessage()]);
            return response()->json("Internal server error", 500);
        }
    }

    // ✅ DELETE PRODUCT
    public function DeleteProduct($id)
    {
        try {
            $product = ProductModel::find($id);

            if (!$product) {
                return response()->json("Product not found", 404);
            }

            $product->delete();

            return response()->json([
                "message" => "Product deleted successfully"
            ], 200);

        } catch (\Throwable $th) {
            Log::error("Delete product error", ['error' => $th->getMessage()]);
            return response()->json("Internal server error", 500);
        }
    }

    // ✅ GET PRODUCTS BY CATEGORY
    public function category($id)
    {
        $products = ProductModel::with([
            'category',
            'specification',
            'subcategory'
        ])->where("category_id", $id)->get();

        return response()->json($products, 200);
    }
}
