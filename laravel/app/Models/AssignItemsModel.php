<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AssignItemsModel extends Model
{
    protected $table = 'assign_items';
    protected $fillable = [
        'product_id',
        'site_id',
        'quantity',
        'expected_delivery',
        'notes',
        'dispatched_qty'
        
    ];
    public function product()
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }
    public function site()
    {
        return $this->belongsTo(SiteModel::class, 'site_id');   
    }
}
