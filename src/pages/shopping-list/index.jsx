import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Toast, Cell } from "@nutui/nutui-react-taro";
import { fetchShoppingList } from "../../services/api";
import { formatDate } from "../../utils/formatDate";
import "./index.scss";

const ShoppingListPage = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    try {
      setLoading(true);
      const data = await fetchShoppingList();
      setShoppingList(data);
    } catch (error) {
      console.error("加载购物清单失败:", error);
      Toast.show({
        type: "fail",
        content: "加载购物清单失败",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPurchased = (itemId) => {
    Toast.show({
      type: "text",
      content: "购买完成！记得更新库存哦~",
      duration: 2000,
    });
    // 这里可以添加标记为已购买的逻辑
  };

  if (loading) {
    return (
      <View className="shopping-list-page">
        <View className="loading">加载中...</View>
      </View>
    );
  }

  return (
    <View className="shopping-list-page">
      <View className="shopping-header">
        <Text className="page-title">🛒 购物清单</Text>
        <Text className="page-subtitle">智能推荐需要购买的食材</Text>
      </View>

      <View className="shopping-actions">
        <Button type="default" size="small" onClick={loadShoppingList}>
          刷新
        </Button>
      </View>

      <ScrollView scrollY className="shopping-content">
        {shoppingList.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-text">太棒了！</Text>
            <Text className="empty-hint">所有食材都充足，无需购买</Text>
          </View>
        ) : (
          <>
            <View className="shopping-summary">
              <Text className="summary-title">
                需要购买 {shoppingList.length} 种食材
              </Text>
              <Text className="summary-hint">基于最近的订单智能推荐</Text>
            </View>

            {shoppingList.map((item) => (
              <View key={item._id} className="shopping-item">
                <View className="item-info">
                  <Text className="item-name">{item.material_name}</Text>
                  <Text className="item-quantity">
                    需要: {item.quantity_needed} {item.unit}
                  </Text>
                  <Text className="item-time">
                    推荐时间: {formatDate(item.createTime)}
                  </Text>
                </View>

                <View className="item-actions">
                  <Button
                    size="small"
                    type="success"
                    onClick={() => handleMarkPurchased(item._id)}
                  >
                    已购买
                  </Button>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ShoppingListPage;
