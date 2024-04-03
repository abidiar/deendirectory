import React from 'react';

const Support = () => {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Support</h1>
      <section>
        <p className="mb-4">
          At DeenDirectory, we are dedicated to ensuring a seamless user experience. If you encounter any technical issues, have trouble navigating our platform, or need guidance on how to utilize our features effectively, our support team is here to help.
        </p>
        <p className="mb-4">
          Visit our <a href="/support-center" className="text-blue-500">Support Center</a> for frequently asked questions, tutorials, and resources. If you can't find the answer you're looking for, feel free to <a href="/submit-ticket" className="text-blue-500">submit a support ticket</a>, and we'll assist you as quickly as possible.
        </p>
      </section>
    </main>
  );
};

export default Support;