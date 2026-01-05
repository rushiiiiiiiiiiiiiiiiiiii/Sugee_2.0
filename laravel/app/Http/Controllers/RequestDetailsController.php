<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RequestDeatilsModel;
use App\Models\SiteModel;
use App\Models\ProductModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class RequestDetailsController extends Controller
{
    public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'items' => 'required|array|min:1',
        'items.*.site_id' => 'required|integer|exists:site,id',
        'items.*.requestDate' => 'required|date',
        'items.*.deliveryDate' => 'required|date',
        'items.*.product_request_id' => 'required|integer|exists:products,id',
        'items.*.issued_qty' => 'required|integer|min:1',
        'items.*.urgency' => 'required|in:low,medium,high,critical',
        'items.*.remark' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors(),
        ], 422);
    }

    try {
        $created = collect($validator->validated()['items'])->map(function ($item) {

            // ✅ site_id is already site id — no user_id confusion
            Log::info('Storing request item', $item);

            return RequestDeatilsModel::create([
                'site_id' => $item['site_id'],
                'requestDate' => $item['requestDate'],
                'deliveryDate' => $item['deliveryDate'],
                'product_request_id' => $item['product_request_id'],
                'issued_qty' => $item['issued_qty'],
                'urgency' => $item['urgency'],
                'remark' => $item['remark'],
            ]);
        });

        return response()->json([
            'message' => 'Request details stored successfully',
            'data' => $created,
        ], 201);

    } catch (\Throwable $th) {
        Log::error('Request store failed', ['error' => $th->getMessage()]);

        return response()->json([
            'message' => 'Internal server error',
            'error' => $th->getMessage(),
        ], 500);
    }
}
    

    public function showall()
    {
        try {
            $data = RequestDeatilsModel::with(['product', 'site'])->get();
            if ($data) {
                return response()->json($data, 200);
            }
        } catch (\Throwable $th) {
            //throw $th;
            Log::error('Error storing request details: ' . $th->getMessage());

            // Return a JSON error response with a 500 status code.
            return response()->json([
                "message" => "Failed to store request details",
                "error" => $th->getMessage()
            ], 500);
        }
    }
    public function UpadeByInward(Request $request, $id)
{
    $validated = $request->validate([
        'dispatched_qty' => 'required|integer|min:1',
    ]);

    $requestDetail = RequestDeatilsModel::find($id);
    if (!$requestDetail) {
        return response()->json(['message' => 'Request not found'], 404);
    }

    // ✅ USE PRODUCT TABLE AS STOCK SOURCE
    $product = ProductModel::find($requestDetail->product_request_id);
    if (!$product) {
        return response()->json(['message' => 'Product not found'], 404);
    }

    DB::transaction(function () use ($validated, $requestDetail, $product) {

        // 1️⃣ Check available stock from products table
        if ($product->qty < $validated['dispatched_qty']) {
            abort(400, 'Insufficient stock available');
        }

        // 2️⃣ Deduct stock
        $product->qty -= $validated['dispatched_qty'];
        $product->save();

        // 3️⃣ Calculate new dispatched qty
        $updatedQty =
            ($requestDetail->dispatched_qty ?? 0) + $validated['dispatched_qty'];

        if ($updatedQty > $requestDetail->issued_qty) {
            abort(400, 'Dispatched quantity exceeds issued quantity');
        }

        $requestDetail->dispatched_qty = $updatedQty;

        // 4️⃣ Update request status
        // 4️⃣ Update request status (ONLY DISPATCHED HERE)
        $requestDetail->status = 'dispatched';


        $requestDetail->save();
    });

    return response()->json([
        'message' => 'Request detail successfully updated',
        'data' => $requestDetail
    ], 200);
}

    public function MyRequests($user_id)
    {
        $site_id = SiteModel::where('user_id', $user_id)->first();
        if (!$site_id) {
            return response()->json(['message' => 'Site not found for the given user ID'], 404);
        }
        Log::info('Fetching requests for site ID: ' . $site_id->id);
        $data = RequestDeatilsModel::with(['product', 'site'])->where('site_id', $site_id->id)->get();
        if ($data) {
            return response()->json($data, 200);
        }
    }
    public function SiteDeals(Request $request, $id)
    {
        try {
            //code...
        } catch (\Throwable $th) {
            return response()->json();
            //throw $th;
        }
    }
public function Return_qty(Request $req, $id)
{
    // Find the record or fail with 404
    $details = RequestDeatilsModel::findOrFail($id);

    // Validate the request data
    $data = $req->validate([
        "return_qty" => "required|integer"
    ]);

    // Update the returned_qty
    $details->returned_qty = $data['return_qty'];
    $details->save(); // or $details->update();

    // Return a success response
    return response()->json([
        'message' => 'Return quantity updated successfully.',
        'data' => $details
    ]);
}

}
