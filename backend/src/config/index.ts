export const config = {
  jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key',
  jwtExpiresIn: '24h',
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartflow-crm'
}; 