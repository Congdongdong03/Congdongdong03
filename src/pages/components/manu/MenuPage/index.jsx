// 菜单主页面
import { View } from "@tarojs/components";
import BusinessHeader from "../BusinessHeader";
import CategoryMenu from "../CategoryMenu";
import ProductList from "../ProductList";
import "./index.scss";

const MenuPage = () => {
  return (
    <View className="menu-page">
      <View className="business-info">
        <BusinessHeader />
      </View>

      <View className="content-wrapper">
        <View className="category-menu">
          <CategoryMenu />
        </View>
        <View className="product-list">
          <ProductList />
        </View>
      </View>
    </View>
  );
};

export default MenuPage;
