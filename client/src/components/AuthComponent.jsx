import React, { useState } from 'react';
import { signUp, signIn } from '../services/auth';

function AuthComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Toggle between Sign Up and Sign In

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (isSignUp) {
        const { user, session } = await signUp(email, password);
        console.log('User signed up:', user);
        // Handle user sign up...
      } else {
        const { user, session } = await signIn(email, password);
        console.log('User signed in:', user);
        // Handle user sign in...
      }
    } catch (error) {
      console.error('Auth error:', error.message);
      // Handle errors (e.g., display an error message)
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Switch to Sign In' : 'Switch to Sign Up'}
      </button>
    </div>
  );
}

export default AuthComponent;
