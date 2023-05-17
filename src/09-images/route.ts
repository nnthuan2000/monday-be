import { createReadStream, existsSync } from 'fs';
import path from 'path';
import { Router, Request, Response } from 'express';
import { BadRequestError } from '../root/responseHandler/error.response';

const imageRouter = Router();

imageRouter.get('/images/:imageName', async (req: Request, res: Response) => {
  const imageName = req.params.imageName;
  const imageDir = path.resolve(__dirname, '../asset/icons');
  let filePath: string;

  if (imageName.endsWith('.svg')) {
    filePath = path.join(imageDir, imageName);
  } else {
    filePath = path.join(imageDir, `${imageName}.svg`);
  }

  if (existsSync(filePath)) {
    res.contentType('image/svg+xml');
    const svgStream = createReadStream(filePath);
    svgStream.pipe(res);
    return;
  }

  if (imageName.endsWith('.png')) {
    filePath = path.join(imageDir, imageName);
  } else {
    filePath = path.join(imageDir, `${imageName}.png`);
  }

  if (existsSync(filePath)) {
    res.contentType('image/png');
    const svgStream = createReadStream(filePath);
    svgStream.pipe(res);
    return;
  }

  throw new BadRequestError('Image is not found');
});

export default imageRouter;
