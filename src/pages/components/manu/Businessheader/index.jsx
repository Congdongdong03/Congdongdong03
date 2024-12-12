import { View } from "@tarojs/components";

// 图片引入
import userPicture from "/src/pages/picture/user_picture.jpg";
import "./index.scss";
// 然后在组件中使用

const BusinessHeader = () => {
  return (
    <View className="business-header">
      <View className="header-area">
        {/* 图片 */}
        <View className="header-userPicture">
          <image src={userPicture} mode="aspectFit" />
        </View>
        <View className="business-info">
          <View className="business-details">商家名称</View>
          <View className="business-details">地址：某某街道</View>
        </View>
      </View>
      <View className="notice-area">
        <View className="notice-info">
          <View className="notice-title">通知：</View>
          <View className="notice-content">今天有优惠活动，满100减10！</View>
        </View>
      </View>
    </View>
  );
};

export default BusinessHeader;
