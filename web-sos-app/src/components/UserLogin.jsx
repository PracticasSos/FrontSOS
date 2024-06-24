import { useState } from 'react';
import { loginUser } from '../api/supabase';

const UserLogin = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await loginUser(loginData.email, loginData.password);
      console.log('Usuario autenticado:', user);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" onChange={handleChange} placeholder="Email" />
      <input type="password" name="password" onChange={handleChange} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
};

export default UserLogin;
