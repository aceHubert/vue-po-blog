export abstract class BaseController {
  /**
   * 返回成功
   * @param data data 中不能含有 success 的 key 字段
   */
  protected success<T extends object = {}>(data: T): ResponseSuccess<T> {
    return {
      success: true,
      ...data,
    };
  }

  /**
   * 返回失败
   * @param message 错误消息
   * @param statusCode http code
   */
  protected faild(message: string, statusCode?: number): ResponseError {
    return {
      success: false,
      message,
      statusCode,
    };
  }
}
