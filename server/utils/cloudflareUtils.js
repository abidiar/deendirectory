const fetch = require('node-fetch');
const FormData = require('form-data');

// Validate environment variables at the start
if (!process.env.CLOUDFLARE_API_ENDPOINT_URL || !process.env.IMAGESTREAM_CLOUDFLARE_API_TOKEN) {
    console.error("Cloudflare environment variables are not set.");
    process.exit(1); // Or handle this error appropriately in your application's context
}

async function uploadToCloudflare(fileBuffer, originalName) {
    // Validate input parameters
    if (!fileBuffer || !originalName) {
        throw new Error("Invalid input parameters for uploadToCloudflare function.");
    }

    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: originalName });

    try {
        const response = await fetch(process.env.CLOUDFLARE_API_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.IMAGESTREAM_CLOUDFLARE_API_TOKEN}`,
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

        // Check Cloudflare's specific error messages
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
