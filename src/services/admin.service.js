import api from "./api";

/**
 * Admin Service
 * Handles admin-specific API calls for user management
 */

const AdminService = {
  /**
   * Get all users (customers)
   */
  async getAllUsers() {
    return api.get("/admin/dashboard/users");
  },

  /**
   * Toggle user active status (Suspend/Activate)
   * @param {number} userId - The user ID
   */
  async toggleUserStatus(userId) {
    return api.patch(`/admin/dashboard/users/${userId}/status`);
  },
};

export default AdminService;
