import { View } from "@tarojs/components";
import "./index.scss";

// 删除 categories 的导入
// 通过 props 接收 categories
const CategoryMenu = ({ categories }) => {
  return (
    <View className="menu-box">
      <View className="category-menu">
        {categories.map((item) => (
          <View key={item.id} value={item.name} className="menu-item">
            {item.name}
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryMenu;
