const fs = require('fs');
const path = require('path');
const { swaggerDocs } = require('../config/swagger');

// Create docs directory if it doesn't exist
const docsDir = path.join(__dirname, '../../docs');
if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir);
}

// Write Swagger JSON to file
fs.writeFileSync(
    path.join(docsDir, 'swagger.json'),
    JSON.stringify(swaggerDocs, null, 2)
);

console.log('Swagger documentation generated successfully!');