<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VendorsController extends Controller
{
    function store(Request $request){
        try {
            $data = $request->validate([                       
                'product_id'=>'required|integer',
                'name'=>'required|string',
                'details'=>'required|string',
            ]);
            //code...
        } catch (\Throwable $th) {
            Log::error('Error storing request details: ' . $th->getMessage());

            // Return a JSON error response with a 500 status code.
            return response()->json([
                "message" => "Failed to store request details",
                "error" => $th->getMessage()
            ], 500);
            //throw $th;
        }
    }
}
