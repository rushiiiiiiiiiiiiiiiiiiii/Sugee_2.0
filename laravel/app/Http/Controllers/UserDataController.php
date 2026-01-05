<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserData;
use Illuminate\Support\Facades\Log;

class UserDataController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'required|unique:usersdata,username',
            'mobile'   => 'required|unique:usersdata,mobile',
            'password' => 'required|string|min:6',
            'role'     => 'required|string',
        ]);

        // ✔ FIXED LOG
        Log::info("User created", $validated);

        $user = UserData::create($validated);

        return response()->json([
            'message' => 'User data stored successfully',
            'user'    => $user
        ]);
    }

    public function login(Request $request)
    {
        try {
            $username = $request->username;
            $password = $request->password;

            $user = UserData::where("username", $username)->first();

            if (!$user) {
                return response()->json(["success" => false, "message"=>"User not found"],404);
            }

            if ($user->password != $password) {
                return response()->json(["success" => false, "message"=>"Invalid Password"],401);
            }

            return response()->json(["success" => true, "data" => $user],200);

        } catch (\Throwable $th) {
            // ❌ WRONG BEFORE:
            // Log::info("Error While Login", $th->getMessage());

            // ✔ FIXED:
            Log::error("Error While Login", [
                "message" => $th->getMessage(),
                "line"    => $th->getLine(),
                "file"    => $th->getFile()
            ]);

            return response()->json([
                'message' => "Internal server error",
            ], 500);
        }
    }

    public function getUsers()
    {
        try {
            return response()->json(UserData::all(), 200);
        } catch (\Throwable $th) {
            return response()->json(["Error"=>"Internal Server error"],500);
        }
    }

    public function deleteUsers(Request $request)
    {
        try {
            $user = UserData::find($request->id);

            if (!$user) {
                return response()->json(["success" => false, "message" => "User not found"], 404);
            }

            $user->delete();
            return response()->json(["success" => true, "message" => "User deleted successfully"], 200);

        } catch (\Throwable $th) {
            // ✔ FIXED LOGGING FORMAT
            Log::error("Error While Deleting User", [
                "message" => $th->getMessage()
            ]);

            return response()->json([
                'message' => "Internal server error",
            ], 500);
        }
    }

    public function getManagers()
    {
        try {
            return response()->json(
                UserData::where('role', 'site_manager')->get(),
                200
            );
        } catch (\Throwable $th) {
            return response()->json(["Error"=>"Internal Server error"],500);
        }
    }
}
