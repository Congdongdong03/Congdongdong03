/**
 * 订单状态处理工具
 */

/**
 * 获取订单状态的文本描述
 * @param {string} status - 订单状态（大写格式：PENDING, IN_PROGRESS, COMPLETED, CANCELLED）
 * @returns {string} 状态文本
 */
export const getStatusText = (status) => {
  const statusMap = {
    PENDING: "待处理",
    IN_PROGRESS: "制作中",
    COMPLETED: "已完成",
    CANCELLED: "已取消",
  };
  return statusMap[status] || status;
};

/**
 * 获取订单状态的颜色
 * @param {string} status - 订单状态（大写格式：PENDING, IN_PROGRESS, COMPLETED, CANCELLED）
 * @returns {string} 状态颜色
 */
export const getStatusColor = (status) => {
  const colorMap = {
    PENDING: "#ff9500",
    IN_PROGRESS: "#007aff",
    COMPLETED: "#34c759",
    CANCELLED: "#ff3b30",
  };
  return colorMap[status] || "#666";
};
