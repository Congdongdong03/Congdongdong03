/**
 * 菜品原材料映射配置
 *
 * TODO: 未来应该从后端API获取菜品的原材料信息
 * 目前使用配置文件的方式，便于维护和扩展
 *
 * 格式：
 * {
 *   "菜品名称": ["原材料1", "原材料2", ...]
 * }
 */

export const DISH_INGREDIENTS_MAP = {
  番茄炒蛋: ["番茄", "鸡蛋"],
  可乐鸡翅: ["可乐", "鸡翅"],
  红烧肉: ["五花肉", "老抽", "冰糖"],
  清蒸鱼: ["鲜鱼", "姜", "葱"],
  宫保鸡丁: ["鸡胸肉", "花生", "干辣椒"],
  麻婆豆腐: ["豆腐", "猪肉末", "豆瓣酱"],
  糖醋排骨: ["猪排骨", "白糖", "醋"],
  鱼香肉丝: ["猪肉", "木耳", "胡萝卜"],
  // 可以继续添加更多菜品...
};

/**
 * 根据菜品列表获取所需的原材料建议
 * @param {Array} dishes - 菜品对象数组，每个对象包含 name 字段
 * @returns {Array} - 去重后的原材料列表
 */
export const getIngredientsSuggestions = (dishes) => {
  const suggestions = [];

  dishes.forEach((dish) => {
    const ingredients = DISH_INGREDIENTS_MAP[dish.name];
    if (ingredients) {
      suggestions.push(...ingredients);
    }
  });

  // 去重并返回
  return [...new Set(suggestions)];
};
