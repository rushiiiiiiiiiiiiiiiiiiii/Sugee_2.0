<?php

use App\Http\Controllers\AssignItemsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserDataController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductReportController;
use App\Http\Controllers\RequestDetailsController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SpecificationController;
use App\Http\Controllers\StocksController;
use App\Http\Controllers\SubCategoryController;
use App\Http\Controllers\OutwardTransactionController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\StockTransferController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::post('/addUsers', [UserDataController::class, 'store']);
Route::post('/login', [UserDataController::class, 'login']);
Route::get('/getUsers', [UserDataController::class, 'getUsers']);
Route::delete('/deleteUsers', [UserDataController::class, 'deleteUsers']);
Route::get('/getManagers', [UserDataController::class, 'getManagers']);

Route::post('/store_category', [CategoryController::class, 'store']);
Route::get("/get_category", [CategoryController::class, 'showall']); 
Route::get("/category", [CategoryController::class, 'getCategory']); 
Route::get("/get_specific/{id}",[CategoryController::class,'category']);

Route::get("/get_subcategory",[SubCategoryController::class,'allsubcategory']);
Route::get("/get_specific_subcategory/{id}",[SubCategoryController::class,'subcategory']);

Route::post("/store_site", [SiteController::class, 'store']);   
Route::get("/get_site", [SiteController::class, 'showall']); 
Route::put('/update_site/{id}', [SiteController::class, 'update']);
Route::delete('/delete_site/{id}', [SiteController::class, 'destroy']);


Route::post("/store_request", [RequestDetailsController::class, 'store']);    
Route::get("/get_request", [RequestDetailsController::class, 'showall']);   
Route::post("/update_request/{id}", [RequestDetailsController::class, 'UpadeByInward']);   
Route::get("/specific_request/{id}", [RequestDetailsController::class, 'MyRequests']);
Route::post('/return_qty/{id}', [RequestDetailsController::class, 'Return_qty']);

Route::post("/store_stock", [StocksController::class, 'store']);    
Route::post("/get_stock", [StocksController::class, 'Quantity']);    
Route::get("/get_product_stock", [StocksController::class, 'getStocks']);    

Route::post("/store_product",[ProductController::class,'store']);
Route::get("/get_product",[ProductController::class,'AllDetails']);
Route::get("/sepcific_product/{id}",[ProductController::class,'category']);
Route::post("/delete/{id}",[ProductController::class,'DeleteProduct']);
Route::get('/product-report/{productId}', [ProductReportController::class, 'report']);


Route::post("/store_specification",[SpecificationController::class,'store']);

Route::post("/outward_transaction", [OutwardTransactionController::class, 'store']);
Route::get("/outward_transactions", [OutwardTransactionController::class, 'index']);
Route::post('/dispatch/complete', [OutwardTransactionController::class, 'markCompleted']);


Route::post("/Purchase_order", [PurchaseController::class, 'PurchaseOrder']);
Route::get("/get_purchase", [PurchaseController::class, 'GetPurchaseOrder']);
Route::post('/purchase/{id}/receive', [PurchaseController::class, 'receive']);
Route::post('/purchase/{id}/receive', [PurchaseController::class, 'receive']);

Route::post("/assign_items", [AssignItemsController::class, 'store']);  
Route::get("/assigned_items", [AssignItemsController::class, 'index']);
Route::post("/send_assign_item/{id}", [AssignItemsController::class, 'updateAssignment']);
Route::get("/assign_site/{id}", [AssignItemsController::class, 'AssignSite']);
Route::get('/transfer_history', [StockTransferController::class, 'history']);
Route::get('/site_inventory/{site_id}', [StockTransferController::class, 'getSiteInventory']);
Route::post('/transfer_stock', [StockTransferController::class, 'transfer']);
Route::post('/transfer/complete', [StockTransferController::class, 'completeTransfer']);
Route::get('/transfer/history', [StockTransferController::class, 'history']);

