import { View } from "@tarojs/components";
import "./index.scss";

const BusinessHeader = () => {
  return (
    <View className="business-header">
      <View className="header-area">
        <View className="business-info">商家名称</View>
        <View className="business-details">地址：某某街道</View>
      </View>
      <View className="notice-area">
        <View className="notice-title">通知：</View>
        <View className="notice-content">今天有优惠活动，满100减10！</View>
      </View>
    </View>
  );
};

export default BusinessHeader;
