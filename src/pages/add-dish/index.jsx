import React from "react";
import { useState, useEffect } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
import {
  Button,
  Toast,
  Input,
  InputNumber,
  Cell,
  Picker,
} from "@nutui/nutui-react-taro";
import {
  addDish,
  checkDishNameExists,
  fetchCategories,
} from "../../services/api";
import Taro from "@tarojs/taro";
import "./index.scss";

const AddDishPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 50,
    categoryId: "",
    image: "/assets/icons/default-food.png", // 默认图片
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log("开始加载分类...");
        const data = await fetchCategories();
        console.log("分类数据加载成功:", data);
        setCategories(data);
        // 设置默认分类
        if (data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({
            ...prev,
            categoryId: data[0].id,
          }));
          console.log("设置默认分类:", data[0].id);
        }
      } catch (error) {
        console.error("加载分类失败:", error);
        Toast.show({
          type: "fail",
          content: "加载分类失败",
          duration: 2000,
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: value[0],
    }));
  };

  // 选择图片
  const handleChooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        setFormData((prev) => ({
          ...prev,
          image: tempFilePath,
        }));
        Toast.show({
          type: "success",
          content: "图片选择成功",
          duration: 1500,
        });
      },
      fail: (error) => {
        console.error("选择图片失败:", error);
        Toast.show({
          type: "fail",
          content: "选择图片失败",
          duration: 2000,
        });
      },
    });
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.name.trim()) {
      Toast.show({
        type: "fail",
        content: "请输入菜品名称",
        duration: 2000,
      });
      return;
    }

    if (!formData.description.trim()) {
      Toast.show({
        type: "fail",
        content: "请输入菜品描述",
        duration: 2000,
      });
      return;
    }

    if (!formData.categoryId) {
      Toast.show({
        type: "fail",
        content: "请选择菜品分类",
        duration: 2000,
      });
      return;
    }

    if (formData.price <= 0) {
      Toast.show({
        type: "fail",
        content: "积分价格必须大于0",
        duration: 2000,
      });
      return;
    }

    try {
      setLoading(true);

      // 检查菜品名称是否重复
      const nameExists = await checkDishNameExists(formData.name);
      if (nameExists) {
        Toast.show({
          type: "fail",
          content: "这道菜好像已经有了哦，换个名字试试吧~",
          duration: 3000,
        });
        return;
      }

      // 添加菜品
      await addDish(formData);

      Toast.show({
        type: "success",
        content: "🎉 新菜品添加成功！",
        duration: 2000,
      });

      // 返回菜单页面
      setTimeout(() => {
        Taro.switchTab({
          url: "/pages/Menu/MenuPage/index",
        });
      }, 2000);
    } catch (error) {
      console.error("添加菜品失败:", error);
      Toast.show({
        type: "fail",
        content: "添加失败，请重试",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="add-dish-page">
      <View className="add-dish-header">
        <Text className="page-title">➕ 添加新菜品</Text>
        <Text className="page-subtitle">为我们的菜单增添美味</Text>
      </View>

      <ScrollView scrollY className="add-dish-content">
        <View className="form-section">
          <View className="form-item">
            <Text className="form-label">菜品名称 *</Text>
            <Input
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              placeholder="请输入菜品名称"
              className="form-input"
            />
          </View>

          <View className="form-item">
            <Text className="form-label">菜品描述 *</Text>
            <Input
              value={formData.description}
              onChange={(value) => handleInputChange("description", value)}
              placeholder="请输入菜品描述"
              className="form-input"
              type="textarea"
              rows={3}
            />
          </View>

          <View className="form-item">
            <Text className="form-label">菜品图片</Text>
            <View className="image-upload-section">
              <View className="image-preview">
                <image
                  src={formData.image}
                  mode="aspectFill"
                  className="preview-image"
                />
              </View>
              <Button
                type="primary"
                size="small"
                onClick={handleChooseImage}
                className="upload-btn"
              >
                📷 选择图片
              </Button>
            </View>
          </View>

          <View className="form-item">
            <Text className="form-label">菜品分类 *</Text>
            {categoriesLoading ? (
              <View className="loading-categories">
                <Text>加载分类中...</Text>
              </View>
            ) : (
              <View className="category-selector">
                {console.log(
                  "渲染分类选择器 - categories:",
                  categories,
                  "formData.categoryId:",
                  formData.categoryId
                )}
                <View
                  className="category-picker"
                  onClick={() => setShowCategoryModal(true)}
                >
                  <Text className="category-picker-text">
                    {categories.find((cat) => cat.id === formData.categoryId)
                      ?.name || "请选择分类"}
                  </Text>
                  <Text className="category-picker-arrow">▼</Text>
                </View>
                <Text className="category-hint">选择菜品所属的分类</Text>

                {/* 分类选择弹窗 */}
                {showCategoryModal && (
                  <View className="category-modal">
                    <View className="category-modal-content">
                      <View className="category-modal-header">
                        <Text className="category-modal-title">选择分类</Text>
                        <Text
                          className="category-modal-close"
                          onClick={() => setShowCategoryModal(false)}
                        >
                          ✕
                        </Text>
                      </View>
                      <ScrollView className="category-modal-list">
                        {categories.map((category) => (
                          <View
                            key={category.id}
                            className={`category-modal-item ${
                              formData.categoryId === category.id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                categoryId: category.id,
                              }));
                              setShowCategoryModal(false);
                            }}
                          >
                            <Text className="category-modal-item-text">
                              {category.name}
                            </Text>
                            {formData.categoryId === category.id && (
                              <Text className="category-modal-item-check">
                                ✓
                              </Text>
                            )}
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          <View className="form-item">
            <Text className="form-label">所需积分 *</Text>
            <InputNumber
              value={formData.price}
              onChange={(value) => handleInputChange("price", value)}
              min={1}
              max={999}
              className="form-input"
            />
            <Text className="form-hint">点餐时消耗的积分数量</Text>
          </View>

          <View className="form-item">
            <Text className="form-label">菜品图片</Text>
            <View className="image-preview">
              <image
                src={formData.image}
                mode="aspectFit"
                className="preview-image"
              />
              <Text className="image-hint">使用默认图片，后续可更换</Text>
            </View>
          </View>
        </View>

        <View className="form-actions">
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            loading={loading}
            className="submit-button"
          >
            添加菜品
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddDishPage;
