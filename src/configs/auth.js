export default {
  // Backend API base is https://2c6q0jsk-3000.inc1.devtunnels.ms/
  // Keep full API path here so frontend can call it with Bearer token.
  meEndpoint: '/api/v1/auth/me',
  loginEndpoint: '/jwt/login',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
