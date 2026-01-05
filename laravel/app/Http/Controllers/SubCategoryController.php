<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SubCategory;
use Illuminate\Http\Request;

class SubCategoryController extends Controller
{
    function allsubcategory(){
        $data = SubCategory::all();
        if($data){
            return response()->json($data);
        }
    }
    function subcategory($id){
        $data = SubCategory::where('category_id',$id)->get();
        if($data){
            return response()->json($data);
        }
    }
}
