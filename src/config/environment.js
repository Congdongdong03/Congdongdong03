// 环境配置
// 自动识别开发/生产环境

// 判断是否为开发环境
const isDevelopment = () => {
  // 🔧 临时强制生产环境 - 解决环境判断问题
  // 在生产环境中，直接返回 false
  return false;

  // 原始逻辑（暂时注释，因为环境判断有问题）
  /*
  // 强制生产环境模式（如果设置了环境变量）
  if (process.env.FORCE_PRODUCTION === "true") {
    return false;
  }

  // 优先检查：如果明确设置了生产环境标志
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  // 方法1: 检查是否在微信开发者工具中
  if (typeof wx !== "undefined" && wx.getSystemInfoSync) {
    const systemInfo = wx.getSystemInfoSync();
    // 微信开发者工具的特征
    if (systemInfo.platform === "devtools") {
      return true;
    }
  }

  // 方法2: 检查Taro环境变量
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // 方法3: 检查是否在本地开发服务器
  if (typeof window !== "undefined" && window.location) {
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("localhost")
    );
  }

  // 方法4: 检查Taro编译环境
  if (
    process.env.TARO_ENV === "weapp" &&
    process.env.NODE_ENV === "development"
  ) {
    return true;
  }

  // 默认返回false（生产环境）
  return false;
  */
};

// 获取API基础URL
const getApiBaseUrl = () => {
  const isDev = isDevelopment();

  if (isDev) {
    // 开发环境：使用本地HTTPS服务器
    return "https://localhost:3001/api";
  } else {
    // 生产环境：使用Render部署的服务器
    return "https://congdongdong03.onrender.com/api";
  }
};

// 获取图片上传URL
const getImageUploadUrl = () => {
  const isDev = isDevelopment();

  if (isDev) {
    return "https://localhost:3001/api/upload/image";
  } else {
    return "https://congdongdong03.onrender.com/api/upload/image";
  }
};

// 获取图片基础URL（用于显示）
const getImageBaseUrl = () => {
  const isDev = isDevelopment();

  if (isDev) {
    return "https://localhost:3001";
  } else {
    return "https://congdongdong03.onrender.com";
  }
};

// 环境配置对象
export const ENV_CONFIG = {
  isDevelopment: isDevelopment(),
  isProduction: !isDevelopment(),
  apiBaseUrl: getApiBaseUrl(),
  imageUploadUrl: getImageUploadUrl(),
  imageBaseUrl: getImageBaseUrl(),

  // 调试信息
  debug: {
    currentEnv: isDevelopment() ? "development" : "production",
    apiUrl: getApiBaseUrl(),
    timestamp: new Date().toISOString(),
  },
};

// 打印环境信息（开发和生产环境都打印，便于调试）
console.log("🔧 环境配置信息:", ENV_CONFIG.debug);
console.log("🌍 当前环境:", ENV_CONFIG.isDevelopment ? "开发环境" : "生产环境");
console.log("🔗 API地址:", ENV_CONFIG.apiBaseUrl);

export default ENV_CONFIG;
