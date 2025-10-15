// 模拟数据服务 - 家庭点餐小程序
// 包含所有核心数据结构和业务逻辑

// 用户数据
export const mockUsers = [
  {
    _id: "user_chef_001",
    openid: "chef_openid_001",
    nickname: "大厨",
    avatar: "/assets/icons/my.png",
    role: "chef",
    points: 9999,
    createTime: "2024-01-01T00:00:00Z",
  },
  {
    _id: "user_diner_001",
    openid: "diner_openid_001",
    nickname: "贝儿",
    avatar: "/assets/icons/my.png",
    role: "diner",
    points: 1500,
    createTime: "2024-01-01T00:00:00Z",
  },
  {
    _id: "user_diner_002",
    openid: "diner_openid_002",
    nickname: "朋友A",
    avatar: "/assets/icons/my.png",
    role: "diner",
    points: 800,
    createTime: "2024-01-01T00:00:00Z",
  },
];

// 菜品分类
export const mockCategories = [
  { id: "hot_dishes", name: "热菜" },
  { id: "cold_dishes", name: "凉菜" },
  { id: "soup", name: "汤品" },
  { id: "staple", name: "主食" },
  { id: "dessert", name: "甜品" },
];

// 菜品数据
export const mockDishes = [
  // 热菜
  {
    _id: "dish_001",
    name: "可乐鸡翅",
    description: "香甜可口的经典家常菜，老少皆宜",
    image: "/assets/icons/default-food.png",
    price: 65,
    category: "热菜",
    sales: 189,
    createTime: "2024-01-01T00:00:00Z",
    creator: "diner_openid_001",
  },
  {
    _id: "dish_002",
    name: "番茄炒蛋",
    description: "酸甜开胃，营养丰富，下饭神器",
    image: "/assets/icons/default-food.png",
    price: 35,
    category: "热菜",
    sales: 267,
    createTime: "2024-01-01T00:00:00Z",
    creator: "chef_openid_001",
  },
  {
    _id: "dish_003",
    name: "红烧肉",
    description: "肥而不腻，入口即化的经典家常菜",
    image: "/assets/icons/default-food.png",
    price: 80,
    category: "热菜",
    sales: 156,
    createTime: "2024-01-01T00:00:00Z",
    creator: "diner_openid_001",
  },
  // 凉菜
  {
    _id: "dish_004",
    name: "拍黄瓜",
    description: "清爽解腻，夏日必备",
    image: "/assets/icons/default-food.png",
    price: 25,
    category: "凉菜",
    sales: 67,
    createTime: "2024-01-01T00:00:00Z",
    creator: "diner_openid_002",
  },
  {
    _id: "dish_005",
    name: "凉拌木耳",
    description: "爽脆可口，营养丰富",
    image: "/assets/icons/default-food.png",
    price: 30,
    category: "凉菜",
    sales: 45,
    createTime: "2024-01-01T00:00:00Z",
    creator: "chef_openid_001",
  },
  // 汤品
  {
    _id: "dish_006",
    name: "番茄鸡蛋汤",
    description: "酸甜开胃，营养丰富",
    image: "/assets/icons/default-food.png",
    price: 35,
    category: "汤品",
    sales: 123,
    createTime: "2024-01-01T00:00:00Z",
    creator: "diner_openid_001",
  },
  {
    _id: "dish_007",
    name: "冬瓜排骨汤",
    description: "清淡鲜美，滋补养生",
    image: "/assets/icons/default-food.png",
    price: 65,
    category: "汤品",
    sales: 78,
    createTime: "2024-01-01T00:00:00Z",
    creator: "chef_openid_001",
  },
  // 主食
  {
    _id: "dish_008",
    name: "蛋炒饭",
    description: "粒粒分明，香气扑鼻",
    image: "/assets/icons/default-food.png",
    price: 40,
    category: "主食",
    sales: 189,
    createTime: "2024-01-01T00:00:00Z",
    creator: "diner_openid_001",
  },
  {
    _id: "dish_009",
    name: "手擀面",
    description: "劲道爽滑，手工制作",
    image: "/assets/icons/default-food.png",
    price: 50,
    category: "主食",
    sales: 56,
    createTime: "2024-01-01T00:00:00Z",
    creator: "chef_openid_001",
  },
];

// 菜品原材料映射表
export const mockDishMaterials = [
  // 红烧肉
  {
    _id: "dm_001",
    dish_id: "dish_001",
    material_name: "五花肉",
    quantity_needed: 500,
    unit: "g",
  },
  {
    _id: "dm_002",
    dish_id: "dish_001",
    material_name: "生抽",
    quantity_needed: 30,
    unit: "ml",
  },
  {
    _id: "dm_003",
    dish_id: "dish_001",
    material_name: "老抽",
    quantity_needed: 15,
    unit: "ml",
  },
  {
    _id: "dm_004",
    dish_id: "dish_001",
    material_name: "冰糖",
    quantity_needed: 20,
    unit: "g",
  },
  // 宫保鸡丁
  {
    _id: "dm_005",
    dish_id: "dish_002",
    material_name: "鸡胸肉",
    quantity_needed: 300,
    unit: "g",
  },
  {
    _id: "dm_006",
    dish_id: "dish_002",
    material_name: "花生米",
    quantity_needed: 100,
    unit: "g",
  },
  {
    _id: "dm_007",
    dish_id: "dish_002",
    material_name: "干辣椒",
    quantity_needed: 10,
    unit: "个",
  },
  // 麻婆豆腐
  {
    _id: "dm_008",
    dish_id: "dish_003",
    material_name: "嫩豆腐",
    quantity_needed: 400,
    unit: "g",
  },
  {
    _id: "dm_009",
    dish_id: "dish_003",
    material_name: "猪肉末",
    quantity_needed: 100,
    unit: "g",
  },
  {
    _id: "dm_010",
    dish_id: "dish_003",
    material_name: "豆瓣酱",
    quantity_needed: 20,
    unit: "g",
  },
  // 拍黄瓜
  {
    _id: "dm_011",
    dish_id: "dish_004",
    material_name: "黄瓜",
    quantity_needed: 2,
    unit: "根",
  },
  {
    _id: "dm_012",
    dish_id: "dish_004",
    material_name: "大蒜",
    quantity_needed: 3,
    unit: "瓣",
  },
  {
    _id: "dm_013",
    dish_id: "dish_004",
    material_name: "醋",
    quantity_needed: 15,
    unit: "ml",
  },
  // 番茄鸡蛋汤
  {
    _id: "dm_014",
    dish_id: "dish_006",
    material_name: "番茄",
    quantity_needed: 2,
    unit: "个",
  },
  {
    _id: "dm_015",
    dish_id: "dish_006",
    material_name: "鸡蛋",
    quantity_needed: 2,
    unit: "个",
  },
  {
    _id: "dm_016",
    dish_id: "dish_006",
    material_name: "葱花",
    quantity_needed: 10,
    unit: "g",
  },
];

// 共享库存
export const mockInventory = [
  {
    _id: "inv_001",
    name: "鸡蛋",
    quantity: 8,
    unit: "个",
    status: "normal",
    updateTime: "2024-01-15T10:30:00Z",
    updater: "diner_openid_001",
  },
  {
    _id: "inv_002",
    name: "番茄",
    quantity: 3,
    unit: "个",
    status: "normal",
    updateTime: "2024-01-15T09:15:00Z",
    updater: "chef_openid_001",
  },
  {
    _id: "inv_003",
    name: "生抽",
    quantity: 0,
    unit: "瓶",
    status: "out_of_stock",
    updateTime: "2024-01-14T16:20:00Z",
    updater: "diner_openid_001",
  },
  {
    _id: "inv_004",
    name: "大蒜",
    quantity: 5,
    unit: "瓣",
    status: "normal",
    updateTime: "2024-01-15T08:45:00Z",
    updater: "diner_openid_002",
  },
  {
    _id: "inv_005",
    name: "五花肉",
    quantity: 0,
    unit: "g",
    status: "out_of_stock",
    updateTime: "2024-01-13T14:10:00Z",
    updater: "chef_openid_001",
  },
];

// 订单数据
export const mockOrders = [
  {
    _id: "order_001",
    diner: "diner_openid_001",
    items: [
      { dishId: "dish_001", name: "红烧肉", quantity: 1, price: 80 },
      { dishId: "dish_004", name: "拍黄瓜", quantity: 1, price: 25 },
    ],
    totalPoints: 105,
    status: "completed",
    createTime: "2024-01-14T18:30:00Z",
    updateTime: "2024-01-14T19:45:00Z",
  },
  {
    _id: "order_002",
    diner: "diner_openid_002",
    items: [
      { dishId: "dish_002", name: "宫保鸡丁", quantity: 1, price: 60 },
      { dishId: "dish_006", name: "番茄鸡蛋汤", quantity: 1, price: 35 },
    ],
    totalPoints: 95,
    status: "in_progress",
    createTime: "2024-01-15T12:15:00Z",
    updateTime: "2024-01-15T12:20:00Z",
  },
  {
    _id: "order_003",
    diner: "diner_openid_001",
    items: [{ dishId: "dish_003", name: "麻婆豆腐", quantity: 2, price: 45 }],
    totalPoints: 90,
    status: "pending",
    createTime: "2024-01-15T13:45:00Z",
    updateTime: "2024-01-15T13:45:00Z",
  },
];

// 购物清单
export const mockShoppingList = [
  {
    _id: "shop_001",
    material_name: "生抽",
    quantity_needed: 1,
    unit: "瓶",
    order_id: "order_003",
    createTime: "2024-01-15T13:45:00Z",
    status: "pending",
  },
  {
    _id: "shop_002",
    material_name: "五花肉",
    quantity_needed: 500,
    unit: "g",
    order_id: "order_001",
    createTime: "2024-01-14T18:30:00Z",
    status: "purchased",
  },
];

// 当前登录用户（模拟）
export const currentUser = mockUsers[1]; // 默认登录为"贝儿"

// 数据服务类
export class MockDataService {
  // 获取当前用户信息
  static getCurrentUser() {
    return currentUser;
  }

  // 获取菜品分类
  static getCategories() {
    return mockCategories.map((category) => ({
      ...category,
      dishes: mockDishes.filter((dish) => dish.category === category.name),
    }));
  }

  // 获取所有菜品
  static getAllDishes() {
    return mockDishes;
  }

  // 根据ID获取菜品
  static getDishById(dishId) {
    return mockDishes.find((dish) => dish._id === dishId);
  }

  // 添加新菜品
  static addDish(dishData) {
    const newDish = {
      _id: `dish_${Date.now()}`,
      ...dishData,
      sales: 0,
      createTime: new Date().toISOString(),
      creator: currentUser.openid,
    };
    mockDishes.push(newDish);
    return newDish;
  }

  // 检查菜品名称是否重复
  static checkDishNameExists(name) {
    return mockDishes.some((dish) => dish.name === name);
  }

  // 获取用户订单
  static getUserOrders(userOpenid) {
    return mockOrders.filter((order) => order.diner === userOpenid);
  }

  // 创建订单
  static createOrder(cartItems, totalPoints) {
    const newOrder = {
      _id: `order_${Date.now()}`,
      diner: currentUser.openid,
      items: cartItems,
      totalPoints,
      status: "pending",
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
    };
    mockOrders.push(newOrder);

    // 扣减用户积分
    const user = mockUsers.find((u) => u.openid === currentUser.openid);
    if (user) {
      user.points -= totalPoints;
    }

    // 生成购物建议
    this.generateShoppingSuggestions(cartItems, newOrder._id);

    return newOrder;
  }

  // 更新订单状态
  static updateOrderStatus(orderId, newStatus) {
    const order = mockOrders.find((o) => o._id === orderId);
    if (order) {
      order.status = newStatus;
      order.updateTime = new Date().toISOString();

      // 如果订单被取消，退回积分
      if (newStatus === "cancelled" && order.status !== "cancelled") {
        const user = mockUsers.find((u) => u.openid === order.diner);
        if (user) {
          user.points += order.totalPoints;
        }
      }
    }
    return order;
  }

  // 获取所有订单（Chef用）
  static getAllOrders() {
    return mockOrders.sort(
      (a, b) => new Date(b.createTime) - new Date(a.createTime)
    );
  }

  // 获取库存
  static getInventory() {
    return mockInventory;
  }

  // 更新库存
  static updateInventory(itemId, newQuantity) {
    const item = mockInventory.find((i) => i._id === itemId);
    if (item) {
      item.quantity = newQuantity;
      item.status = newQuantity > 0 ? "normal" : "out_of_stock";
      item.updateTime = new Date().toISOString();
      item.updater = currentUser.openid;
    }
    return item;
  }

  // 添加库存物品
  static addInventoryItem(name, quantity, unit) {
    const newItem = {
      _id: `inv_${Date.now()}`,
      name,
      quantity,
      unit,
      status: quantity > 0 ? "normal" : "out_of_stock",
      updateTime: new Date().toISOString(),
      updater: currentUser.openid,
    };
    mockInventory.push(newItem);
    return newItem;
  }

  // 生成购物建议
  static generateShoppingSuggestions(cartItems, orderId) {
    cartItems.forEach((item) => {
      const materials = mockDishMaterials.filter(
        (dm) => dm.dish_id === item.dishId
      );
      materials.forEach((material) => {
        const inventoryItem = mockInventory.find(
          (inv) => inv.name === material.material_name
        );
        const neededQuantity = material.quantity_needed * item.quantity;

        if (!inventoryItem || inventoryItem.quantity < neededQuantity) {
          // 检查是否已存在相同的购物清单项
          const existingItem = mockShoppingList.find(
            (shop) =>
              shop.material_name === material.material_name &&
              shop.status === "pending"
          );

          if (!existingItem) {
            mockShoppingList.push({
              _id: `shop_${Date.now()}_${Math.random()}`,
              material_name: material.material_name,
              quantity_needed: neededQuantity,
              unit: material.unit,
              order_id: orderId,
              createTime: new Date().toISOString(),
              status: "pending",
            });
          }
        }
      });
    });
  }

  // 获取购物清单
  static getShoppingList() {
    return mockShoppingList.filter((item) => item.status === "pending");
  }

  // 奖励积分
  static rewardPoints(targetUserOpenid, points) {
    const user = mockUsers.find((u) => u.openid === targetUserOpenid);
    if (user) {
      user.points += points;
      return { success: true, newPoints: user.points };
    }
    return { success: false };
  }

  // 获取所有用户（Chef用）
  static getAllUsers() {
    return mockUsers.filter((user) => user.role === "diner");
  }
}
