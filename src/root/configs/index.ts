interface IApp {
  port: string | number;
}

interface IDb {
  name: string;
  password: string;
}

interface IConfig {
  app: IApp;
  db: IDb;
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
};

const prod: IConfig = {
  app: {
    port: process.env.PROD_APP_PORT || 3001,
  },
  db: {
    name: process.env.PROD_DB_NAME || 'mondayPROD',
    password: process.env.DB_PASSWORD || 'qweqweqwe',
  },
};

const configs: IConfigs = { dev, prod };
const env = process.env.NODE_ENV || 'dev';
const config = configs[env];
config.env = env;
export default config;
