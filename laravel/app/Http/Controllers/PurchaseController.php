<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseModel;
use App\Models\ProductModel;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    // ===============================
    // CREATE PURCHASE ORDERS
    // ===============================
    public function PurchaseOrder(Request $request)
    {
        try {
            $data = $request->all();
            Log::info('Received purchase order data: ' . json_encode($data));

            if (empty($data) || !isset($data['items']) || !is_array($data['items'])) {
                return response()->json(['message' => 'Invalid or empty request data'], 400);
            }

            foreach ($data['items'] as $items) {
                $validated = validator($items, [
                    'supplier'          => 'required|integer',
                    'category'          => 'required|integer',
                    'sub_category'      => 'required|integer',
                    'product_name'      => 'required|string',
                    'quantity'          => 'required|integer|min:1',
                    'received_qty'      => 'required|integer|min:0',
                    'expected_delivery' => 'required|string',
                    'notes'             => 'nullable|string',
                ])->validate();

                PurchaseModel::create($validated);
            }

            return response()->json([
                'message' => 'All purchase orders created successfully',
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Throwable $th) {
            Log::error('Purchase order error', [
                'error' => $th->getMessage()
            ]);

            return response()->json([
                'message' => 'An unexpected error occurred',
                'error'   => $th->getMessage(),
            ], 500);
        }
    }

    // ===============================
    // GET PURCHASE ORDERS
    // ===============================
    public function GetPurchaseOrder()
    {
        $purchases = PurchaseModel::with(['category', 'subCategory'])->get();
        return response()->json($purchases, 200);
    }

    // ===============================
    // RECEIVE PURCHASE (🔥 MAIN FIX)
    // ===============================
    public function receive(Request $request, $id)
    {
        $request->validate([
            'received_qty' => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($request, $id) {

            // 1️⃣ Find purchase
            $purchase = PurchaseModel::find($id);

            if (!$purchase) {
                abort(404, 'Purchase not found');
            }

            // 2️⃣ received qty cannot exceed ordered qty
            if ($request->received_qty > $purchase->quantity) {
                abort(400, 'Received quantity cannot exceed ordered quantity');
            }

            // 3️⃣ Update received qty in purchase table
            $purchase->received_qty = $request->received_qty;
            $purchase->save();

            // 4️⃣ Find product by name (or product_id if you store it later)
            $product = ProductModel::where('name', $purchase->product_name)->first();

            if (!$product) {
                abort(404, 'Product not found');
            }

            // 5️⃣ Add received qty to product stock
            $product->qty = $product->qty + $request->received_qty;
            $product->save();
        });

        return response()->json([
            'message' => 'Received quantity updated and product stock increased successfully'
        ], 200);
    }
}
