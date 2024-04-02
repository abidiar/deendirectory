import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../services/supabaseClient';

const BusinessSignUp = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm Password is required'),
      businessName: Yup.string().required('Business Name is required'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const { user, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setErrors({ serverError: error.message });
        } else {
          console.log('Business user signed up successfully:', user);
          const { data, error: insertError } = await supabase
            .from('business_profiles')
            .insert({
              id: user.id,
              email: user.email,
              business_name: values.businessName,
            });

          if (insertError) {
            console.error('Error inserting business user data:', insertError);
            setErrors({ serverError: 'An error occurred while creating the business account' });
          } else {
            console.log('Business user data inserted successfully:', data);
            navigate('/signup-success');
          }
        }
      } catch (error) {
        console.error('Error during sign-up:', error);
        setErrors({ serverError: 'An error occurred. Please try again.' });
      }

      setSubmitting(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Business Sign Up</h2>
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
          <div className="mb-4">
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
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-bold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...formik.getFieldProps('confirmPassword')}
              className={`w-full px-3 py-2 border ${
                formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:border-indigo-500`}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="text-red-500 mt-1">{formik.errors.confirmPassword}</div>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="businessName" className="block text-gray-700 font-bold mb-2">
              Business Name
            </label>
            <input
              type="text"
              id="businessName"
              {...formik.getFieldProps('businessName')}
              className={`w-full px-3 py-2 border ${
                formik.touched.businessName && formik.errors.businessName ? 'border-red-500' : 'border-gray-300'
              } rounded-md focus:outline-none focus:border-indigo-500`}
            />
            {formik.touched.businessName && formik.errors.businessName && (
              <div className="text-red-500 mt-1">{formik.errors.businessName}</div>
            )}
          </div>
          {formik.errors.serverError && (
            <div className="text-red-500 mb-4">{formik.errors.serverError}</div>
          )}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            {formik.isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusinessSignUp;