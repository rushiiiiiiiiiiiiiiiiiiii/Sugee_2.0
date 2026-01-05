<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;

class UserData extends Model
{
    use HasFactory;
    protected $table = 'usersdata'; // optional if table name matches Laravel convention

    // The fields that are mass assignable
    protected $fillable = ['name', 'username', 'password','role','mobile'];
}
