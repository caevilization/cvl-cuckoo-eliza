import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "../utils/api_error";

const errorHandler = (
    err: Error | ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
): Response => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }

    // 处理未预期的错误
    console.error("未预期的错误:", err);
    return res.status(500).json({
        success: false,
        error: "服务器内部错误",
    });
};

// 捕获未处理的异步错误
const asyncHandler =
    (
        fn: (
            req: Request,
            res: Response,
            next: NextFunction
        ) => Promise<Response | void>
    ): RequestHandler =>
    (req, res, next): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export { errorHandler, asyncHandler };
