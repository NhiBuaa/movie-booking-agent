const fs = require('fs');

const path = 'C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/.system_generated/steps/1196/output.txt';
const content = fs.readFileSync(path, 'utf8');

const regex = /<frame\s+[^>]*name="([^"]*(?:S08|Sweetbox|Ghế đôi|sơ đồ ghế|Legend)[^"]*)"[^>]*>/gi;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log('Found:', match[0]);
}
