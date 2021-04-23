export abstract class BaseController {
  protected success<T extends object = {}>(data: T): ResponseSuccess<T> {
    return {
      ...data,
      success: true,
    };
  }

  protected faild(message: string, statusCode?: number): ResponseError {
    return {
      message,
      statusCode,
      success: false,
    };
  }
}
