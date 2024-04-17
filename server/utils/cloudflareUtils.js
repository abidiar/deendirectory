const fetch = require('node-fetch');
const FormData = require('form-data');

async function uploadToCloudflare(fileBuffer, originalName) {
    // Validate input parameters
    if (!fileBuffer || typeof originalName !== 'string') {
        throw new Error("Invalid input parameters for uploadToCloudflare function.");
    }

    // Validate environment variables each time the function is called
    const cloudflareApiEndpointUrl = process.env.CLOUDFLARE_API_ENDPOINT_URL;
    const imageStreamCloudflareApiToken = process.env.IMAGESTREAM_CLOUDFLARE_API_TOKEN;
    const cloudflareAccountHash = process.env.CLOUDFLARE_ACCOUNT_HASH; // Cloudflare account hash

    if (!cloudflareApiEndpointUrl || !imageStreamCloudflareApiToken || !cloudflareAccountHash) {
        console.error("Cloudflare environment variables are not set properly.");
        throw new Error("Cloudflare environment variables are not set properly.");
    }

    const formData = new FormData();
    formData.append('file', fileBuffer, originalName);

    try {
        const response = await fetch(cloudflareApiEndpointUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${imageStreamCloudflareApiToken}`,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Cloudflare upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Assuming 'id' is the property that contains the image ID in Cloudflare's response
        // This might need adjustment based on the actual response structure from Cloudflare
        const imageId = data.result.id;

        // Construct the URL for accessing the uploaded image
        const imageUrl = `https://imagedelivery.net/${cloudflareAccountHash}/${imageId}/public`;
        console.log('Cloudflare Upload Successful. Image URL:', imageUrl); // Add logging statement

        return imageUrl;
    } catch (error) {
        console.error('Error uploading to Cloudflare:', error);
        throw error;
    }
}

module.exports = { uploadToCloudflare };
