<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StocksModel extends Model
{
    protected $table = 'stocks';

    protected $fillable = [
        'product_id',
        'site_id',
        'from_site_id',
        'to_site_id',
        'transfer_status', // site_to_site
        'status',          // dispatched / completed
        'transfer_date',
        'qty',
    ];


    public function product()
    {
        return $this->belongsTo(ProductModel::class, 'product_id');
    }

    public function fromSite()
    {
        return $this->belongsTo(SiteModel::class, 'from_site_id');
    }

    public function toSite()
    {
        return $this->belongsTo(SiteModel::class, 'to_site_id');
    }
}
