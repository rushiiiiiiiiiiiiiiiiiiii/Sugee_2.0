<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SpecificationModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SpecificationController extends Controller
{
    function store(Request $request)
    {
        try {
            $specification = $request->validate([
                'spec_1'=>'nullable',
                'spec_2'=>'nullable',
                'spec_3'=>'nullable',
                'spec_4'=>'nullable',
                'desc'=>'nullable',
            ]);
            $store = SpecificationModel::create($specification);
            if ($store) {
                return response()->json([
                    'message' => 'Specification stored successfully',
                    'data' => $store
                ], 201);
            }
        } catch (\Throwable $th) {
            Log::error("Something went wrong", ['error' => $th->getMessage()]);
            return response()->json("Internal server error",500);
            //throw $th;
        }
    }
}
