// src/components/ProductImage/index.jsx
import React, { useState, useMemo, useRef } from "react";
import { View, Image } from "@tarojs/components";
import defaultImg from "@/assets/icons/default-food.png";

const ProductImage = ({
  src,
  mode = "aspectFit",
  className = "",
  width = "100%",
  height = "100%",
}) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const errorHandled = useRef(false);

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

    // 其他情况返回默认图片
    return defaultImg;
  }, [src]);

  // 处理图片加载完成
  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
    errorHandled.current = false;
  };

  // 处理图片加载失败
  const handleError = (e) => {
    // 防止重复处理错误
    if (errorHandled.current) return;
    errorHandled.current = true;

    // 只在开发环境输出警告
    if (process.env.NODE_ENV === "development") {
      console.warn("Image load error, using default image:", imageUrl);
    }
    setIsLoading(false);
    setIsError(true);
  };

  return (
    <View
      className={`product-image-wrapper ${className}`}
      style={{ width, height }}
    >
      {/* 图片显示 */}
      <Image
        src={isError ? defaultImg : imageUrl}
        mode={mode}
        className="product-image"
        onLoad={handleLoad}
        onError={handleError}
        lazyLoad={true}
      />
    </View>
  );
};

export default ProductImage;
