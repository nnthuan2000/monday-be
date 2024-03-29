import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import mongoose from 'mongoose';
import Type from '../../models/type';
import { config } from '../configs';

const { password, name } = config.db;
const uri = `mongodb+srv://monday:${password}@cluster0.gzcsvxt.mongodb.net/${name}?retryWrites=true&w=majority`;
// const uri = `mongodb://192.168.1.15:27018/mondayDEV`;
// const uri = `mongodb://192.168.0.106:27018`;

mongoose
  .connect(uri)
  .then(() => console.log(`Connect to DB successfully`))
  .catch((error) => console.error(error));

const importData = async () => {
  try {
    await Type.createTypes();
    console.log('Import data successfully');
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

importData();
