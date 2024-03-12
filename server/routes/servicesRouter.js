const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');
const sequelize = require('../db/sequelize'); // Ensure sequelize is properly configured
const { convertCityStateToCoords } = require('../utils/locationUtils');
const { uploadToCloudflare } = require('../utils/cloudflareUtils');
const { Service, Category } = require('../models');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function isValidUSAddress(address) {
    const regex = /^[0-9]{1,6}\s[a-zA-Z0-9\s,'-]{3,40},\s[a-zA-Z\s]{2,20},\s[A-Z]{2}\s[0-9]{5}$/;
    return regex.test(address);
}

router.post('/add',
    upload.single('image'),
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
    body('category').trim().isLength({ min: 1 }).withMessage('Category is required'),
    body('is_halal_certified').optional().isBoolean(),
    body('phone_number').optional().matches(/^\(\d{3}\) \d{3}-\d{4}$/),
    body('postal_code').optional().matches(/^\d{5}(-\d{4})?$/),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, description, category, city, state, street_address, postal_code, country, phone_number, website, hours, is_halal_certified } = req.body;
            if (!isValidUSAddress(`${street_address}, ${city}, ${state} ${postal_code}`)) {
                return res.status(400).json({ message: 'Invalid address format' });
            }

            const categoryInstance = await Category.findOne({ where: { name: category } });
            if (!categoryInstance) {
                return res.status(400).json({ message: 'Invalid category name' });
            }
            const categoryId = categoryInstance.id;

            let coords = await convertCityStateToCoords(city, state);
            if (!coords) {
                return res.status(400).json({ message: 'Invalid city or state for coordinates' });
            }

            let imageUrl = 'defaultImageUrl'; // Fallback image URL
            if (req.file) {
                const buffer = await sharp(req.file.buffer)
                    .rotate()
                    .resize(256, 256, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
                    .jpeg({ quality: 80 })
                    .toBuffer();
                try {
                    imageUrl = await uploadToCloudflare(buffer, req.file.originalname);
                } catch (uploadError) {
                    console.error('Error uploading to Cloudflare:', uploadError);
                    return res.status(500).json({ error: 'Error uploading image to Cloudflare', details: uploadError.message });
                }
            }

            const service = await Service.create({
                name,
                description,
                latitude: coords.latitude,
                longitude: coords.longitude,
                category_id: categoryId,
                street_address,
                city,
                state,
                postal_code,
                country,
                phone_number,
                website,
                hours,
                is_halal_certified,
                average_rating: 0,
                review_count: 0,
                image_url: imageUrl
            });

            res.status(201).json(service);
        } catch (error) {
            console.error('Error during request processing:', error);
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
);

router.get('/:id', async (req, res) => {
    const businessId = parseInt(req.params.id, 10);
    if (isNaN(businessId)) {
        return res.status(400).json({ error: 'Business ID must be an integer' });
    }
    try {
        const service = await Service.findByPk(businessId, {
            include: [{
                model: Category,
                as: 'category'
            }]
        });
        if (!service) {
            return res.status(404).json({ message: 'Business not found' });
        }
        res.json(service);
    } catch (error) {
        console.error('Error fetching business details:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

module.exports = router;
