import React, { useMemo } from "react";
import { View, Image } from "@tarojs/components";
import defaultImg from "../assets/icons/default-food.png";
import { API_BASE_URL } from "../constants/api";
import "./index.scss";

const ProductImage = ({
  src,
  mode = "aspectFit",
  className = "",
  width = "100%",
  height = "100%",
}) => {
  const imageUrl = useMemo(() => {
    if (!src) return defaultImg;
    if (src.startsWith("/assets/") || src.startsWith("http")) return src;
    return `${API_BASE_URL}/media/${src.replace(/^\/+/, "")}`;
  }, [src]);

  return (
    <View
      className={`product-image-wrapper ${className}`}
      style={{ width, height }}
    >
      <Image
        src={imageUrl}
        mode={mode}
        className="product-image"
        onError={() => console.log("图片加载失败")}
        style={{ width: "100%", height: "100%" }}
      />
    </View>
  );
};

export default React.memo(ProductImage);
