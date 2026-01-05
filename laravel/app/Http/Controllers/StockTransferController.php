<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\StocksModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockTransferController extends Controller
{
    /**
     * Store Site → Site transfer record
     */
    public function transfer(Request $request)
    {
        Log::info('StockTransferController@transfer called', $request->all());

        // ✅ Validate request
        $validated = $request->validate([
            'product_id'   => 'required|integer|exists:products,id',
            'from_site_id' => 'required|integer|exists:site,id',
            'to_site_id'   => 'required|integer|exists:site,id|different:from_site_id',
            'qty'          => 'required|integer|min:1',
        ]);

        try {
            DB::transaction(function () use ($validated) {
    StocksModel::create([
        'product_id' => $validated['product_id'],
        'from_site_id' => $validated['from_site_id'],
        'to_site_id' => $validated['to_site_id'],
        'qty' => $validated['qty'],
        'transfer_status' => 'site_to_site',
        'status' => 'dispatched',
        'transfer_date' => now(),
    ]);
});



            return response()->json([
                'message' => 'Site to site transfer stored successfully'
            ], 200);

        } catch (\Throwable $th) {
            Log::error('Stock transfer failed', [
                'error' => $th->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to store site transfer'
            ], 500);
        }
    }

    /**
     * Get Site → Site transfer history
     */
    public function history()
    {
        $transfers = StocksModel::with([
                'product:id,name',
                'fromSite:id,name',
                'toSite:id,name'
            ])
            ->whereNotNull('from_site_id')
            ->whereNotNull('to_site_id')
            ->orderBy('transfer_date', 'desc')
            ->get()
            ->map(function ($t) {
    return [
        'id' => $t->id,

        // 🔑 IDs (VERY IMPORTANT)
        'product_id' => $t->product_id,
        'from_site_id' => $t->from_site_id,
        'to_site_id' => $t->to_site_id,

        // display fields
        'product' => $t->product->name ?? 'N/A',
        'from_site' => $t->fromSite->name ?? 'Unknown',
        'to_site' => $t->toSite->name ?? 'Unknown',

        'qty' => $t->qty,

        // 🔑 REQUIRED FOR IDENTIFICATION
        'transfer_status' => $t->transfer_status, // site_to_site
        'status' => $t->status,                   // dispatched / completed

        'transfer_date' => $t->transfer_date,
    ];
});


        return response()->json($transfers, 200);
    }
    /**
 * Confirm Site → Site transfer (Mark as completed)
 */
public function completeTransfer(Request $request)
{
    $request->validate([
        'transfer_id' => 'required|integer|exists:stocks,id',
    ]);

    $transfer = StocksModel::find($request->transfer_id);

    if ($transfer->status !== 'dispatched') {
        return response()->json([
            'message' => 'Transfer already completed'
        ], 400);
    }

    $transfer->status = 'completed';
    $transfer->save();

    return response()->json([
        'message' => 'Site-to-site transfer marked as completed'
    ], 200);
}


}
