# Product Soft Delete - Verification Test Script

Write-Host "Testing Product Soft Delete Fixes" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Route order check
Write-Host "TEST 1 - Checking route order in productRoutes.js" -ForegroundColor Yellow
Write-Host "-------------------------------------------------" -ForegroundColor Yellow

$routesFile = "api\routes\productRoutes.js"
$routesContent = Get-Content $routesFile

# Find line numbers
$deletedLineNum = $routesContent | Select-String 'router\.get.*deleted' -LineNumber | Select-Object -First 1
$paramLineNum = $routesContent | Select-String 'router\.get.*":id"' -LineNumber | Select-Object -First 1

if ($null -ne $deletedLineNum -and $null -ne $paramLineNum) {
    if ($deletedLineNum.LineNumber -lt $paramLineNum.LineNumber) {
        Write-Host "PASS - /deleted route BEFORE /:id route" -ForegroundColor Green
        Write-Host "   Line $($deletedLineNum.LineNumber) (deleted) < Line $($paramLineNum.LineNumber) (:id)" -ForegroundColor Green
    } else {
        Write-Host "FAIL - /deleted route AFTER /:id route" -ForegroundColor Red
        Write-Host "   Line $($deletedLineNum.LineNumber) (deleted) > Line $($paramLineNum.LineNumber) (:id)" -ForegroundColor Red
    }
} else {
    Write-Host "Could not find routes" -ForegroundColor Red
}
Write-Host ""

# Test 2: Delete logic check
Write-Host "TEST 2 - Checking deleteProduct logic" -ForegroundColor Yellow
Write-Host "-----------------------------------------" -ForegroundColor Yellow

$serviceFile = "api\services\productService.js"
$serviceContent = Get-Content $serviceFile

# Check if old blocking logic exists
if ($serviceContent -match "Cannot delete.*active order") {
    Write-Host "FAIL - Old blocking logic still exists" -ForegroundColor Red
} elseif ($serviceContent -match "DELETE FROM cart_items WHERE product_id") {
    Write-Host "PASS - Auto-cleanup logic found" -ForegroundColor Green
} else {
    Write-Host "WARNING - Could not verify cleanup logic" -ForegroundColor Yellow
}
Write-Host ""

# Test 3: Check files exist
Write-Host "TEST 3 - Checking critical files exist" -ForegroundColor Yellow
Write-Host "-----------------------------------------" -ForegroundColor Yellow

$files = @(
    "api\routes\productRoutes.js",
    "api\services\productService.js",
    "api\controllers\productController.js",
    "src\admin\components\DeletedProductsModal.jsx",
    "src\admin\pages\DrugManagement.jsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "PASS - $file exists" -ForegroundColor Green
    } else {
        Write-Host "FAIL - $file NOT found" -ForegroundColor Red
    }
}
Write-Host ""

# Summary
Write-Host "Summary of Tests" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "Check above for any FAIL results"
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173 in browser"
Write-Host "2. Login as admin"
Write-Host "3. Go to Drug Management page"
Write-Host "4. Test delete product with active orders"
Write-Host "5. Click 'Obat Dihapus' button to see deleted products"
Write-Host "6. Try restoring a product"
