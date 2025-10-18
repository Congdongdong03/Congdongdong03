/**
 * @file Environment Configuration
 * @description Automatically identifies and configures settings for development and production environments.
 */

// --- 核心配置 ---
// 为不同环境定义基础配置，方便统一管理和扩展（例如未来增加'staging'环境）
const environments = {
  development: {
    // 开发环境 API 地址
    apiBaseUrl: "https://localhost:3001/api",
    // 开发环境静态资源（如图片）基础地址
    imageBaseUrl: "https://localhost:3001",
  },
  production: {
    // 生产环境 API 地址
    apiBaseUrl: "https://congdongdong03.onrender.com/api",
    // 生产环境静态资源（如图片）基础地址
    imageBaseUrl: "https://congdongdong03.onrender.com",
  },
};

// --- 环境判断 ---
// 现代前端项目（React, Vue, Taro等）最标准的做法是依赖构建工具注入的 `process.env.NODE_ENV` 变量
// 在开发模式下（npm run dev/start），它通常是 'development'
// 在生产构建后（npm run build），它通常是 'production'

// 多重环境判断策略，确保生产环境配置正确
function getEnvironment() {
  // 策略1: 检查 process.env.NODE_ENV
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  // 策略2: 检查是否在微信小程序环境中且不是开发工具
  if (typeof wx !== "undefined" && wx.getSystemInfoSync) {
    const systemInfo = wx.getSystemInfoSync();
    // 如果是在真机上运行（不是开发工具），认为是生产环境
    if (systemInfo.platform !== "devtools") {
      return "production";
    }
  }

  // 策略3: 检查 API 地址是否包含 localhost（开发环境特征）
  if (typeof window !== "undefined" && window.location) {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "development";
    }
  }

  // 策略4: 默认根据 NODE_ENV 判断
  return process.env.NODE_ENV === "development" ? "development" : "production";
}

const currentEnv = getEnvironment();
const isDevelopment = currentEnv === "development";

// --- 导出配置 ---
// 根据当前环境，从上面定义的对象中选择对应的配置
const selectedConfig = environments[currentEnv];

// 组装最终导出的配置对象
export const ENV_CONFIG = {
  // 布尔值标志，方便在代码中进行逻辑判断
  isDevelopment,
  isProduction: !isDevelopment,

  // 从选择的配置中获取对应的 URL
  apiBaseUrl: selectedConfig.apiBaseUrl,
  imageBaseUrl: selectedConfig.imageBaseUrl,

  // 图片上传地址可以基于 apiBaseUrl 动态生成，减少重复配置
  imageUploadUrl: `${selectedConfig.apiBaseUrl}/upload/image`,

  // 调试信息，方便排查问题
  debug: {
    currentEnv,
    apiUrl: selectedConfig.apiBaseUrl,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    wxPlatform:
      typeof wx !== "undefined" && wx.getSystemInfoSync
        ? wx.getSystemInfoSync().platform
        : "not-available",
  },
};

// --- 启动时打印信息 ---
// 在项目启动时打印关键配置信息，有助于快速定位环境问题
console.log("🔧 环境配置信息:", ENV_CONFIG.debug);
console.log(`🌍 当前环境: ${ENV_CONFIG.debug.currentEnv.toUpperCase()}`);
console.log("🔗 API 地址:", ENV_CONFIG.apiBaseUrl);

// 默认导出，兼容不同的导入方式
export default ENV_CONFIG;
