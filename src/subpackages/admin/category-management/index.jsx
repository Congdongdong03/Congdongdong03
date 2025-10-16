import React from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import { Button, Toast, Input, Cell } from "@nutui/nutui-react-taro";
import "./index.scss";

const CategoryManagementPage = () => {
  return (
    <View className="category-management-page">
      <View className="page-header">
        <Text className="page-title">📂 分类管理</Text>
        <Text className="page-subtitle">管理菜品分类</Text>
      </View>

      <ScrollView scrollY className="page-content">
        <View className="empty-state">
          <Text className="empty-text">分类管理功能开发中...</Text>
          <Text className="empty-hint">敬请期待</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default CategoryManagementPage;
