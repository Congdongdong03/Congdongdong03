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
  Dialog,
} from "@nutui/nutui-react-taro";
import {
  addDish,
  updateDish,
  checkDishNameExists,
  fetchCategories,
  fetchDishById,
  fetchDishMaterials,
  addDishMaterial,
  deleteDishMaterial,
  fetchAllInventory,
  uploadImage,
} from "../../../services/api";
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
  const [uploadingImage, setUploadingImage] = useState(false); // 🆕 图片上传状态

  // 编辑模式相关状态
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDishId, setEditDishId] = useState(null);
  const [loadingDish, setLoadingDish] = useState(false);

  // 原材料管理相关状态
  const [dishMaterials, setDishMaterials] = useState([]);
  const [allInventory, setAllInventory] = useState([]);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    itemId: "",
    amount: 1,
  });

  // 初始化页面数据
  useEffect(() => {
    const initPage = async () => {
      // 检查是否是编辑模式
      const router = Taro.getCurrentInstance().router;
      const { edit, dishId } = router?.params || {};

      if (edit === "true" && dishId) {
        setIsEditMode(true);
        setEditDishId(dishId);
        await loadDishData(dishId);
        await loadDishMaterials(dishId);
      }

      await loadCategories();
      await loadAllInventory();
    };

    initPage();
  }, []);

  // 加载菜品数据（编辑模式）
  const loadDishData = async (dishId) => {
    try {
      setLoadingDish(true);
      const dish = await fetchDishById(dishId);
      if (dish) {
        setFormData({
          name: dish.name,
          description: dish.description || "",
          price: dish.price,
          categoryId: dish.categoryId,
          image: dish.image,
        });
      }
    } catch (error) {
      console.error("加载菜品数据失败:", error);
      Toast.show({
        type: "fail",
        content: "加载菜品数据失败",
        duration: 2000,
      });
    } finally {
      setLoadingDish(false);
    }
  };

  // 加载分类
  const loadCategories = async () => {
    try {
      console.log("开始加载分类...");
      const data = await fetchCategories();
      console.log("分类数据加载成功:", data);
      setCategories(data);

      // 如果不是编辑模式，设置默认分类
      if (!isEditMode && data.length > 0 && !formData.categoryId) {
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

  // 加载菜品原材料
  const loadDishMaterials = async (dishId) => {
    try {
      const materials = await fetchDishMaterials(dishId);
      setDishMaterials(materials);
    } catch (error) {
      console.error("加载菜品原材料失败:", error);
      Toast.show({
        type: "fail",
        content: "加载原材料失败",
        duration: 2000,
      });
    }
  };

  // 加载所有原材料
  const loadAllInventory = async () => {
    try {
      const inventory = await fetchAllInventory();
      setAllInventory(inventory);
    } catch (error) {
      console.error("加载原材料列表失败:", error);
    }
  };

  // 添加原材料
  const handleAddMaterial = async () => {
    if (!newMaterial.itemId) {
      Toast.show({
        type: "fail",
        content: "请选择原材料",
        duration: 2000,
      });
      return;
    }

    if (newMaterial.amount <= 0) {
      Toast.show({
        type: "fail",
        content: "数量必须大于0",
        duration: 2000,
      });
      return;
    }

    try {
      await addDishMaterial(editDishId, newMaterial.itemId, newMaterial.amount);
      await loadDishMaterials(editDishId);
      setNewMaterial({ itemId: "", amount: 1 });
      setShowMaterialModal(false);
      Toast.show({
        type: "success",
        content: "原材料添加成功！",
        duration: 2000,
      });
    } catch (error) {
      console.error("添加原材料失败:", error);
      Toast.show({
        type: "fail",
        content: "添加失败，请重试",
        duration: 2000,
      });
    }
  };

  // 删除原材料
  const handleDeleteMaterial = async (materialId) => {
    try {
      await deleteDishMaterial(editDishId, materialId);
      await loadDishMaterials(editDishId);
      Toast.show({
        type: "success",
        content: "原材料删除成功！",
        duration: 2000,
      });
    } catch (error) {
      console.error("删除原材料失败:", error);
      Toast.show({
        type: "fail",
        content: "删除失败，请重试",
        duration: 2000,
      });
    }
  };

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

  // 🆕 选择并上传图片
  const handleChooseImage = async () => {
    try {
      // 1. 选择图片
      const chooseResult = await Taro.chooseImage({
        count: 1,
        sizeType: ["compressed"], // 压缩图片
        sourceType: ["album", "camera"],
      });

      const tempFilePath = chooseResult.tempFilePaths[0];

      // 2. 显示加载提示
      setUploadingImage(true);
      Toast.show({
        type: "loading",
        content: "正在上传图片...",
        duration: 0, // 不自动关闭
      });

      // 3. 上传到服务器
      const uploadResult = await uploadImage(tempFilePath);

      // 4. 更新表单数据
      setFormData((prev) => ({
        ...prev,
        image: uploadResult.url,
      }));

      Toast.show({
        type: "success",
        content: "图片上传成功！",
        duration: 2000,
      });

      console.log("图片上传成功:", uploadResult);
    } catch (error) {
      console.error("图片上传失败:", error);
      Toast.show({
        type: "fail",
        content: error.message || "图片上传失败，请重试",
        duration: 2000,
      });
    } finally {
      setUploadingImage(false);
    }
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

      if (isEditMode) {
        // 编辑模式：更新菜品
        await updateDish(editDishId, formData);

        Toast.show({
          type: "success",
          content: "🎉 菜品更新成功！",
          duration: 2000,
        });
      } else {
        // 添加模式：检查菜品名称是否重复
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
      }

      // 返回管理面板
      setTimeout(() => {
        Taro.navigateBack();
      }, 2000);
    } catch (error) {
      console.error(`${isEditMode ? "更新" : "添加"}菜品失败:`, error);
      Toast.show({
        type: "fail",
        content: `${isEditMode ? "更新" : "添加"}失败，请重试`,
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载状态
  if (loadingDish || categoriesLoading) {
    return (
      <View className="add-dish-page">
        <View className="add-dish-header">
          <Text className="page-title">
            {isEditMode ? "✏️ 编辑菜品" : "➕ 添加新菜品"}
          </Text>
          <Text className="page-subtitle">
            {isEditMode ? "修改菜品信息" : "为我们的菜单增添美味"}
          </Text>
        </View>
        <View className="loading">加载中...</View>
      </View>
    );
  }

  return (
    <View className="add-dish-page">
      <View className="add-dish-header">
        <Text className="page-title">
          {isEditMode ? "✏️ 编辑菜品" : "➕ 添加新菜品"}
        </Text>
        <Text className="page-subtitle">
          {isEditMode ? "修改菜品信息" : "为我们的菜单增添美味"}
        </Text>
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
                {uploadingImage && (
                  <View className="uploading-mask">
                    <Text className="uploading-text">上传中...</Text>
                  </View>
                )}
              </View>
              <Button
                type="primary"
                size="small"
                onClick={handleChooseImage}
                className="upload-btn"
                loading={uploadingImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? "上传中..." : "📷 选择并上传图片"}
              </Button>
              <Text className="upload-hint">
                支持 JPG、PNG、GIF 格式，文件不超过 5MB
              </Text>
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

          {/* 原材料管理区域 - 仅在编辑模式下显示 */}
          {isEditMode && (
            <View className="form-item">
              <Text className="form-label">所需原材料</Text>
              <View className="materials-section">
                <View className="materials-header">
                  <Text className="materials-title">原材料列表</Text>
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => setShowMaterialModal(true)}
                    className="add-material-btn"
                  >
                    ➕ 添加原材料
                  </Button>
                </View>

                {dishMaterials.length === 0 ? (
                  <View className="materials-empty">
                    <Text className="materials-empty-text">暂无原材料</Text>
                    <Text className="materials-empty-hint">
                      点击"添加原材料"开始配置
                    </Text>
                  </View>
                ) : (
                  <View className="materials-list">
                    {dishMaterials.map((material) => (
                      <View key={material.id} className="material-item">
                        <View className="material-info">
                          <Text className="material-name">
                            {material.item.name}
                          </Text>
                          <Text className="material-amount">
                            需要: {material.amount} {material.item.unit}
                          </Text>
                        </View>
                        <Button
                          size="small"
                          type="danger"
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="delete-material-btn"
                        >
                          删除
                        </Button>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View className="form-actions">
          <View
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
            onClick={handleSubmit}
          >
            {isEditMode ? "保存修改" : "添加菜品"}
          </View>
        </View>
      </ScrollView>

      {/* 添加原材料弹窗 */}
      <Dialog
        title="添加原材料"
        visible={showMaterialModal}
        onConfirm={handleAddMaterial}
        onCancel={() => {
          setShowMaterialModal(false);
          setNewMaterial({ itemId: "", amount: 1 });
        }}
        confirmText="添加"
        cancelText="取消"
        closeOnOverlayClick={false}
      >
        <View className="material-form">
          <View className="form-item">
            <Text className="form-label">选择原材料 *</Text>
            <View className="material-selector">
              <View
                className="material-picker"
                onClick={() => setShowCategoryModal(true)}
              >
                <Text className="material-picker-text">
                  {allInventory.find((item) => item.id === newMaterial.itemId)
                    ?.name || "请选择原材料"}
                </Text>
                <Text className="material-picker-arrow">▼</Text>
              </View>
            </View>
          </View>
          <View className="form-item">
            <Text className="form-label">需要数量 *</Text>
            <InputNumber
              value={newMaterial.amount}
              onChange={(value) =>
                setNewMaterial({ ...newMaterial, amount: value })
              }
              min={1}
              max={999}
              className="form-input"
            />
            <Text className="form-hint">制作这道菜需要的数量</Text>
          </View>
        </View>
      </Dialog>

      {/* 原材料选择弹窗 */}
      {showMaterialModal && (
        <View className="material-modal">
          <View className="material-modal-content">
            <View className="material-modal-header">
              <Text className="material-modal-title">选择原材料</Text>
              <Text
                className="material-modal-close"
                onClick={() => setShowCategoryModal(false)}
              >
                ✕
              </Text>
            </View>
            <ScrollView className="material-modal-list">
              {allInventory.map((item) => (
                <View
                  key={item.id}
                  className={`material-modal-item ${
                    newMaterial.itemId === item.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setNewMaterial({ ...newMaterial, itemId: item.id });
                    setShowCategoryModal(false);
                  }}
                >
                  <Text className="material-modal-item-text">
                    {item.name} ({item.unit})
                  </Text>
                  {newMaterial.itemId === item.id && (
                    <Text className="material-modal-item-check">✓</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default AddDishPage;
