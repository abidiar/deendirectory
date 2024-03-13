const sharp = require('sharp');
const { uploadToCloudflare } = require('./cloudflareUtils');

async function uploadImage(file) {
  try {
    const buffer = await sharp(file.buffer)
      .rotate()
      .resize(256, 256, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
      .jpeg({ quality: 80 })
      .toBuffer();

    const imageUrl = await uploadToCloudflare(buffer, file.originalname);
    return imageUrl;
  } catch (error) {
    throw new Error(`Error processing and uploading image: ${error.message}`);
  }
}

module.exports = { uploadImage };