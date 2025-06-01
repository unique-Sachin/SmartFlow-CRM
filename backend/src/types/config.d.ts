declare module '../config' {
  interface Config {
    jwtSecret: string;
    jwtExpiresIn: string;
    port: number;
    mongoUri: string;
  }

  export const config: Config;
} 