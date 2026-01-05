<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutwardTransactionModel extends Model
{
    protected $table = 'outward_transaction';
    protected $fillable = ['product_id', 'site_id', 'quantity','request_id','type'];

    public function product()
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }
    public function site()
    {
        return $this->belongsTo(SiteModel::class, 'site_id');
    }
    public function request()
    {
        return $this->belongsTo(RequestDeatilsModel::class, 'request_id');  
    }
}
