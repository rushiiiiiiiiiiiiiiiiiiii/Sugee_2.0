<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductModel extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'name',
        'value',
        'qty',              // ✅ ADDED
        'details_id',
        'category_id',
        'sub_category_id',
    ];

    // ✅ CATEGORY RELATION
    public function category()
    {
        return $this->belongsTo(CategoryModel::class, 'category_id');
    }

    // ✅ SPECIFICATION RELATION
    public function specification()
    {
        return $this->belongsTo(SpecificationModel::class, 'details_id');
    }

    // ✅ SUBCATEGORY RELATION
    public function subcategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category_id');
    }
}
