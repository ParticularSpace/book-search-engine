import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation, useApolloClient } from '@apollo/client';
import { LOGIN_USER } from '../utils/mutations';
import { GET_ME } from '../utils/queries';

import Auth from '../utils/auth';
import { saveBookIds } from '../utils/localStorage';




// LoginForm function returning the login form
const LoginForm = () => {
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [validated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  // useMutation hook to create a function that runs the LOGIN_USER mutation
  const [login, { error }] = useMutation(LOGIN_USER);

  // Get the Apollo Client instance
  const client = useApolloClient();

  // creating function to handleInputChange
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  // creating function to handleFormSubmit
  const handleFormSubmit = async (event) => {
    event.preventDefault();
  
    // check if form has everything 
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
  
    try {
      // login mutation and pass in the email and password from the form
      const { data } = await login({
        variables: { ...userFormData },
      });
  
      // use Auth.login to log the user in after signing up
      Auth.login(data.login.token);
  
      // Fetch the user's saved books from the database
      const { data: userData } = await client.query({
        query: GET_ME,
        context: {
          headers: {
            authorization: `Bearer ${Auth.getToken()}`
          }
        }
      });
  
      // Get the book IDs from the saved books
      const savedBookIds = userData.me.savedBooks.map(book => book.bookId);
  
      // Update the local storage with the saved book IDs
      saveBookIds(savedBookIds);
  
    } catch (e) {
      console.error(e);
      setShowAlert(true);
    }
    // clear form values
    setUserFormData({
      username: '',
      email: '',
      password: '',
    });
  };
  

  return (
    <>
      <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
        <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant='danger'>
          Something went wrong with your login credentials!
        </Alert>
        <Form.Group className='mb-3'>
          <Form.Label htmlFor='email'>Email</Form.Label>
          <Form.Control
            type='text'
            placeholder='Your email'
            name='email'
            onChange={handleInputChange}
            value={userFormData.email}
            required
          />
          <Form.Control.Feedback type='invalid'>Email is required!</Form.Control.Feedback>
        </Form.Group>

        <Form.Group className='mb-3'>
          <Form.Label htmlFor='password'>Password</Form.Label>
          <Form.Control
            type='password'
            placeholder='Your password'
            name='password'
            onChange={handleInputChange}
            value={userFormData.password}
            required
          />
          <Form.Control.Feedback type='invalid'>Password is required!</Form.Control.Feedback>
        </Form.Group>
        <Button
          disabled={!(userFormData.email && userFormData.password)}
          type='submit'
          variant='success'>
          Submit
        </Button>
      </Form>
    </>
  );
};

export default LoginForm;
