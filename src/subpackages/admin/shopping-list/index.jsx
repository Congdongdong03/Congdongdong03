import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Toast, Cell, Dialog } from "@nutui/nutui-react-taro";
import { fetchShoppingList, updateInventory } from "../../../services/api";
import { formatDate } from "../../../utils/formatDate";
import "./index.scss";

const ShoppingListPage = () => {
  const [shoppingList, setShoppingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);

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

  // 标记为已购买并更新库存
  const handleMarkPurchased = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.currentStock + item.quantityNeeded);
    setShowUpdateDialog(true);
  };

  // 确认更新库存
  const confirmUpdateInventory = async () => {
    if (!selectedItem) return;

    try {
      await updateInventory(selectedItem.itemId, newQuantity);

      Toast.show({
        type: "success",
        content: `${selectedItem.materialName} 库存更新成功！`,
        duration: 2000,
      });

      setShowUpdateDialog(false);
      setSelectedItem(null);
      setNewQuantity(0);

      // 重新加载购物清单
      loadShoppingList();
    } catch (error) {
      console.error("更新库存失败:", error);
      Toast.show({
        type: "fail",
        content: "更新失败，请重试",
        duration: 2000,
      });
    }
  };

  // 取消更新
  const cancelUpdate = () => {
    setShowUpdateDialog(false);
    setSelectedItem(null);
    setNewQuantity(0);
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
              <View key={item.itemId} className="shopping-item">
                <View className="item-info">
                  <Text className="item-name">{item.materialName}</Text>
                  <Text className="item-quantity">
                    需要购买: {item.quantityNeeded} {item.unit}
                  </Text>
                  <Text className="item-stock">
                    当前库存: {item.currentStock} {item.unit}
                  </Text>
                  <Text className="item-time">
                    推荐时间: {formatDate(item.createTime)}
                  </Text>
                </View>

                <View className="item-actions">
                  <Button
                    size="small"
                    type="success"
                    onClick={() => handleMarkPurchased(item)}
                  >
                    已购买
                  </Button>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* 更新库存确认弹窗 */}
      <Dialog
        title="更新库存"
        visible={showUpdateDialog}
        onConfirm={confirmUpdateInventory}
        onCancel={cancelUpdate}
        confirmText="确认更新"
        cancelText="取消"
        closeOnOverlayClick={false}
      >
        <View className="update-dialog">
          {selectedItem && (
            <>
              <Text className="dialog-title">
                确认已购买 {selectedItem.materialName}？
              </Text>
              <View className="quantity-info">
                <Text className="quantity-label">需要购买:</Text>
                <Text className="quantity-value">
                  {selectedItem.quantityNeeded} {selectedItem.unit}
                </Text>
              </View>
              <View className="quantity-info">
                <Text className="quantity-label">当前库存:</Text>
                <Text className="quantity-value">
                  {selectedItem.currentStock} {selectedItem.unit}
                </Text>
              </View>
              <View className="quantity-info">
                <Text className="quantity-label">更新后库存:</Text>
                <Text className="quantity-value">
                  {newQuantity} {selectedItem.unit}
                </Text>
              </View>
              <Text className="dialog-hint">
                点击"确认更新"后，该物品将从购物清单中移除
              </Text>
            </>
          )}
        </View>
      </Dialog>
    </View>
  );
};

export default ShoppingListPage;
