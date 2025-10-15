import Taro from "@tarojs/taro";

// 模拟微信订阅消息
export const sendOrderNotification = async (orderData) => {
  try {
    // 在实际项目中，这里会调用微信的订阅消息API
    // 现在使用模拟数据

    const notificationData = {
      title: "您有新的点餐订单！",
      content: generateNotificationContent(orderData),
      orderId: orderData._id,
      timestamp: new Date().toISOString(),
    };

    // 模拟发送通知
    console.log("📱 发送订单通知:", notificationData);

    // 在实际项目中，这里会调用微信云函数的订阅消息接口
    // await wx.cloud.callFunction({
    //   name: 'sendNotification',
    //   data: notificationData
    // });

    return { success: true, data: notificationData };
  } catch (error) {
    console.error("发送通知失败:", error);
    return { success: false, error };
  }
};

// 生成通知内容
const generateNotificationContent = (orderData) => {
  const { items, totalPoints } = orderData;
  const dishNames = items.map((item) => item.name).join("、");
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 1) {
    return `${dishNames} (${itemCount}份) - ${totalPoints}积分`;
  } else {
    return `${dishNames} 等${items.length}道菜 (${itemCount}份) - ${totalPoints}积分`;
  }
};

// 请求订阅消息权限
export const requestNotificationPermission = async () => {
  try {
    // 在实际项目中，这里会调用微信的订阅消息授权
    const result = await Taro.requestSubscribeMessage({
      tmplIds: ["your-template-id"], // 替换为实际的模板ID
    });

    console.log("订阅消息授权结果:", result);
    return result;
  } catch (error) {
    console.error("请求订阅消息权限失败:", error);
    return { success: false, error };
  }
};

// 模拟通知历史
export const mockNotifications = [
  {
    _id: "notif_001",
    title: "您有新的点餐订单！",
    content: "可乐鸡翅 (1份) - 65积分",
    orderId: "order_001",
    timestamp: "2024-01-15T18:30:00Z",
    read: false,
  },
  {
    _id: "notif_002",
    title: "您有新的点餐订单！",
    content: "番茄炒蛋、拍黄瓜 等2道菜 (3份) - 110积分",
    orderId: "order_002",
    timestamp: "2024-01-14T19:15:00Z",
    read: true,
  },
];

// 获取通知历史
export const getNotificationHistory = async () => {
  // 模拟API延迟
  await new Promise((resolve) => setTimeout(resolve, 300));
  return mockNotifications;
};

// 标记通知为已读
export const markNotificationAsRead = async (notificationId) => {
  const notification = mockNotifications.find((n) => n._id === notificationId);
  if (notification) {
    notification.read = true;
    return { success: true };
  }
  return { success: false };
};
