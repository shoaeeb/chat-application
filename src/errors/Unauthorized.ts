import CustomAPIError from "./CustomAPIError";

class UnAuthorized extends CustomAPIError {
  constructor(message: string) {
    super(message);
    this.statusCode = 401;
  }
}

export default UnAuthorized;
