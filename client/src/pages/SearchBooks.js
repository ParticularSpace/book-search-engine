import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { Container, Col, Form, Button, Card, Row } from 'react-bootstrap';
import Auth from '../utils/auth';
import { searchGoogleBooks } from '../utils/API';
import { saveBookIds, getSavedBookIds } from '../utils/localStorage';
import { gql } from '@apollo/client';

// creating const SAVE_BOOK to save a book
const SAVE_BOOK = gql`
  mutation saveBook($authors: [String]!, $description: String!, $title: String!, $bookId: String!, $image: String, $link: String) {
    saveBook(authors: $authors, description: $description, title: $title, bookId: $bookId, image: $image, link: $link) {
      _id
      username
      email
      bookCount
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;

// SearchBooks function returning the search bar and the results of the search
const SearchBooks = () => {
  // creating useState for searchedBooks, searchInput, savedBookIds
  const [searchedBooks, setSearchedBooks] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
  const [saveBook] = useMutation(SAVE_BOOK);

  // creating useEffect to saveBookIds
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  // creating function to handleFormSubmit
  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (!searchInput) {
      return false;
    }
    try {
      const response = await searchGoogleBooks(searchInput);
      if (!response.ok) {
        throw new Error('something went wrong!');
      }
      const { items } = await response.json();
      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ['No author to display'],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || '',
      }));
      setSearchedBooks(bookData);
      setSearchInput('');
    } catch (err) {
      console.error(err);
    }
  };

  // creating function to save a book
  const handleSaveBook = async (bookId) => {
    // get bookData from searchedBooks array
    const bookData = searchedBooks.find((book) => book.bookId === bookId);
    
    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;
      console.log(' this is token in handleSaveBook');
      // if no token, return false
    if (!token) {
      return false;
    }
    try {
      // save bookData
      const { data } = await saveBook({
        variables: bookData,
        context: {
          headers: {
            authorization: `Bearer ${token}`
          }
        }
      });
  
      // if no data, throw error
      if (!data.saveBook) {
        throw new Error('something went wrong!');
      }
      setSavedBookIds([...savedBookIds, bookData.bookId]);
    } catch (err) {
      console.error(err);
    }
  };
  

  return (
    <>
      <div className='text-light bg-dark pt-5'>
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length
            ? `Viewing ${searchedBooks.length} results:`
            : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    {Auth.loggedIn() && (
                      <Button
                        disabled={savedBookIds?.some((savedBookId) => savedBookId === book.bookId)}
                        className='btn-block btn-info'
                        onClick={() => handleSaveBook(book.bookId)}>
                        {savedBookIds?.some((savedBookId) => savedBookId === book.bookId)
                          ? 'This book has already been saved!'
                          : 'Save this Book!'}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;
