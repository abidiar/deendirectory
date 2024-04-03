import React from 'react';
import Head from 'next/head';

const PrivacyPolicy = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy | DeenDirectory</title>
        <meta name="description" content="Learn about DeenDirectory's privacy practices and how we collect, use, and protect your personal information." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <section>
          <p className="mb-4">
            At DeenDirectory, we prioritize the privacy and security of our users' personal information. Our Privacy Policy explains how we collect, use, store, and protect your data when you interact with our platform.
          </p>
          <p className="mb-4">
            We adhere to strict data protection standards and comply with applicable laws and regulations. By using DeenDirectory, you consent to the collection and processing of your information as described in our Privacy Policy.
          </p>
          {/* Add your detailed, mobile-friendly Privacy Policy content here */}
        </section>
      </main>
    </>
  );
};

export default PrivacyPolicy;