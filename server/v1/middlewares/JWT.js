import jwt from 'jsonwebtoken';
import Response from '../utils/Response';

/**
 * Secure routes with JWT
 * @export
 * @class
 */
class JWT {
  /**
   * @static
   * @param {Object} req - request received
   * @param {Object} res - response to be returned
   * @param {Object} next - next middleware
   * @return {Object} - response with error messages
   */
  static async authenticate(req, res, next) {
    const token = req.headers['x-access-token'] || req.query.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          return Response.unauthenticated(res);
        }
        req.decoded = decoded;
        next();
      });
    } else {
      return Response.missingToken(res);
    }
  }
}

export default JWT;
