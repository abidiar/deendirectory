const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const { Service } = require('../models'); // Your Sequelize Service model

// Create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(smtpTransport({
  host: 'mail.privateemail.com', // Namecheap's privateemail SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'hello@deendirectory.com',
    pass: process.env.EMAIL_PASSWORD, // Your email password from environment variable
  },
  tls: {
    rejectUnauthorized: false // Only use this during development to bypass SSL
  }
}));

// Validate user's claim to a business
async function checkBusinessOwnership(userId, businessId, proof) {
  // Fetch business by ID
  const business = await Service.findByPk(businessId);

  // Here you would check the provided proof, and potentially other business rules
  // This is a placeholder; replace with your real validation logic
  if (business && !business.claimedByUserId && proofIsValid(proof)) {
    return true;
  }

  return false;
}

// Send verification email to the business email address
async function sendClaimVerification(userId, businessId) {
  // Fetch the business to get the email
  const business = await Service.findByPk(businessId);
  if (!business) throw new Error('Business not found.');

  // Generate a verification token or unique link
  const verificationToken = generateVerificationToken(userId, businessId); // Implement this function to generate a secure token
  
  // Email content
  const mailOptions = {
    from: '"DeenDirectory" <hello@deendirectory.com>', // sender address
    to: business.email, // The email column of your business; add it to the model if it doesn't exist
    subject: 'Verify your business claim', // Subject line
    html: `
      <h1>Business Claim Verification</h1>
      <p>Please click the link below to verify your claim of the business '${business.name}' on DeenDirectory.</p>
      <a href="https://deendirectory.com/claim-verify?token=${verificationToken}">Verify Business Claim</a>
    ` // HTML body content
  };

  // Send the email
  await transporter.sendMail(mailOptions);
}

// Function to generate a verification token
function generateVerificationToken(userId, businessId) {
  // This should generate a secure token that can be used to verify the claim
  // The token would typically be stored in the database along with a timestamp and user/business IDs
  // This is placeholder logic
  return `dummy-token-${userId}-${businessId}`;
}

// Placeholder function to validate the provided proof
function proofIsValid(proof) {
  // Implement your logic to validate the proof here
  // This is placeholder logic
  return true;
}

module.exports = {
  checkBusinessOwnership,
  sendClaimVerification
};
