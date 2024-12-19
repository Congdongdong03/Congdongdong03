import { View } from "@tarojs/components";
import { useState } from "react";
import "./index.scss";

const CategoryMenu = ({ categories }) => {
  // 定义一个状态来存储当前选中的菜单项
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (id) => {
    console.log("1");
    console.log("Selected ID:", id); // 打印被点击的菜单项 ID
    setSelectedCategory(id); // 设置当前选中的菜单项 ID
  };

  return (
    <View className="menu-box">
      <View className="category-menu">
        {categories.map((item) => (
          <View
            key={item.id}
            value={item.name}
            className={`menu-item ${
              selectedCategory === item.id ? "active" : ""
            }`}
            onClick={() => {
              console.log("Clicked ID:", item.id); // 直接打印点击的 ID
              handleCategoryClick(item.id); // 调用事件处理器
            }}
          >
            {item.name}
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryMenu;
