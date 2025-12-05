/**
 * Activity Logging Service
 * Records all admin actions in the system
 */

const pool = require("../config/database");

/**
 * Log admin activity
 * @param {Object} activityData
 * @param {number} activityData.adminId - ID of admin performing action
 * @param {string} activityData.actionType - CREATE, UPDATE, DELETE
 * @param {string} activityData.entityType - PRODUCT, CATEGORY, COUPON, ORDER, USER
 * @param {number} activityData.entityId - ID of affected entity
 * @param {string} activityData.entityName - Name of affected entity
 * @param {string} activityData.description - Description of action
 * @param {string} activityData.ipAddress - IP address of admin
 * @param {string} activityData.userAgent - User agent string
 */
async function logActivity(activityData) {
  const {
    adminId,
    actionType,
    entityType,
    entityId,
    entityName,
    description,
    ipAddress,
    userAgent,
  } = activityData;

  try {
    const query = `
      INSERT INTO admin_activity_logs 
        (admin_id, action_type, entity_type, entity_id, entity_name, description, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const values = [
      adminId,
      actionType,
      entityType,
      entityId || null,
      entityName || null,
      description || null,
      ipAddress || null,
      userAgent || null,
    ];

    const result = await pool.query(query, values);
    console.log(`📝 Activity logged: ${actionType} ${entityType} by admin ${adminId}`);
    return result.rows[0];
  } catch (error) {
    console.error("❌ Failed to log activity:", error.message);
    // Don't throw error - logging failure shouldn't break main operation
    return null;
  }
}

/**
 * Get recent admin activities
 * @param {Object} options
 * @param {number} options.limit - Number of records to fetch (default: 50)
 * @param {number} options.offset - Offset for pagination (default: 0)
 * @param {number} options.adminId - Filter by specific admin (optional)
 * @param {string} options.entityType - Filter by entity type (optional)
 * @param {string} options.actionType - Filter by action type (optional)
 */
async function getActivities(options = {}) {
  const {
    limit = 50,
    offset = 0,
    adminId,
    entityType,
    actionType,
  } = options;

  try {
    let query = `
      SELECT 
        aal.*,
        u.name as admin_name,
        u.email as admin_email
      FROM admin_activity_logs aal
      LEFT JOIN users u ON aal.admin_id = u.user_id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (adminId) {
      query += ` AND aal.admin_id = $${paramCount}`;
      values.push(adminId);
      paramCount++;
    }

    if (entityType) {
      query += ` AND aal.entity_type = $${paramCount}`;
      values.push(entityType);
      paramCount++;
    }

    if (actionType) {
      query += ` AND aal.action_type = $${paramCount}`;
      values.push(actionType);
      paramCount++;
    }

    query += ` ORDER BY aal.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching activities:", error.message);
    throw error;
  }
}

/**
 * Get activity statistics
 * @param {Object} options
 * @param {number} options.adminId - Filter by admin ID (optional)
 * @param {number} options.days - Number of days to look back (default: 30)
 */
async function getActivityStats(options = {}) {
  const { adminId, days = 30 } = options;

  try {
    let query = `
      SELECT 
        action_type,
        entity_type,
        COUNT(*) as count
      FROM admin_activity_logs
      WHERE created_at >= NOW() - INTERVAL '${days} days'
    `;

    const values = [];
    if (adminId) {
      query += ` AND admin_id = $1`;
      values.push(adminId);
    }

    query += `
      GROUP BY action_type, entity_type
      ORDER BY count DESC;
    `;

    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error("❌ Error fetching activity stats:", error.message);
    throw error;
  }
}

/**
 * Get total activity count
 * @param {Object} filters - Optional filters (adminId, entityType, actionType)
 */
async function getActivityCount(filters = {}) {
  const { adminId, entityType, actionType } = filters;

  try {
    let query = "SELECT COUNT(*) FROM admin_activity_logs WHERE 1=1";
    const values = [];
    let paramCount = 1;

    if (adminId) {
      query += ` AND admin_id = $${paramCount}`;
      values.push(adminId);
      paramCount++;
    }

    if (entityType) {
      query += ` AND entity_type = $${paramCount}`;
      values.push(entityType);
      paramCount++;
    }

    if (actionType) {
      query += ` AND action_type = $${paramCount}`;
      values.push(actionType);
      paramCount++;
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  } catch (error) {
    console.error("❌ Error counting activities:", error.message);
    throw error;
  }
}

module.exports = {
  logActivity,
  getActivities,
  getActivityStats,
  getActivityCount,
};
