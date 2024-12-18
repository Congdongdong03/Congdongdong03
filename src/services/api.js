import request from "../utils/request";

// 获取分类信息接口
export const fetchCategories = () => {
  return request("/cuisine/", "GET");
};
