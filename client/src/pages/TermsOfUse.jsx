import React from 'react';
import Head from 'next/head';

const TermsOfUse = () => {
  return (
    <>
      <Head>
        <title>Terms of Use | DeenDirectory</title>
        <meta name="description" content="Read the terms and conditions for using DeenDirectory, including acceptable use, intellectual property rights, and limitations of liability." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">Terms of Use</h1>
        <section>
          <p className="mb-4">
            By accessing and using DeenDirectory, you agree to comply with our Terms of Use. These terms outline your rights and responsibilities as a user of our platform, including acceptable use, intellectual property rights, and limitations of liability.
          </p>
          <p className="mb-4">
            We encourage you to read our Terms of Use carefully to understand the legal agreement between you and DeenDirectory.
          </p>
          {/* Add your detailed, mobile-friendly Terms of Use content here */}
        </section>
      </main>
    </>
  );
};

export default TermsOfUse;