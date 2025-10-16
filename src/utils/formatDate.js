/**
 * 统一的日期格式化工具
 * 将日期字符串转换为 "月日 时:分" 格式
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (dateString) => {
  // 参数验证
  if (!dateString) {
    return "--";
  }

  const date = new Date(dateString);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    console.warn("Invalid date string:", dateString);
    return "--";
  }

  return `${date.getMonth() + 1}月${date.getDate()}日 ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};
