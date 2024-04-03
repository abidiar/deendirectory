import React from 'react';

const ContactUs = () => {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <section>
        <p className="mb-4">
          We value your feedback, inquiries, and suggestions. If you have any questions, partnership proposals, or need assistance, please don't hesitate to reach out to us.
        </p>
        <p className="mb-4">
          You can contact our friendly support team by emailing us at <a href="mailto:info@deendirectory.com" className="text-blue-500">info@deendirectory.com</a> or filling out the contact form below. We are committed to providing prompt and helpful responses to your inquiries.
        </p>
        {/* Add your mobile-friendly contact form here */}
      </section>
    </main>
  );
};

export default ContactUs;