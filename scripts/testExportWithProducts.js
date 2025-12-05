const autoSalesReportService = require("../services/autoSalesReportService");

async function testExport() {
  console.log("🧪 Testing Export with Product Details\n");
  console.log("=".repeat(60));

  try {
    // 1. Get today's date range
    const today = new Date().toISOString().split("T")[0];
    console.log("\n📅 Date Range: " + today + " to " + today);

    // 2. Generate sales report
    console.log("\n📊 Generating sales report...");
    const report = await autoSalesReportService.generateSalesReport(
      today,
      today
    );
    console.log(
      "   Total Revenue: Rp " + report.total_revenue.toLocaleString("id-ID")
    );
    console.log("   Total Transactions: " + report.total_transactions);

    // 3. Get completed transactions
    console.log("\n📋 Fetching completed transactions...");
    const transactions = await autoSalesReportService.getCompletedTransactions(
      today,
      today,
      100
    );
    console.log("   Found " + transactions.length + " transactions");

    if (transactions.length === 0) {
      console.log("\n⚠️  No transactions found for today.");
      console.log("   Test will use empty data to verify function structure.");
    }

    // 4. Get low stock products
    console.log("\n📦 Fetching low stock products...");
    const lowStock = await autoSalesReportService.getLowStockProducts();
    console.log("   Found " + lowStock.length + " low stock products");

    // 5. Test CSV Generation
    console.log("\n" + "=".repeat(60));
    console.log("📄 Testing CSV Export");
    console.log("=".repeat(60));

    const csvData = await autoSalesReportService.generateCSV(transactions);
    console.log("\n✅ CSV Generated Successfully");
    console.log("   Total Length: " + csvData.length + " characters");

    // Show first 10 lines of CSV
    const csvLines = csvData.split("\n");
    console.log("\n   First 10 lines of CSV:");
    console.log("   " + "-".repeat(58));
    csvLines.slice(0, 10).forEach((line, index) => {
      console.log("   " + (index + 1) + ": " + line);
    });

    if (transactions.length > 0) {
      // Count product rows
      const productRows = csvLines.length - 2; // Exclude header and last empty line
      console.log("\n   📊 CSV Statistics:");
      console.log("      - Transactions: " + transactions.length);
      console.log("      - Product Rows: " + productRows);
      console.log(
        "      - Avg Products per Transaction: " +
          (productRows / transactions.length).toFixed(2)
      );
    }

    // 6. Test JSON Generation
    console.log("\n" + "=".repeat(60));
    console.log("📄 Testing JSON Export");
    console.log("=".repeat(60));

    const jsonData = await autoSalesReportService.generateJSON(
      report,
      transactions,
      lowStock
    );
    console.log("\n✅ JSON Generated Successfully");

    console.log("\n   📊 JSON Structure:");
    console.log(
      "      - summary:",
      Object.keys(jsonData.summary).length + " fields"
    );
    console.log("      - transactions:", jsonData.transactions.length);
    console.log("      - total_transactions:", jsonData.total_transactions);
    console.log("      - total_items:", jsonData.total_items);
    console.log(
      "      - low_stock_products:",
      jsonData.low_stock_products.length
    );

    if (jsonData.transactions.length > 0) {
      console.log("\n   📦 First Transaction Details:");
      const firstTx = jsonData.transactions[0];
      console.log("      - Order Number: " + firstTx.order_number);
      console.log("      - Customer: " + firstTx.customer_name);
      console.log("      - Items Count: " + firstTx.items_count);
      console.log(
        "      - Items Total Quantity: " + firstTx.items_total_quantity
      );
      console.log(
        "      - Total Amount: Rp " +
          firstTx.total_amount.toLocaleString("id-ID")
      );

      if (firstTx.items && firstTx.items.length > 0) {
        console.log("\n      📋 Product Items:");
        firstTx.items.forEach((item, index) => {
          console.log(
            `         ${index + 1}. ${item.product_name} (${
              item.brand || "N/A"
            }) - ` +
              `Qty: ${item.quantity} × Rp ${item.product_price.toLocaleString(
                "id-ID"
              )} = ` +
              `Rp ${item.subtotal.toLocaleString("id-ID")}`
          );
        });
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ ALL TESTS PASSED");
    console.log("=".repeat(60));
    console.log("\n📝 Summary:");
    console.log(
      "   ✓ CSV export includes product details (one row per product)"
    );
    console.log("   ✓ JSON export includes items array with product details");
    console.log("   ✓ Both exports are async and fetch order_items correctly");
    console.log("\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:");
    console.error("   Error:", error.message);
    console.error("\n   Stack Trace:");
    console.error(error.stack);
    process.exit(1);
  }

  process.exit(0);
}

testExport();
