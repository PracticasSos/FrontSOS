import { useState } from 'react';
import { registerUser } from '../api/supabase';

const UserRegistration = () => {
  const [userData, setUserData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    age: '',
    charge: '',
    birthdate: '',
    check_in_date: '',
    ci: '',
    email: '',
    phone_number: '',
    password: ''
  });

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUser(userData);
      console.log('Usuario registrado:', data);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" onChange={handleChange} placeholder="Username" />
      <input type="text" name="firstname" onChange={handleChange} placeholder="First Name" />
      <input type="text" name="lastname" onChange={handleChange} placeholder="Last Name" />
      <input type="number" name="age" onChange={handleChange} placeholder="Age" />
      <input type="text" name="charge" onChange={handleChange} placeholder="Charge" />
      <input type="date" name="birthdate" onChange={handleChange} placeholder="Birthdate" />
      <input type="date" name="check_in_date" onChange={handleChange} placeholder="Check In Date" />
      <input type="text" name="ci" onChange={handleChange} placeholder="CI" />
      <input type="email" name="email" onChange={handleChange} placeholder="Email" />
      <input type="text" name="phone_number" onChange={handleChange} placeholder="Phone Number" />
      <input type="password" name="password" onChange={handleChange} placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
};

export default UserRegistration;

/*import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con tu URL de Supabase y tu clave anónima
const supabaseUrl = 'https://wqnijqzncsbuhwvvdwfm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbmlqcXpuY3NidWh3dnZkd2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkxNjkyNjIsImV4cCI6MjAzNDc0NTI2Mn0.f31oD7pF3wrfCwGC4_VzcTvwFYtX0efCjHTjALSLMeA';
const supabase = createClient(supabaseUrl, supabaseKey);

const UserRegistration = () => {
  const [userData, setUserData] = useState({
    username: '',
    firstname: '',
    lastname: '',
    age: '',
    charge: '',
    birthdate: '',
    check_in_date: '',
    ci: '',
    email: '',
    phone_number: '',
    password: ''
  });

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData]);

      if (error) throw error;
      console.log('Usuario registrado:', data);
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" onChange={handleChange} placeholder="Username" />
      <input type="text" name="firstname" onChange={handleChange} placeholder="First Name" />
      <input type="text" name="lastname" onChange={handleChange} placeholder="Last Name" />
      <input type="number" name="age" onChange={handleChange} placeholder="Age" />
      <input type="text" name="charge" onChange={handleChange} placeholder="Charge" />
      <input type="date" name="birthdate" onChange={handleChange} placeholder="Birthdate" />
      <input type="date" name="check_in_date" onChange={handleChange} placeholder="Check In Date" />
      <input type="text" name="ci" onChange={handleChange} placeholder="CI" />
      <input type="email" name="email" onChange={handleChange} placeholder="Email" />
      <input type="text" name="phone_number" onChange={handleChange} placeholder="Phone Number" />
      <input type="password" name="password" onChange={handleChange} placeholder="Password" />
      <button type="submit">Register</button>
    </form>
  );
};

export default UserRegistration;
*/