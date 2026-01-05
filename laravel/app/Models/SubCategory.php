<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubCategory extends Model
{
    protected $table = 'sub_category';
    protected $fillable = ['category_id', 'sub_category'];

    public function category()
    {
        return $this->belongsTo(CategoryModel::class, 'category_id');
    }
}
