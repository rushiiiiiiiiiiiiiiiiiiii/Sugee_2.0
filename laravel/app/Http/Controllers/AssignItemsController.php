<?php

namespace App\Http\Controllers;

use App\Models\AssignItemsModel;
use App\Models\SiteModel;
use App\Models\ProductModel;
use App\Models\UserData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AssignItemsController extends Controller
{
    public function store(Request $request)
{
    $data = $request->validate([
        'product_id' => 'required|integer',
        'site_id' => 'required|integer',
        'quantity' => 'required|integer',
        'expected_delivery' => 'required|string',
        'dispatched_qty' => 'nullable|integer',
        'notes' => 'nullable|string',
    ]);

    // ✅ Fetch product (SOURCE OF TRUTH)
    $product = ProductModel::find($data['product_id']);

    if (!$product || $product->qty < $data['quantity']) {
        return response()->json([
            'message' => 'Insufficient stock available'
        ], 400);
    }

    // ✅ Deduct from product qty
    $product->qty -= $data['quantity'];
    $product->save();

    // ✅ Create assignment
    $assignItem = AssignItemsModel::create($data);

    return response()->json([
        'message' => 'Item assigned successfully',
        'assignItem' => $assignItem
    ], 201);
}

    public function index()
    {
        $assignedItems = AssignItemsModel::with(['product', 'site'])->get();
        return response()->json($assignedItems, 200);
    }
    public function deleteItems($id)
    {
        $data = AssignItemsModel::find($id);
        if (!$data) {
            return response()->json(["message" => "no product found"], 404);
        }
        $data->delete();
        return response()->json(["message" => "data deleted"], 200);
    }
    public function updateAssignment(Request $request, $id)
    {
        $updates = $request->validate([
            "dispatched_qty" => 'required|integer',
        ]);

        $data = AssignItemsModel::find($id);
        if (!$data) {
            return response()->json(["message" => "Record not found"], 404);
        }

        $data->dispatched_qty = $updates['dispatched_qty'];
        Log::info($data->toArray());
        $data->save();

        return response()->json(["message" => "Data updated"], 200);
    }
    public function AssignSite($id)
    {
        $manager = UserData::find($id);
        $site = SiteModel::where("user_id", $manager->id)->first();
        if(!$site){
            return response()->json(["message"=>"Unauthorized"],401);
        }
        $data = AssignItemsModel::with(["product","site"])->where('site_id', $site->id)->get();
        if (!$data) {
            return response()->json("no data avaible", 302);
        }
        return response()->json($data);
    }
}
