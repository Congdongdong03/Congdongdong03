// 菜单主页面
import { View } from "@tarojs/components";
import BusinessHeader from "../BusinessHeader";
import CategoryMenu from "../CategoryMenu";
import ProductList from "../ProductList";
import "./index.scss";

// 先定义 categories
export const categories = [
  {
    id: 1,
    name: "开胃凉菜",
    dishes: [
      {
        id: 1,
        name: "凉拌菠菜",
        price: 100.0,
        sales: 0,
        image: "/src/pages/picture/user_picture.jpg",
      },
      {
        id: 2,
        name: "黄金双黄蛋",
        price: 100.0,
        sales: 0,
        description: "耗费俩蛋 难度系数高",
        image: "/src/pages/picture/user_picture.jpg",
      },
    ],
  },
  {
    id: 2,
    name: "高端肉品",
    dishes: [
      {
        id: 3,
        name: "红烧排骨",
        price: 88.0,
        sales: 0,
        image: "/src/pages/picture/user_picture.jpg",
      },
      {
        id: 4,
        name: "糖醋里脊",
        price: 78.0,
        sales: 0,
        image: "/src/pages/picture/user_picture.jpg",
      },
    ],
  },
];

// 然后定义组件，这样组件就能访问到 categories
const MenuPage = () => {
  return (
    <View className="menu-page">
      <View className="business-info">
        <BusinessHeader />
      </View>

      <View className="content-wrapper">
        <View className="category-menu">
          <CategoryMenu categories={categories} />
        </View>
        <View className="product-list">
          <ProductList categories={categories} />
        </View>
      </View>
    </View>
  );
};

export default MenuPage;
