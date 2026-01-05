<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OutwardTransactionModel;
use App\Models\RequestDeatilsModel;
use Illuminate\Support\Facades\DB;

class OutwardTransactionController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer',
            'site_id' => 'required|integer',
            'quantity' => 'required|integer|min:1',
            'request_id' => 'required|integer',
            'type' => 'required|string',
        ]);
        $outwardTransaction = OutwardTransactionModel::create($data);
        return response()->json($outwardTransaction, 201);
    }
  
public function markCompleted(Request $request)
{
    $request->validate([
        'dispatch_id' => 'required|integer|exists:outward_transaction,id',
    ]);

    DB::transaction(function () use ($request) {

        // 1️⃣ Update outward transaction
        $dispatch = OutwardTransactionModel::find($request->dispatch_id);
        $dispatch->type = 'completed';
        $dispatch->save();

        // 2️⃣ Update request_details status
        if ($dispatch->request_id) {
            $requestDetail = RequestDeatilsModel::find($dispatch->request_id);
            if ($requestDetail) {
                $requestDetail->status = 'completed';
                $requestDetail->save();
            }
        }
    });

    return response()->json([
        'message' => 'Dispatch and request marked as completed'
    ], 200);
}

    public function index()
    {
        $transactions = OutwardTransactionModel::with(['product', 'site'])->get();
        return response()->json($transactions, 200);
    }
}
