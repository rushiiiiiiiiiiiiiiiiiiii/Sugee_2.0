<?php

namespace App\Http\Controllers;

use App\Models\ProductModel;
use App\Models\PurchaseModel;
use App\Models\AssignItemsModel;
use App\Models\OutwardTransactionModel;
use App\Models\StocksModel;

class ProductReportController extends Controller
{
    public function report($productId)
    {
        $product = ProductModel::with(['category', 'subcategory'])->findOrFail($productId);

        $rows = [];

        // 1️⃣ PURCHASE / INWARD
        $purchases = PurchaseModel::where('product_name', $product->name)->get();
        foreach ($purchases as $p) {
            $rows[] = [
                'date' => $p->created_at,
                'type' => 'Inward (Purchase)',
                'in' => $p->received_qty,
                'out' => 0,
                'from' => $p->supplier,
                'to' => 'Store',
            ];
        }

        // 2️⃣ ASSIGN TO SITE
        $assigns = AssignItemsModel::where('product_id', $productId)->with('site')->get();
        foreach ($assigns as $a) {
            $rows[] = [
                'date' => $a->created_at,
                'type' => 'Assigned',
                'in' => 0,
                'out' => $a->quantity,
                'from' => 'Store',
                'to' => $a->site->name,
            ];
        }

        // 3️⃣ DISPATCH
        $outwards = OutwardTransactionModel::where('product_id', $productId)
            ->with('site')
            ->get();

        foreach ($outwards as $o) {
            $rows[] = [
                'date' => $o->created_at,
                'type' => 'Dispatched',
                'in' => 0,
                'out' => $o->quantity,
                'from' => 'Store',
                'to' => $o->site->name,
            ];
        }

        // 4️⃣ SITE TO SITE TRANSFER
        $transfers = StocksModel::where('product_id', $productId)
            ->where('transfer_status', 'site_to_site')
            ->with(['fromSite', 'toSite'])
            ->get();

        foreach ($transfers as $t) {
            $rows[] = [
                'date' => $t->transfer_date,
                'type' => 'Site to Site Transfer',
                'in' => 0,
                'out' => $t->qty,
                'from' => $t->fromSite->name,
                'to' => $t->toSite->name,
            ];
        }

        // 🔁 Sort by date
        usort($rows, fn ($a, $b) => strtotime($a['date']) <=> strtotime($b['date']));

        return response()->json([
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category->category ?? '',
                'subcategory' => $product->subcategory->sub_category ?? '',
                'current_stock' => $product->qty,
            ],
            'report' => $rows
        ]);
    }
}
