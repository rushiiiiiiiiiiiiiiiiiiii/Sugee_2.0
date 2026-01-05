<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StocksModel;
use Illuminate\Support\Facades\DB;

class InventoryTransferController extends Controller
{
    // 🔹 View all products in a site's inventory
    public function viewSiteInventory($site_id)
    {
        $stocks = StocksModel::with('product') // assumes relation product() exists
            ->where('site_id', $site_id)
            ->get();

        if ($stocks->isEmpty()) {
            return response()->json(['message' => 'No inventory found for this site'], 404);
        }

        return response()->json([
            'site_id' => $site_id,
            'inventory' => $stocks
        ], 200);
    }

    // 🔹 Transfer stock between two sites
    public function transferStock(Request $request)
    {
        $data = $request->validate([
            'product_id'   => 'required|integer',
            'from_site_id' => 'required|integer',
            'to_site_id'   => 'required|integer|different:from_site_id',
            'quantity'     => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($data) {
            // 1️⃣ Reduce from source site
            $fromStock = StocksModel::where([
                'site_id'    => $data['from_site_id'],
                'product_id' => $data['product_id']
            ])->first();

            if (!$fromStock || $fromStock->qty < $data['quantity']) {
                abort(400, 'Insufficient stock at source site.');
            }

            $fromStock->decrement('qty', $data['quantity']);

            // 2️⃣ Add to destination site
            $toStock = StocksModel::firstOrCreate([
                'site_id'    => $data['to_site_id'],
                'product_id' => $data['product_id']
            ]);

            $toStock->increment('qty', $data['quantity']);
        });
        

        return response()->json(['message' => 'Stock transferred successfully.'], 200);
    }
    public function transfer(Request $request)
{
    return response()->json([
        'message' => 'Transfer route working!',
        'data' => $request->all()
    ]);
}

}
