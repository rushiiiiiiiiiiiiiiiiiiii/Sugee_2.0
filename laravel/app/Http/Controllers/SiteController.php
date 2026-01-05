<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SiteModel;
use Illuminate\Support\Facades\Log;

class SiteController extends Controller
{
    // function store(Request $request)
    // {
    //     try {
    //         $validated = $request->validate([
    //         'user_id' => 'required|integer',
    //         'name' => 'required|string',
    //         'site_address' => 'required|string',
    //         'site_details'   => 'nullable|string',
    //     ]);
    //       $site = new SiteModel;
    //         $site->user_id      = $validated['user_id'];
    //         $site->name         = $validated['name'];
    //         $site->site_address = $validated['site_address'];
    //         $site->site_details = $validated['site_details'];
    //         $site->save();
    //         return response()->json(["message" => "Data successfully stored"], 200);
    //     } catch (\Throwable $th) {
    //          // Log the actual error for debugging
    //         Log::error('Failed to store product', [
    //             'error' => $th->getMessage(),
    //             'trace' => $th->getTraceAsString(),
    //         ]);

    //         // Return a consistent JSON response
    //         return response()->json([
    //             'error' => 'Internal server error'
    //         ], 500);
    //     }
    // }
    public function store(Request $request)
{
    try {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'name' => 'required|string',
            'site_address' => 'required|string',
            'site_details' => 'nullable|string',
        ]);

        // ✅ Check duplicate site name
        $existingSite = SiteModel::where('name', $validated['name'])->first();
        if ($existingSite) {
            return response()->json([
                'message' => 'Site with this name already exists'
            ], 409); // Conflict
        }

        $site = new SiteModel();
        $site->user_id = $validated['user_id'];
        $site->name = $validated['name'];
        $site->site_address = $validated['site_address'];
        $site->site_details = $validated['site_details'];
        $site->save();

        return response()->json([
            'message' => 'Site added successfully'
        ], 200);

    } catch (\Throwable $th) {
        Log::error('Failed to store site', [
            'error' => $th->getMessage(),
        ]);

        return response()->json([
            'error' => 'Internal server error'
        ], 500);
    }
}

// public function update(Request $request, $id)
// {
//     try {
//         $validated = $request->validate([
//             'user_id' => 'required|integer',
//             'name' => 'required|string',
//             'site_address' => 'required|string',
//             'site_details' => 'nullable|string',
//         ]);

//         $site = SiteModel::find($id);

//         if (!$site) {
//             return response()->json(['message' => 'Site not found'], 404);
//         }

//         $site->user_id = $validated['user_id'];
//         $site->name = $validated['name'];
//         $site->site_address = $validated['site_address'];
//         $site->site_details = $validated['site_details'];
//         $site->save();

//         return response()->json(['message' => 'Site updated successfully'], 200);

//     } catch (\Throwable $th) {
//         Log::error('Failed to update site', [
//             'error' => $th->getMessage(),
//         ]);

//         return response()->json(['error' => 'Internal server error'], 500);
//     }
// }
public function update(Request $request, $id)
{
    try {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'name' => 'required|string',
            'site_address' => 'required|string',
            'site_details' => 'nullable|string',
        ]);

        $site = SiteModel::find($id);
        if (!$site) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        // ✅ Check duplicate name EXCEPT current site
        $duplicate = SiteModel::where('name', $validated['name'])
            ->where('id', '!=', $id)
            ->first();

        if ($duplicate) {
            return response()->json([
                'message' => 'Site with this name already exists'
            ], 409);
        }

        $site->user_id = $validated['user_id'];
        $site->name = $validated['name'];
        $site->site_address = $validated['site_address'];
        $site->site_details = $validated['site_details'];
        $site->save();

        return response()->json([
            'message' => 'Site updated successfully'
        ], 200);

    } catch (\Throwable $th) {
        Log::error('Failed to update site', [
            'error' => $th->getMessage(),
        ]);

        return response()->json([
            'error' => 'Internal server error'
        ], 500);
    }
}

public function destroy($id)
{
    try {
        $site = SiteModel::find($id);

        if (!$site) {
            return response()->json(['message' => 'Site not found'], 404);
        }

        $site->delete();

        return response()->json(['message' => 'Site deleted successfully'], 200);

    } catch (\Throwable $th) {
        Log::error('Failed to delete site', [
            'error' => $th->getMessage(),
        ]);

        return response()->json(['error' => 'Internal server error'], 500);
    }
}

    function showall()
    {
        $data=SiteModel::with(['user'])->get();
        if($data){
            return response()->json($data);
        }
        else{
            return response()->json("No Category added");
        }
    }
}
