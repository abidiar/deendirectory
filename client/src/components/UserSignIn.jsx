import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../services/supabaseClient';

const UserSignIn = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setErrors({ serverError: error.message });
        } else {
          // Redirect to the user dashboard or appropriate page
          navigate('/dashboard/user');
        }
      } catch (error) {
        setErrors({ serverError: 'An error occurred. Please try again.' });
      }

      setSubmitting(false);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">User Sign In</h2>
        <form onSubmit={formik.handleSubmit}>
          {/* Render form fields */}
          {/* ... */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            {formik.isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserSignIn;