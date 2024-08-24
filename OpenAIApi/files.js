const fs = require('fs');

const filePath = './path/to/your/file.ext';
const fileBuffer = fs.readFileSync(filePath);
const fileBase64 = fileBuffer.toString('base64');