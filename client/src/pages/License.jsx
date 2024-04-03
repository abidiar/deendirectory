import React from 'react';
import Head from 'next/head';

const License = () => {
  return (
    <>
      <Head>
        <title>License | DeenDirectory</title>
        <meta name="description" content="Learn about the licensing terms for the content and materials on DeenDirectory." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">License</h1>
        <section>
          <p className="mb-4">
            Unless otherwise stated, all content on DeenDirectory, including text, graphics, logos, images, and software, is the property of DeenDirectory and is protected by international copyright laws.
          </p>
          <p className="mb-4">
            The compilation of all content on this website is the exclusive property of DeenDirectory and is also protected by international copyright laws. All rights reserved.
          </p>
          <p>
            The use of any content from DeenDirectory without prior written consent is strictly prohibited.
          </p>
        </section>
      </main>
    </>
  );
};

export default License;