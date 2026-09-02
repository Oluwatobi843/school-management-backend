export class ResponseHelper {
  static success(message: string, data: unknown = null, meta?: unknown) {
    return {
      success: true,
      message,
      data,
      meta,
    };
  }

  static error(message: string) {
    return {
      success: false,
      message,
    };
  }
}
