// 菜单主页面
import { View } from "@tarojs/components";
import BusinessHeader from "../BusinessHeader";
import CategoryMenu from "../CategoryMenu";
import ProductList from "../ProductList";
import userPicture from "/src/pages/picture/user_picture.jpg";

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
        image: userPicture,
      },
      {
        id: 2,
        name: "黄金双黄蛋",
        price: 100.0,
        sales: 0,
        description: "耗费俩蛋 难度系数高",
        image: userPicture,
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
        image: userPicture,
      },
      {
        id: 4,
        name: "糖醋里脊",
        price: 78.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
  {
    id: 3,
    name: "海鲜盛宴",
    dishes: [
      {
        id: 5,
        name: "清蒸鲈鱼",
        price: 120.0,
        sales: 0,
        image: userPicture,
      },
      {
        id: 6,
        name: "椒盐虾",
        price: 98.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
  {
    id: 4,
    name: "素菜经典",
    dishes: [
      {
        id: 7,
        name: "清炒时蔬",
        price: 50.0,
        sales: 0,
        image: userPicture,
      },
      {
        id: 8,
        name: "豆腐煲",
        price: 68.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
  {
    id: 5,
    name: "烧烤系列",
    dishes: [
      {
        id: 9,
        name: "羊肉串",
        price: 15.0,
        sales: 0,
        image: userPicture,
      },
      {
        id: 10,
        name: "烤鸡翅",
        price: 22.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
  {
    id: 6,
    name: "特色主食",
    dishes: [
      {
        id: 11,
        name: "扬州炒饭",
        price: 45.0,
        sales: 0,
        image: userPicture,
      },
      {
        id: 12,
        name: "牛肉面",
        price: 52.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
  {
    id: 7,
    name: "火锅必备",
    dishes: [
      {
        id: 13,
        name: "毛肚",
        price: 88.0,
        sales: 0,
        image: userPicture,
      },
      {
        id: 14,
        name: "午餐肉",
        price: 68.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
  {
    id: 8,
    name: "异国风味",
    dishes: [
      {
        id: 15,
        name: "咖喱鸡",
        price: 88.0,
        sales: 0,
        image: userPicture,
      },
      {
        id: 16,
        name: "泰式虾饼",
        price: 78.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
  {
    id: 9,
    name: "健康沙拉",
    dishes: [
      {
        id: 17,
        name: "凯撒沙拉",
        price: 68.0,
        sales: 0,
        image: userPicture,
      },
      {
        id: 18,
        name: "水果沙拉",
        price: 58.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
  {
    id: 10,
    name: "甜品时光",
    dishes: [
      {
        id: 19,
        name: "芝士蛋糕",
        price: 88.0,
        sales: 0,
        image: userPicture,
      },
      {
        id: 20,
        name: "提拉米苏",
        price: 78.0,
        sales: 0,
        image: userPicture,
      },
    ],
  },
];

// 然后定义组件，这样组件就能访问到 categories
const MenuPage = () => {
  console.log("页面开始渲染"); // 添加日志
  try {
    return (
      <View className="menu-page" style={{ height: "100vh" }}>
        <View
          className="business-info"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <BusinessHeader />
        </View>

        <View
          className="content-wrapper"
          style={{
            height: "calc(100vh - 130px)", // 根据头部实际高度调整
            overflowY: "auto",
          }}
        >
          <View className="category-menu" style={{ overflowY: "auto" }}>
            <CategoryMenu categories={categories} />
          </View>
          <View className="product-list" style={{ overflowY: "auto" }}>
            <ProductList categories={categories} />
          </View>
        </View>
      </View>
    );
  } catch (error) {
    console.error("MenuPage render error:", error);
    return <View>加载出错</View>;
  }
};
export default MenuPage;
