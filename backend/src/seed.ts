import prisma from "./db/prisma";

async function main() {
  console.log("开始初始化数据...");

  // 创建分类
  const categoriesData = [
    { name: "主食", description: "米饭、面条等主食类", sortOrder: 1 },
    { name: "素菜", description: "蔬菜类菜品", sortOrder: 2 },
    { name: "凉菜", description: "凉拌菜类", sortOrder: 3 },
    { name: "汤品", description: "各种汤类", sortOrder: 4 },
    { name: "甜品", description: "甜点类", sortOrder: 5 },
  ];

  const createdCategories = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    createdCategories.push(category);
  }
  console.log(
    "✅ 分类创建完成:",
    createdCategories.map((c) => c.name)
  );

  // 🔧 移除硬编码用户创建，让系统自然创建用户
  // 不再强制创建特定OpenID的用户

  // 🔧 移除所有硬编码用户创建
  // 让系统通过微信登录自然创建用户
  console.log("✅ 用户创建完成: 系统将通过微信登录自然创建用户");

  // 创建测试菜品
  const dishesData = [
    {
      name: "可乐鸡翅",
      description: "香甜可口的可乐鸡翅，外焦内嫩",
      image: "/assets/icons/default-food.png",
      price: 25,
      categoryName: "主食",
      sales: 88,
    },
    {
      name: "番茄炒蛋",
      description: "经典家常菜，营养丰富",
      image: "/assets/icons/default-food.png",
      price: 15,
      categoryName: "主食",
      sales: 120,
    },
    {
      name: "红烧肉",
      description: "肥瘦相间，入口即化",
      image: "/assets/icons/default-food.png",
      price: 35,
      categoryName: "主食",
      sales: 65,
    },
    {
      name: "蒜蓉西兰花",
      description: "清爽健康，蒜香浓郁",
      image: "/assets/icons/default-food.png",
      price: 12,
      categoryName: "素菜",
      sales: 95,
    },
    {
      name: "拍黄瓜",
      description: "清爽解腻，夏日必备",
      image: "/assets/icons/default-food.png",
      price: 8,
      categoryName: "凉菜",
      sales: 150,
    },
  ];

  const createdDishes = [];
  for (const dish of dishesData) {
    const category = createdCategories.find(
      (c) => c.name === dish.categoryName
    );
    if (category) {
      const createdDish = await prisma.dish.upsert({
        where: { name: dish.name },
        update: {
          description: dish.description,
          image: dish.image,
          price: dish.price,
          categoryId: category.id,
          sales: dish.sales,
        },
        create: {
          name: dish.name,
          description: dish.description,
          image: dish.image,
          price: dish.price,
          categoryId: category.id,
          sales: dish.sales,
        },
      });
      createdDishes.push(createdDish);
    }
  }
  console.log(
    "✅ 菜品创建完成:",
    createdDishes.map((d) => d.name)
  );

  // 创建测试库存
  const inventoryData = [
    { name: "鸡蛋", quantity: 8, unit: "个" },
    { name: "番茄", quantity: 3, unit: "个" },
    { name: "生抽", quantity: 0, unit: "瓶" },
    { name: "大蒜", quantity: 5, unit: "瓣" },
    { name: "五花肉", quantity: 0, unit: "g" },
    { name: "鸡翅", quantity: 2, unit: "个" },
    { name: "可乐", quantity: 1, unit: "瓶" },
    { name: "西兰花", quantity: 4, unit: "个" },
    { name: "黄瓜", quantity: 6, unit: "根" },
  ];

  const createdInventory = [];
  for (const item of inventoryData) {
    const existing = await prisma.inventory.findFirst({
      where: { name: item.name },
    });

    if (!existing) {
      const createdItem = await prisma.inventory.create({
        data: {
          ...item,
          status: item.quantity > 0 ? "NORMAL" : "OUT_OF_STOCK",
        },
      });
      createdInventory.push(createdItem);
    }
  }
  console.log(
    "✅ 库存创建完成:",
    createdInventory.map((i) => i.name)
  );

  // 创建菜品原材料关联示例
  const tomatoEgg = createdDishes.find((d) => d.name === "番茄炒蛋");
  const egg = createdInventory.find((i) => i.name === "鸡蛋");
  const tomato = createdInventory.find((i) => i.name === "番茄");

  if (tomatoEgg && egg && tomato) {
    await prisma.dishMaterial.upsert({
      where: {
        dishId_itemId: {
          dishId: tomatoEgg.id,
          itemId: egg.id,
        },
      },
      update: {},
      create: {
        dishId: tomatoEgg.id,
        itemId: egg.id,
        amount: 3,
      },
    });

    await prisma.dishMaterial.upsert({
      where: {
        dishId_itemId: {
          dishId: tomatoEgg.id,
          itemId: tomato.id,
        },
      },
      update: {},
      create: {
        dishId: tomatoEgg.id,
        itemId: tomato.id,
        amount: 2,
      },
    });

    console.log("✅ 菜品原材料关联创建完成");
  }

  // 创建系统设置
  await prisma.settings.upsert({
    where: { key: "notice" },
    update: {},
    create: {
      key: "notice",
      value: "欢迎使用菜单小程序！请选择您喜欢的菜品 😊",
    },
  });
  console.log("✅ 系统设置创建完成");

  console.log("\n🎉 数据库种子数据创建完成！");
  console.log("系统将通过微信登录自然创建用户");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
