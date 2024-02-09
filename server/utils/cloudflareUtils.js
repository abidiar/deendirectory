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

    if (!cloudflareApiEndpointUrl || !imageStreamCloudflareApiToken) {
        console.error("Cloudflare environment variables are not set.");
        throw new Error("Cloudflare environment variables are not set.");
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

        // Error handling for JSON parsing
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            throw new Error(`Error parsing Cloudflare response: ${parseError.message}`);
        }

        // Check for Cloudflare's specific error messages
        if (data.error || data.success === false) {
            throw new Error(`Cloudflare upload error: ${data.messages || data.errors}`);
        }

        return data.result.url; // Ensure this path is correct according to Cloudflare's response structure
    } catch (error) {
        console.error('Error uploading to Cloudflare:', error);
        throw error;
    }
}

module.exports = { uploadToCloudflare };
