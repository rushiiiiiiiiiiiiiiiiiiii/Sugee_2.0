<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteModel extends Model
{
    protected $table = 'site';
    protected $fillable = [
        'user_id',
        'name',
        'site_address',
        'site_details'
    ];
    public function user()
    {
        return $this->belongsTo(UserData::class, 'user_id');
    }
}
