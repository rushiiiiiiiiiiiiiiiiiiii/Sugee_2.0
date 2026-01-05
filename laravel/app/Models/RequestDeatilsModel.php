<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class RequestDeatilsModel extends Model
{
    protected $table = 'request_details';
    protected $fillable = [
        'site_id',
        'product_request_id',
        'received_qty',
        'issued_qty',
        'dispatched_qty',
        'return_qty',
        'remark',
        'urgency',
        'deliveryDate',
        'status'
    ];
    public function product()
    {
        return $this->belongsTo(ProductModel::class, 'product_request_id');
    }
    public function site()
    {
        return $this->belongsTo(SiteModel::class, 'site_id');
    }
    
}
