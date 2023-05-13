import app from './root/app';
import config from './root/configs';

const PORT = config.app.port;
app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
