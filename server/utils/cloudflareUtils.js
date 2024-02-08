const fetch = require('node-fetch');
const FormData = require('form-data');

async function uploadToCloudflare(fileBuffer, originalName) {
    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: originalName });

    try {
        const response = await fetch(process.env.CLOUDFLARE_IMAGES_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Cloudflare upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result.url; // Make sure this matches the actual path in the response from Cloudflare
    } catch (error) {
        console.error('Error uploading to Cloudflare:', error);
        throw error;
    }
}
module.exports = { uploadToCloudflare };