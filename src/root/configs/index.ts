import { google } from 'googleapis';

interface IApp {
  port: string | number;
}

interface IDb {
  name: string;
  password: string;
}

interface IEmailConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
}

interface IConfig {
  app: IApp;
  db: IDb;
  email: IEmailConfig;
  env?: string;
}

interface IConfigs {
  [key: string]: IConfig;
}

const dev: IConfig = {
  app: {
    port: process.env.DEV_APP_PORT || 3001,
  },
  db: {
    name: process.env.DEV_DB_NAME || 'mondayDEV',
    password: process.env.DB_PASSWORD || 'qweqweqwe',
  },
  email: {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    redirectUri: process.env.REDIRECT_URI!,
    refreshToken: process.env.REFRESH_TOKEN!,
  },
};

const prod: IConfig = {
  app: {
    port: process.env.PROD_APP_PORT || 3001,
  },
  db: {
    name: process.env.PROD_DB_NAME || 'mondayPROD',
    password: process.env.DB_PASSWORD || 'qweqweqwe',
  },
  email: {
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    redirectUri: process.env.REDIRECT_URI!,
    refreshToken: process.env.REFRESH_TOKEN!,
  },
};

const configs: IConfigs = { dev, prod };
const env = process.env.NODE_ENV || 'dev';
const config = configs[env];
config.env = env;
const oAuth2Client = new google.auth.OAuth2(
  config.email.clientId,
  config.email.clientSecret,
  config.email.redirectUri
);
oAuth2Client.setCredentials({ refresh_token: config.email.refreshToken });
export { config, oAuth2Client };
