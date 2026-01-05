<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpecificationModel extends Model
{
    protected $table  = 'products_sepcification';
    protected $fillable = ['spec_1','spec_2','spec_3','spec_4','desc'];
}
