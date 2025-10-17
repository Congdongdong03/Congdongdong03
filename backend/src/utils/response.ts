import { Response } from "express";

/**
 * 成功响应
 */
export const success = (res: Response, data: any, message?: string) => {
  return res.status(200).json({
    success: true,
    data,
    message,
  });
};

/**
 * 错误响应
 */
export const error = (res: Response, message: string, statusCode = 400) => {
  return res.status(statusCode).json({
    error: message,
  });
};
