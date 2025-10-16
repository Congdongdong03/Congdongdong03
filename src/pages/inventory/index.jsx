import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import {
  Button,
  Toast,
  InputNumber,
  Cell,
  Input,
} from "@nutui/nutui-react-taro";
import {
  fetchInventory,
  updateInventory,
  addInventoryItem,
  deleteInventoryItem,
} from "../../services/api";
import { formatDate } from "../../utils/formatDate";
import "./index.scss";

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    unit: "个",
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await fetchInventory();
      setInventory(data);
    } catch (error) {
      console.error("加载库存失败:", error);
      Toast.show({
        type: "fail",
        content: "加载库存失败",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 0) {
      Toast.show({
        type: "fail",
        content: "数量不能为负数",
        duration: 2000,
      });
      return;
    }

    try {
      await updateInventory(itemId, newQuantity);
      Toast.show({
        type: "success",
        content: "更新成功",
        duration: 1500,
      });
      loadInventory(); // 重新加载数据
    } catch (error) {
      console.error("更新库存失败:", error);
      Toast.show({
        type: "fail",
        content: "更新失败，请重试",
        duration: 2000,
      });
    }
  };

  const handleAddItem = async () => {
    // 验证名称
    if (!newItem.name.trim()) {
      Toast.show({
        type: "fail",
        content: "请输入物品名称",
        duration: 2000,
      });
      return;
    }

    // 验证名称长度
    if (newItem.name.trim().length > 20) {
      Toast.show({
        type: "fail",
        content: "物品名称不能超过20个字",
        duration: 2000,
      });
      return;
    }

    // 验证单位
    if (!newItem.unit.trim()) {
      Toast.show({
        type: "fail",
        content: "请输入单位",
        duration: 2000,
      });
      return;
    }

    // 验证单位长度
    if (newItem.unit.trim().length > 10) {
      Toast.show({
        type: "fail",
        content: "单位不能超过10个字",
        duration: 2000,
      });
      return;
    }

    // 检查是否已存在同名物品
    if (inventory.some((item) => item.name.trim() === newItem.name.trim())) {
      Toast.show({
        type: "fail",
        content: "该物品已存在",
        duration: 2000,
      });
      return;
    }

    try {
      await addInventoryItem(
        newItem.name.trim(),
        newItem.quantity,
        newItem.unit.trim()
      );
      Toast.show({
        type: "success",
        content: "添加成功",
        duration: 1500,
      });
      setNewItem({ name: "", quantity: 1, unit: "个" });
      setShowAddForm(false);
      loadInventory(); // 重新加载数据
    } catch (error) {
      console.error("添加物品失败:", error);
      Toast.show({
        type: "fail",
        content: "添加失败，请重试",
        duration: 2000,
      });
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteInventoryItem(itemId);

      // 从本地状态中删除
      setInventory((prev) => prev.filter((item) => item.id !== itemId));

      Toast.show({
        type: "success",
        content: "删除成功",
        duration: 2000,
      });
    } catch (error) {
      console.error("删除失败:", error);
      Toast.show({
        type: "fail",
        content: "删除失败，请重试",
        duration: 2000,
      });
    }
  };

  const getStatusText = (status) => {
    return status === "out_of_stock" ? "缺货" : "正常";
  };

  const getStatusColor = (status) => {
    return status === "out_of_stock" ? "#ff3b30" : "#34c759";
  };

  if (loading) {
    return (
      <View className="inventory-page">
        <View className="loading">加载中...</View>
      </View>
    );
  }

  return (
    <View className="inventory-page">
      <View className="inventory-header">
        <Text className="page-title">🧊 我们的冰箱</Text>
        <Text className="page-subtitle">看看家里还有什么食材</Text>
        <View
          type="primary"
          size="small"
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-item-btn"
        >
          {showAddForm ? "取消添加" : "➕ 添加物品"}
        </View>
      </View>

      {showAddForm && (
        <View className="add-form">
          <View className="form-item">
            <Text className="form-label">物品名称</Text>
            <Input
              value={newItem.name}
              onChange={(value) => setNewItem({ ...newItem, name: value })}
              placeholder="请输入物品名称"
              className="form-input"
            />
          </View>
          <View className="form-item">
            <Text className="form-label">数量</Text>
            <InputNumber
              value={newItem.quantity}
              onChange={(value) => setNewItem({ ...newItem, quantity: value })}
              min={1}
              max={9999}
              className="form-input"
            />
          </View>
          <View className="form-item">
            <Text className="form-label">单位</Text>
            <Input
              value={newItem.unit}
              onChange={(value) => setNewItem({ ...newItem, unit: value })}
              placeholder="个/瓶/包等"
              className="form-input"
            />
          </View>
          <View
            onClick={handleAddItem}
            style={{
              backgroundColor: "#f9dde6 !important",
              width: "100%",
              height: "80rpx",
              textAlign: "center",
              lineHeight: "80rpx",
              borderRadius: "50rpx",
              fontSize: "32rpx",
              fontWeight: "600",
              color: "#4a4a4a !important",
            }}
          >
            添加物品
          </View>
        </View>
      )}

      <ScrollView scrollY className="inventory-content">
        {inventory.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-text">冰箱是空的哦~</Text>
            <Text className="empty-hint">点击"添加物品"开始管理库存</Text>
          </View>
        ) : (
          inventory.map((item) => (
            <View key={item.id} className="inventory-item">
              <View className="item-info">
                <View className="item-header">
                  <Text className="item-name">{item.name}</Text>
                  <Text
                    className="item-status"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    {getStatusText(item.status)}
                  </Text>
                </View>
                <Text className="item-update">
                  最后更新: {formatDate(item.updatedAt)}
                </Text>
              </View>

              <View className="item-actions">
                <View className="item-quantity">
                  <Text className="quantity-label">数量</Text>
                  <InputNumber
                    value={item.quantity}
                    onChange={(value) => handleQuantityChange(item.id, value)}
                    min={0}
                    max={9999}
                    className="quantity-input"
                  />
                  <Text className="quantity-unit">{item.unit}</Text>
                </View>
                <View
                  onClick={() => handleDeleteItem(item.id)}
                  className="delete-btn"
                >
                  删除
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default InventoryPage;
