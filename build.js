const { copyFile } = require('fs/promises');
const path = require('path');

copyFile(path.join(__dirname, 'src/types.d.ts'), path.join(__dirname, 'index.d.ts'));