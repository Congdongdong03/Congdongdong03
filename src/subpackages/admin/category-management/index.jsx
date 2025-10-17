import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import {
  Button,
  Toast,
  Input,
  Cell,
  Dialog,
  TextArea,
} from "@nutui/nutui-react-taro";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/api";
import { formatDate } from "../../../utils/formatDate";
import "./index.scss";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sortOrder: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("加载分类失败:", error);
      Toast.show({
        type: "fail",
        content: "加载分类失败",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    // 表单验证
    if (!formData.name.trim()) {
      Toast.show({
        type: "fail",
        content: "请输入分类名称",
        duration: 2000,
      });
      return;
    }

    if (formData.name.trim().length > 20) {
      Toast.show({
        type: "fail",
        content: "分类名称不能超过20个字",
        duration: 2000,
      });
      return;
    }

    // 检查分类名称是否重复
    if (categories.some((cat) => cat.name.trim() === formData.name.trim())) {
      Toast.show({
        type: "fail",
        content: "该分类名称已存在",
        duration: 2000,
      });
      return;
    }

    try {
      await addCategory({
        name: formData.name.trim(),
        description: formData.description.trim(),
        sortOrder: formData.sortOrder,
      });

      Toast.show({
        type: "success",
        content: "分类添加成功！",
        duration: 2000,
      });

      setShowAddDialog(false);
      setFormData({ name: "", description: "", sortOrder: 0 });
      loadCategories();
    } catch (error) {
      console.error("添加分类失败:", error);
      Toast.show({
        type: "fail",
        content: "添加失败，请重试",
        duration: 2000,
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    // 表单验证
    if (!formData.name.trim()) {
      Toast.show({
        type: "fail",
        content: "请输入分类名称",
        duration: 2000,
      });
      return;
    }

    if (formData.name.trim().length > 20) {
      Toast.show({
        type: "fail",
        content: "分类名称不能超过20个字",
        duration: 2000,
      });
      return;
    }

    // 检查分类名称是否重复（排除当前编辑的分类）
    if (
      categories.some(
        (cat) =>
          cat.id !== editingCategory.id &&
          cat.name.trim() === formData.name.trim()
      )
    ) {
      Toast.show({
        type: "fail",
        content: "该分类名称已存在",
        duration: 2000,
      });
      return;
    }

    try {
      await updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        sortOrder: formData.sortOrder,
        isActive: true,
      });

      Toast.show({
        type: "success",
        content: "分类更新成功！",
        duration: 2000,
      });

      setShowEditDialog(false);
      setEditingCategory(null);
      setFormData({ name: "", description: "", sortOrder: 0 });
      loadCategories();
    } catch (error) {
      console.error("更新分类失败:", error);
      Toast.show({
        type: "fail",
        content: "更新失败，请重试",
        duration: 2000,
      });
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      await deleteCategory(category.id);
      Toast.show({
        type: "success",
        content: "分类删除成功！",
        duration: 2000,
      });
      loadCategories();
    } catch (error) {
      console.error("删除分类失败:", error);
      const errorMessage = error.data?.error || error.message || "删除失败";
      Toast.show({
        type: "fail",
        content: errorMessage,
        duration: 2000,
      });
    }
  };

  const openEditDialog = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      sortOrder: category.sortOrder || 0,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", sortOrder: 0 });
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <View className="category-management-page">
        <View className="page-header">
          <Text className="page-title">📂 分类管理</Text>
          <Text className="page-subtitle">管理菜品分类</Text>
        </View>
        <View className="loading">加载中...</View>
      </View>
    );
  }

  return (
    <View className="category-management-page">
      <View className="page-header">
        <Text className="page-title">分类管理</Text>
        <Text className="page-subtitle">管理菜品分类</Text>
        <Button
          type="primary"
          size="small"
          onClick={() => setShowAddDialog(true)}
          className="add-category-btn"
        >
          添加分类
        </Button>
      </View>

      <ScrollView scrollY className="page-content">
        {loading ? (
          <View className="empty-state">
            <Text className="empty-text">加载中...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-text">暂无分类</Text>
            <Text className="empty-hint">点击"添加分类"开始创建</Text>
          </View>
        ) : (
          categories.map((category) => (
            <View key={category.id} className="category-card">
              <View className="category-info">
                <View className="category-header">
                  <Text className="category-name">{category.name}</Text>
                  <Text className="category-sort">
                    排序: {category.sortOrder}
                  </Text>
                </View>
                {category.description && (
                  <Text className="category-description">
                    {category.description}
                  </Text>
                )}
                <Text className="category-time">
                  创建时间: {formatDate(category.createdAt)}
                </Text>
              </View>
              <View className="category-actions">
                <Button
                  size="small"
                  type="primary"
                  onClick={() => openEditDialog(category)}
                  className="edit-btn"
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  type="danger"
                  onClick={() => handleDeleteCategory(category)}
                  className="delete-btn"
                >
                  删除
                </Button>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* 添加分类弹窗 */}
      <Dialog
        title="添加分类"
        visible={showAddDialog}
        onConfirm={handleAddCategory}
        onCancel={() => {
          setShowAddDialog(false);
          resetForm();
        }}
        confirmText="添加"
        cancelText="取消"
        closeOnOverlayClick={false}
      >
        <View className="category-form">
          <View className="form-item">
            <Text className="form-label">分类名称 *</Text>
            <Input
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="例如：主食、素菜、汤品..."
              maxLength={20}
              className="form-input"
            />
          </View>
          <View className="form-item">
            <Text className="form-label">分类描述</Text>
            <TextArea
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="请输入分类描述（可选）"
              maxLength={100}
              rows={3}
              className="form-textarea"
            />
          </View>
          <View className="form-item">
            <Text className="form-label">排序</Text>
            <Input
              value={formData.sortOrder.toString()}
              onChange={(value) =>
                setFormData({ ...formData, sortOrder: parseInt(value) || 0 })
              }
              placeholder="数字越小排序越靠前"
              type="number"
              className="form-input"
            />
          </View>
        </View>
      </Dialog>

      {/* 编辑分类弹窗 */}
      <Dialog
        title="编辑分类"
        visible={showEditDialog}
        onConfirm={handleEditCategory}
        onCancel={() => {
          setShowEditDialog(false);
          resetForm();
        }}
        confirmText="保存"
        cancelText="取消"
        closeOnOverlayClick={false}
      >
        <View className="category-form">
          <View className="form-item">
            <Text className="form-label">分类名称 *</Text>
            <Input
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="例如：主食、素菜、汤品..."
              maxLength={20}
              className="form-input"
            />
          </View>
          <View className="form-item">
            <Text className="form-label">分类描述</Text>
            <TextArea
              value={formData.description}
              onChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="请输入分类描述（可选）"
              maxLength={100}
              rows={3}
              className="form-textarea"
            />
          </View>
          <View className="form-item">
            <Text className="form-label">排序</Text>
            <Input
              value={formData.sortOrder.toString()}
              onChange={(value) =>
                setFormData({ ...formData, sortOrder: parseInt(value) || 0 })
              }
              placeholder="数字越小排序越靠前"
              type="number"
              className="form-input"
            />
          </View>
        </View>
      </Dialog>
    </View>
  );
};

export default CategoryManagementPage;
