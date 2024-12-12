import { View } from "@tarojs/components";
import { SideNavBar, SideNavBarItem } from "@nutui/nutui-react-taro";
import "./index.scss";

const CategoryMenu = () => {
  const categories = [
    { id: 1, name: "开胃凉菜" },
    { id: 2, name: "高端肉品" },
    { id: 3, name: "健康菜品" },
    { id: 4, name: "暖心粉面" },
    { id: 5, name: "滋补炖汤" },
    { id: 6, name: "自带饮品" },
  ];

  return (
    <View className="category-menu">
      <View className="category-menu">
        {categories.map((item) => (
          <View key={item.id}>{item.name}</View>
        ))}
      </View>
    </View>
  );
};

export default CategoryMenu;
