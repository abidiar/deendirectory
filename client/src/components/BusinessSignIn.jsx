import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../services/supabaseClient';

const BusinessSignIn = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors, setStatus }) => {
      setMessage('Logging in...');
      try {
        const { user, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setStatus({ error: error.message });
        } else {
          // Check if the user exists in the business_profiles table based on email
          const { data: businessProfile, error: businessProfileError } = await supabase
            .from('business_profiles')
            .select('id')
            .eq('email', values.email)
            .single();

          if (businessProfileError) {
            setStatus({ error: 'An error occurred. Please try again.' });
            // Sign out the user
            await supabase.auth.signOut();
          } else if (!businessProfile) {
            setStatus({ error: 'Invalid credentials. Please use the correct sign-in page.' });
            // Sign out the user
            await supabase.auth.signOut();
          } else {
            // Redirect to the business dashboard or appropriate page
            setMessage('Login successful. Redirecting...');
            navigate('/dashboard/business');
          }
        }
      } catch (error) {
        // Handle any unexpected errors
        console.error('Error during sign-in:', error);
        console.error('Error details:', error.message);
        console.error('Error stack trace:', error.stack);
        setStatus({ error: 'An unexpected error occurred. Please try again.' });
      }

      setSubmitting(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Business Sign In</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...formik.getFieldProps('email')}
              className={`w-full px-3 py-2 border ${
                formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:border-indigo-500`}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 mt-1">{formik.errors.email}</div>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...formik.getFieldProps('password')}
              className={`w-full px-3 py-2 border ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:border-indigo-500`}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 mt-1">{formik.errors.password}</div>
            )}
          </div>
          {formik.status && formik.status.error && (
            <div className="text-red-500 mb-4">{formik.status.error}</div>
          )}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            {formik.isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        {message && <div className="text-blue-500 mt-4">{message}</div>}
      </div>
    </div>
  );
};

export default BusinessSignIn;