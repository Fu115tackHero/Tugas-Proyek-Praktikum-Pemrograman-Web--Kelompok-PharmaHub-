# Test Soft Delete & Restore - Full Flow

Write-Host "=== Testing Deleted Products API ===" -ForegroundColor Cyan
Write-Host ""

# Check if there are any deleted products
Write-Host "Step 1: Check deleted products in database" -ForegroundColor Yellow
Write-Host "Command: SELECT COUNT(*) FROM products WHERE is_active = FALSE;" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 2: Browser Test - Open DevTools" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:5173" -ForegroundColor White
Write-Host "2. Login as admin" -ForegroundColor White
Write-Host "3. Go to Drug Management" -ForegroundColor White
Write-Host "4. Find any product and DELETE it" -ForegroundColor White
Write-Host "5. Open DevTools (F12) -> Network tab" -ForegroundColor White
Write-Host "6. Click 'Obat Dihapus' button" -ForegroundColor White
Write-Host "7. Check for request: GET /api/products/deleted" -ForegroundColor White
Write-Host "8. Status should be 200 (was 500 before)" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Check Console Logs" -ForegroundColor Yellow
Write-Host "Expected in server logs:" -ForegroundColor White
Write-Host "  [ProductService] Fetching deleted products" -ForegroundColor Green
Write-Host "  [ProductService] Found N deleted products" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Verify Modal Display" -ForegroundColor Yellow
Write-Host "Expected: Modal shows table with deleted products" -ForegroundColor White
Write-Host "  - Product name" -ForegroundColor White
Write-Host "  - Brand" -ForegroundColor White
Write-Host "  - Price" -ForegroundColor White
Write-Host "  - Stock" -ForegroundColor White
Write-Host "  - Kembalikan button (restore)" -ForegroundColor White
Write-Host ""

Write-Host "Step 5: Test Restore Function" -ForegroundColor Yellow
Write-Host "1. Click 'Kembalikan' button in modal" -ForegroundColor White
Write-Host "2. Confirm the dialog" -ForegroundColor White
Write-Host "3. Product should be removed from deleted list" -ForegroundColor White
Write-Host "4. Product should reappear in main product list" -ForegroundColor White
Write-Host ""

Write-Host "Fixes Applied:" -ForegroundColor Cyan
Write-Host "✅ Changed query from 'categories' to 'product_categories' table" -ForegroundColor Green
Write-Host "✅ Removed unsupported COUNT(DISTINCT) and GROUP BY" -ForegroundColor Green
Write-Host "✅ Added is_primary=true filter for main image" -ForegroundColor Green
Write-Host "✅ Simplified JOIN to match getAllProducts pattern" -ForegroundColor Green
Write-Host ""

Write-Host "Issues Fixed:" -ForegroundColor Cyan
Write-Host "❌ 'relation categories does not exist'" -ForegroundColor Red
Write-Host "✅ Now uses 'product_categories'" -ForegroundColor Green
Write-Host ""

Write-Host "Next: Open browser and test!" -ForegroundColor Cyan
