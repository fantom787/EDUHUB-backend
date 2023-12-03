class ErrorHandler extends Error {
  constructor(message, statusCode) {
    console.log("in error handler ", statusCode, message);
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorHandler;
