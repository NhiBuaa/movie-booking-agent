const fs = require("fs");
const path = "C:/Users/NhiBuaa/.gemini/antigravity/brain/e5c65a3a-3639-4adf-8c29-ceba7c60d57d/.system_generated/steps/1196/output.txt";
const content = fs.readFileSync(path, "utf8");

const idx = content.indexOf('name="Voucher card / VÍ VNPAY');
if (idx !== -1) {
  console.log("=== VOUCHER CARD & CINORA CLUB ===");
  console.log(content.substring(idx, idx + 4000));
}
