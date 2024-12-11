import { View } from "@tarojs/components";
import { useState } from "react";
import "./index.scss";
import Manu from "../components/manu/MenuPage/index";
const Index = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const renderContent = () => {
    switch (currentTab) {
      case 0:
        return <Manu />;
      case 1:
        return <View>订单页面</View>;
      case 2:
        return <View>我的页面</View>;
      default:
        return null;
    }
  };

  return (
    <View className="index">
      <View className="content">{renderContent()}</View>
      <View className="tab-bar">
        <View
          className={`tab-item ${currentTab === 0 ? "active" : ""}`}
          onClick={() => setCurrentTab(0)}
        >
          <View>菜单</View>
        </View>
        <View
          className={`tab-item ${currentTab === 1 ? "active" : ""}`}
          onClick={() => setCurrentTab(1)}
        >
          <View>订单</View>
        </View>
        <View
          className={`tab-item ${currentTab === 2 ? "active" : ""}`}
          onClick={() => setCurrentTab(2)}
        >
          <View>我的</View>
        </View>
      </View>
    </View>
  );
};

export default Index;
