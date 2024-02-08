const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function uploadToCloudflare(file) {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path));

        const response = await fetch(process.env.CLOUDFLARE_API_ENDPOINT_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.IMAGESTREAM_CLOUDFLARE_API_TOKEN}`,
                // Add other necessary headers required by Cloudflare
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Error uploading file: ${response.statusText}`);
        }

        const data = await response.json();

        // Assuming the API returns the URL of the uploaded image in the response
        return data.result.url; 
    } catch (error) {
        console.error('Error in uploadToCloudflare:', error);
        throw error; // Rethrow the error to handle it in the calling function
    }
}

module.exports = { uploadToCloudflare };