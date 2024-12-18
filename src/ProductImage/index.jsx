// src/components/ProductImage/index.jsx
import React, { useState, useMemo } from "react";
import { View, Image } from "@tarojs/components";
import defaultImg from "../assets/icons/default-food.png";
import { API_BASE_URL } from "../constants/api"; // 建议将API配置抽离到单独文件
import "./index.scss";

const ProductImage = ({
  src,
  mode = "aspectFit",
  className = "",
  width = "100%",
  height = "100%",
}) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 处理图片URL
  const imageUrl = useMemo(() => {
    if (!src) return defaultImg;

    // 如果是完整的URL（以http开头），直接返回
    if (src.startsWith("http")) {
      return src;
    }

    // 如果是本地资源（以assets开头），直接返回
    if (src.startsWith("/assets/")) {
      return src;
    }

    // 处理API路径
    const cleanPath = src.startsWith("/") ? src.slice(1) : src;
    return `${API_BASE_URL}/${cleanPath}`;
  }, [src]);

  // 处理图片加载完成
  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };

  // 处理图片加载失败
  const handleError = (e) => {
    console.error("Image load error:", e, "URL:", imageUrl);
    setIsLoading(false);
    setIsError(true);
  };

  return (
    <View
      className={`product-image-wrapper ${className}`}
      style={{ width, height }}
    >
      {/* 加载状态显示 */}
      {isLoading && <View className="image-loading">加载中...</View>}

      {/* 图片显示 */}
      <Image
        src={isError ? defaultImg : imageUrl}
        mode={mode}
        className={`product-image ${isLoading ? "image-hidden" : ""}`}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* 错误状态显示 */}
      {isError && <View className="image-error">图片加载失败</View>}
    </View>
  );
};

export default ProductImage;
