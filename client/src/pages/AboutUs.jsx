import React from 'react';
import Head from 'next/head';

const AboutUs = () => {
  return (
    <>
      <Head>
        <title>About Us | DeenDirectory</title>
        <meta name="description" content="Learn about DeenDirectory, a comprehensive online platform connecting Muslim businesses and services with the global community." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">About DeenDirectory</h1>
        <section>
          <p className="mb-4">
            DeenDirectory is a comprehensive online platform connecting Muslim businesses and services with the global community. Our mission is to support and promote Muslim-owned enterprises, fostering economic growth and strengthening the Muslim community worldwide.
          </p>
          <p className="mb-4">
            We strive to provide a user-friendly, reliable, and inclusive directory that showcases the diversity and excellence of Muslim businesses and services. Whether you're looking for halal restaurants, Islamic finance services, or Muslim-friendly travel destinations, DeenDirectory is your go-to resource.
          </p>
          <p>
            Our team is dedicated to curating and verifying listings to ensure the highest quality and accuracy. We collaborate with business owners, community leaders, and industry experts to bring you the most comprehensive and up-to-date directory possible.
          </p>
        </section>
      </main>
    </>
  );
};

export default AboutUs;