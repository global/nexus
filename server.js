const app = require('./src/app.js');

const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : 
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env.dev';

dotenv.config({ path: envFile });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Nexus Insight Server is running on port http://localhost:${PORT}`);
});