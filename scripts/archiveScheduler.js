/**
 * Archive Scheduler - Automated Cleanup for Old Archived Data
 * 
 * This script handles "real archiving" by permanently removing old soft-deleted data
 * to prevent database bloat and maintain optimal performance.
 * 
 * Cleanup Rules:
 * 1. Notifications: Hard delete if archived > 30 days
 * 2. Orders: Log warning for completed/cancelled orders archived > 2 years
 *    (Ready for backup migration to separate table/storage)
 * 
 * Usage:
 * - Manual: node api/scripts/archiveScheduler.js
 * - Scheduled: Use node-cron or external cron job
 * 
 * @requires pg
 * @requires node-cron (optional, for automated scheduling)
 */

const pool = require("../config/database");

/**
 * Configuration for cleanup thresholds
 */
const CLEANUP_CONFIG = {
  // Days before hard deleting archived notifications
  NOTIFICATION_RETENTION_DAYS: 30,
  
  // Years before flagging old archived orders for backup
  ORDER_RETENTION_YEARS: 2,
  
  // Batch size for processing (prevent memory issues)
  BATCH_SIZE: 1000,
};

/**
 * Hard delete old archived notifications (> 30 days)
 * @returns {object} Cleanup statistics
 */
async function cleanupArchivedNotifications() {
  const client = await pool.connect();
  
  try {
    console.log("\n[ArchiveScheduler] Starting notification cleanup...");
    console.log(`[ArchiveScheduler] Retention policy: ${CLEANUP_CONFIG.NOTIFICATION_RETENTION_DAYS} days`);

    // Calculate cutoff date
    const query = `
      DELETE FROM notifications
      WHERE is_archived = TRUE
        AND created_at < NOW() - INTERVAL '${CLEANUP_CONFIG.NOTIFICATION_RETENTION_DAYS} days'
      RETURNING notification_id, user_id, type, created_at
    `;

    const result = await client.query(query);
    
    const deletedCount = result.rows.length;
    
    if (deletedCount > 0) {
      console.log(`[ArchiveScheduler] ✓ Deleted ${deletedCount} old archived notifications`);
      
      // Log sample of deleted notifications (first 5)
      const sample = result.rows.slice(0, 5);
      console.log("[ArchiveScheduler] Sample deleted notifications:");
      sample.forEach((notif, index) => {
        console.log(`  ${index + 1}. ID: ${notif.notification_id}, User: ${notif.user_id}, Type: ${notif.type}, Created: ${notif.created_at}`);
      });
      
      if (deletedCount > 5) {
        console.log(`  ... and ${deletedCount - 5} more`);
      }
    } else {
      console.log("[ArchiveScheduler] No old notifications to clean up");
    }

    return {
      success: true,
      deleted_count: deletedCount,
      retention_days: CLEANUP_CONFIG.NOTIFICATION_RETENTION_DAYS,
      cleanup_date: new Date().toISOString(),
    };
    
  } catch (error) {
    console.error("[ArchiveScheduler] Error cleaning up notifications:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Identify old archived orders for backup migration (> 2 years)
 * Does NOT delete, only reports for manual review/backup
 * @returns {object} Analysis statistics
 */
async function analyzeOldArchivedOrders() {
  const client = await pool.connect();
  
  try {
    console.log("\n[ArchiveScheduler] Analyzing old archived orders...");
    console.log(`[ArchiveScheduler] Retention policy: ${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years`);

    // Find completed/cancelled orders that are archived and old
    const query = `
      SELECT 
        o.order_id,
        o.order_number,
        o.user_id,
        o.order_status,
        o.total_amount,
        o.created_at,
        o.completed_at,
        o.cancelled_at,
        CASE
          WHEN o.completed_at IS NOT NULL THEN o.completed_at
          WHEN o.cancelled_at IS NOT NULL THEN o.cancelled_at
          ELSE o.created_at
        END as final_date,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.is_archived = TRUE
        AND o.order_status IN ('completed', 'cancelled')
        AND (
          (o.completed_at IS NOT NULL AND o.completed_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
          OR
          (o.cancelled_at IS NOT NULL AND o.cancelled_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
          OR
          (o.completed_at IS NULL AND o.cancelled_at IS NULL AND o.created_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
        )
      GROUP BY o.order_id
      ORDER BY final_date ASC
      LIMIT ${CLEANUP_CONFIG.BATCH_SIZE}
    `;

    const result = await client.query(query);
    
    const oldOrderCount = result.rows.length;
    
    if (oldOrderCount > 0) {
      console.log(`[ArchiveScheduler] ⚠️  Found ${oldOrderCount} old archived orders eligible for backup`);
      console.log("[ArchiveScheduler] These orders should be migrated to backup storage");
      
      // Calculate statistics
      const totalValue = result.rows.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      const totalItems = result.rows.reduce((sum, order) => sum + parseInt(order.item_count), 0);
      
      console.log(`[ArchiveScheduler] Total value: $${totalValue.toFixed(2)}`);
      console.log(`[ArchiveScheduler] Total items: ${totalItems}`);
      
      // Show oldest 5 orders
      const oldest = result.rows.slice(0, 5);
      console.log("\n[ArchiveScheduler] Oldest orders:");
      oldest.forEach((order, index) => {
        console.log(`  ${index + 1}. Order: ${order.order_number}, Status: ${order.order_status}, Date: ${order.final_date}, Amount: $${order.total_amount}`);
      });
      
      if (oldOrderCount > 5) {
        console.log(`  ... and ${oldOrderCount - 5} more`);
      }
      
      console.log("\n[ArchiveScheduler] ⚠️  ACTION REQUIRED:");
      console.log("[ArchiveScheduler] Consider implementing order backup migration before deletion");
      console.log("[ArchiveScheduler] Suggested backup table: `archived_orders_backup`");
      
    } else {
      console.log("[ArchiveScheduler] No old orders requiring backup at this time");
    }

    return {
      success: true,
      old_order_count: oldOrderCount,
      retention_years: CLEANUP_CONFIG.ORDER_RETENTION_YEARS,
      requires_backup: oldOrderCount > 0,
      total_value: oldOrderCount > 0 ? result.rows.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) : 0,
      analysis_date: new Date().toISOString(),
      orders: result.rows,
    };
    
  } catch (error) {
    console.error("[ArchiveScheduler] Error analyzing old orders:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Optional: Hard delete very old archived orders (use with caution!)
 * This function is disabled by default. Requires explicit activation.
 * 
 * @param {boolean} confirmDelete - Must be true to execute
 * @returns {object} Deletion statistics
 */
async function hardDeleteOldOrders(confirmDelete = false) {
  if (!confirmDelete) {
    console.log("\n[ArchiveScheduler] Hard delete is DISABLED");
    console.log("[ArchiveScheduler] Set confirmDelete=true to enable permanent deletion");
    return { success: false, message: "Hard delete not confirmed" };
  }

  const client = await pool.connect();
  
  try {
    await client.query("BEGIN");
    
    console.log("\n[ArchiveScheduler] ⚠️  HARD DELETE INITIATED");
    console.log("[ArchiveScheduler] This will PERMANENTLY remove old archived orders");

    // First, delete order items
    const deleteItemsQuery = `
      DELETE FROM order_items
      WHERE order_id IN (
        SELECT order_id FROM orders
        WHERE is_archived = TRUE
          AND order_status IN ('completed', 'cancelled')
          AND (
            (completed_at IS NOT NULL AND completed_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
            OR
            (cancelled_at IS NOT NULL AND cancelled_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
          )
      )
      RETURNING order_item_id
    `;
    
    const itemsResult = await client.query(deleteItemsQuery);
    const deletedItemsCount = itemsResult.rows.length;
    
    console.log(`[ArchiveScheduler] Deleted ${deletedItemsCount} order items`);

    // Delete order status history
    const deleteHistoryQuery = `
      DELETE FROM order_status_history
      WHERE order_id IN (
        SELECT order_id FROM orders
        WHERE is_archived = TRUE
          AND order_status IN ('completed', 'cancelled')
          AND (
            (completed_at IS NOT NULL AND completed_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
            OR
            (cancelled_at IS NOT NULL AND cancelled_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
          )
      )
      RETURNING history_id
    `;
    
    const historyResult = await client.query(deleteHistoryQuery);
    const deletedHistoryCount = historyResult.rows.length;
    
    console.log(`[ArchiveScheduler] Deleted ${deletedHistoryCount} status history records`);

    // Finally, delete orders
    const deleteOrdersQuery = `
      DELETE FROM orders
      WHERE is_archived = TRUE
        AND order_status IN ('completed', 'cancelled')
        AND (
          (completed_at IS NOT NULL AND completed_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
          OR
          (cancelled_at IS NOT NULL AND cancelled_at < NOW() - INTERVAL '${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years')
        )
      RETURNING order_id, order_number
    `;
    
    const ordersResult = await client.query(deleteOrdersQuery);
    const deletedOrdersCount = ordersResult.rows.length;
    
    await client.query("COMMIT");
    
    console.log(`[ArchiveScheduler] ✓ HARD DELETE COMPLETED`);
    console.log(`[ArchiveScheduler] Deleted ${deletedOrdersCount} orders with ${deletedItemsCount} items`);

    return {
      success: true,
      deleted_orders: deletedOrdersCount,
      deleted_items: deletedItemsCount,
      deleted_history: deletedHistoryCount,
      deletion_date: new Date().toISOString(),
    };
    
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[ArchiveScheduler] Error during hard delete:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all cleanup tasks
 * @param {object} options - Execution options
 * @returns {object} Complete cleanup report
 */
async function runScheduledCleanup(options = {}) {
  const startTime = Date.now();
  
  console.log("\n============================================");
  console.log("   PHARMAHUB ARCHIVE SCHEDULER");
  console.log("   Automated Data Cleanup Process");
  console.log("============================================");
  console.log(`Started at: ${new Date().toISOString()}`);
  
  const report = {
    start_time: new Date().toISOString(),
    tasks: {},
    errors: [],
  };

  try {
    // Task 1: Clean up old notifications
    try {
      report.tasks.notifications = await cleanupArchivedNotifications();
    } catch (error) {
      report.errors.push({
        task: "notifications",
        error: error.message,
      });
    }

    // Task 2: Analyze old orders
    try {
      report.tasks.orders = await analyzeOldArchivedOrders();
    } catch (error) {
      report.errors.push({
        task: "orders",
        error: error.message,
      });
    }

    // Task 3: Hard delete orders (if enabled)
    if (options.hardDeleteOrders) {
      try {
        report.tasks.hard_delete = await hardDeleteOldOrders(true);
      } catch (error) {
        report.errors.push({
          task: "hard_delete",
          error: error.message,
        });
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    report.end_time = new Date().toISOString();
    report.duration_seconds = parseFloat(duration);
    report.success = report.errors.length === 0;

    console.log("\n============================================");
    console.log("   CLEANUP SUMMARY");
    console.log("============================================");
    console.log(`Duration: ${duration}s`);
    console.log(`Status: ${report.success ? "✓ SUCCESS" : "⚠️  PARTIAL FAILURE"}`);
    
    if (report.errors.length > 0) {
      console.log(`\nErrors encountered: ${report.errors.length}`);
      report.errors.forEach((err, i) => {
        console.log(`  ${i + 1}. Task: ${err.task}, Error: ${err.error}`);
      });
    }
    
    console.log("============================================\n");

    return report;
    
  } catch (error) {
    console.error("[ArchiveScheduler] Fatal error during cleanup:", error.message);
    report.errors.push({
      task: "scheduler",
      error: error.message,
    });
    report.success = false;
    return report;
  }
}

/**
 * Setup scheduled execution using node-cron
 * Requires: npm install node-cron
 * 
 * @param {string} cronExpression - Cron schedule (default: daily at 2 AM)
 */
function setupCronJob(cronExpression = "0 2 * * *") {
  try {
    const cron = require("node-cron");
    
    console.log("[ArchiveScheduler] Setting up cron job...");
    console.log(`[ArchiveScheduler] Schedule: ${cronExpression}`);
    console.log("[ArchiveScheduler] (Daily at 2:00 AM by default)");

    cron.schedule(cronExpression, async () => {
      console.log("\n[ArchiveScheduler] Cron job triggered");
      await runScheduledCleanup();
    });

    console.log("[ArchiveScheduler] ✓ Cron job scheduled successfully");
    
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error("[ArchiveScheduler] node-cron not installed");
      console.error("[ArchiveScheduler] Install with: npm install node-cron");
    } else {
      console.error("[ArchiveScheduler] Error setting up cron:", error.message);
    }
  }
}

// ============================================
// CLI Execution
// ============================================

// If script is run directly (not imported)
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options = {
    hardDeleteOrders: args.includes("--hard-delete"),
    setupCron: args.includes("--cron"),
    notificationsOnly: args.includes("--notifications-only"),
    ordersOnly: args.includes("--orders-only"),
  };

  // Show help
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Archive Scheduler - Usage Guide
================================

Manual Execution:
  node api/scripts/archiveScheduler.js                    Run all cleanup tasks
  node api/scripts/archiveScheduler.js --notifications-only   Clean notifications only
  node api/scripts/archiveScheduler.js --orders-only         Analyze orders only
  node api/scripts/archiveScheduler.js --hard-delete         Include hard delete of old orders
  node api/scripts/archiveScheduler.js --cron                Setup automated cron job

Schedule (requires node-cron):
  npm install node-cron
  node api/scripts/archiveScheduler.js --cron

Configuration:
  - Notification retention: ${CLEANUP_CONFIG.NOTIFICATION_RETENTION_DAYS} days
  - Order retention: ${CLEANUP_CONFIG.ORDER_RETENTION_YEARS} years
  - Batch size: ${CLEANUP_CONFIG.BATCH_SIZE} records

⚠️  WARNING: --hard-delete permanently removes data. Use with caution!
    `);
    process.exit(0);
  }

  // Setup cron if requested
  if (options.setupCron) {
    setupCronJob();
    console.log("[ArchiveScheduler] Cron job running... Press Ctrl+C to stop");
    // Keep process alive
    return;
  }

  // Run cleanup
  (async () => {
    try {
      if (options.notificationsOnly) {
        await cleanupArchivedNotifications();
      } else if (options.ordersOnly) {
        await analyzeOldArchivedOrders();
      } else {
        await runScheduledCleanup(options);
      }
      
      process.exit(0);
    } catch (error) {
      console.error("[ArchiveScheduler] Execution failed:", error);
      process.exit(1);
    }
  })();
}

// ============================================
// Module Exports
// ============================================

module.exports = {
  cleanupArchivedNotifications,
  analyzeOldArchivedOrders,
  hardDeleteOldOrders,
  runScheduledCleanup,
  setupCronJob,
  CLEANUP_CONFIG,
};
