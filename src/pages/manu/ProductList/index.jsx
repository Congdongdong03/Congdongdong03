import { View } from "@tarojs/components";
import "./index.scss";
import userPicture from "/src/pages/picture/user_picture.jpg";
import { InputNumber } from "@nutui/nutui-react-taro";

const ProductList = () => {
  const marginStyle = { margin: 8 };
  return (
    <View className="product-list">
      <View className="all-food">
        {/* 图片 */}
        <View className="product-Picture">
          <image src={userPicture} mode="aspectFit" />
        </View>
        <View className="food-info">
          {/* 名字 */}
          <View className="food-name">大肘子</View>
          {/* 菜品描述 */}
          <View className="food-describe">菜品描述菜品描</View>
          {/* 销量 */}
          <View className="food-sales">销量:0</View>
          {/* 价格 */}
          <View className="food-price">¥ 不卖</View>
          {/* 加购 */}
          <View className="food-inputNumber">
            <InputNumber defaultValue={1} allowEmpty />
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProductList;
