<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\CategoryModel;
use App\Models\SubCategory;


class CategoryController extends Controller
{
    function store(Request $request)
    {
        Log::info('⚠️ CategoryController@store called', ['request' => $request->all()]);

        try {     
            $validated = $request->validate([
                'category'     => 'required|string',
                'sub_category' => 'nullable|string|min:0',
            ]);

            // Category fetch या create
            $category = CategoryModel::firstOrCreate(
                ['category' => $validated['category']] // अगर exist नहीं है तो create होगा
            );

            // SubCategory save करें
            $subcat = SubCategory::create([
                'category_id'  => $category->id,
                'sub_category' => $validated['sub_category'] ?? null,
            ]);

            if ($subcat) {
                return response()->json([
                    "Message" => "Data stored successfully",
                    "category" => $category,
                    "sub_category" => $subcat
                ], 200);
            }
        } catch (\Throwable $th) {
            Log::error($th);
            return response()->json([
                "Message" => "Something went wrong",
                "error" => $th->getMessage()
            ], 500);
        }
    }
    function showall()
    {
        $data = SubCategory::with('category')->get();
        if ($data) {
            return response()->json($data);
        } else {
            return response()->json("No Category added");
        }
    }
    function category($id)
    {
        Log::info($id);
        $data =  CategoryModel::where("category", $id)->get();
        if ($data) {
            return response()->json($data);
        } else {
            return  response()->json("category not found");
        }
    }
    function getCategory(){
        $data =  CategoryModel::all();
         if ($data) {
            return response()->json($data);
        } else {
            return  response()->json("category not found");
        }
    }
}
