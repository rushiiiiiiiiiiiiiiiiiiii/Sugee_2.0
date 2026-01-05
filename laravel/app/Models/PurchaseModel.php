<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseModel extends Model
{
    protected $table = 'purchase';
    protected $fillable = [
        'supplier',
        'category',
        'sub_category',
        'product_name',
        'quantity',
        'received_qty',
        'expected_delivery',
        'notes',
    ];
    public function category()
    {
        return $this->belongsTo(CategoryModel::class, 'category');
    }
    public function subCategory()
    {
        return $this->belongsTo(SubCategory::class, 'sub_category');
    }

}
