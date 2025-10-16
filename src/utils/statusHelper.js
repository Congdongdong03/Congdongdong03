/**
 * 订单状态处理工具
 */

/**
 * 获取订单状态的文本描述
 * @param {string} status - 订单状态
 * @returns {string} 状态文本
 */
export const getStatusText = (status) => {
  const statusMap = {
    pending: "待处理",
    in_progress: "处理中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return statusMap[status] || status;
};

/**
 * 获取订单状态的颜色
 * @param {string} status - 订单状态
 * @returns {string} 状态颜色
 */
export const getStatusColor = (status) => {
  const colorMap = {
    pending: "#ff9500",
    in_progress: "#007aff",
    completed: "#34c759",
    cancelled: "#ff3b30",
  };
  return colorMap[status] || "#666";
};
