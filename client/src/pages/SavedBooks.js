import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';




// creating SavedBooks function to view saved books
const SavedBooks = () => {
  // useQuery hook to make query request
  const { loading, data, error } = useQuery(GET_ME);

  if (error) {
    console.error("Error fetching data:", error);
  }
  // use object destructuring to extract data from the useQuery hook's response and rename it userData
  const userData = data?.me || {};

  // useMutation hook to create a function that runs the deleteBook mutation
  const [removeBook] = useMutation(REMOVE_BOOK);

  // creating function to handleDeleteBook
  const handleDeleteBook = async (bookId) => {
    // get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    // return false if there is no token
    if (!token) {
      return false;
    }

    try {
      // run removeBook mutation and pass in variable data for bookId to remove a book from a user's profile
      await removeBook({
        variables: { bookId },
        // upon success, remove book's id from localStorage
        update: (cache, { data: { removeBook } }) => {
          // cache.writeQery to update me object's savedBooks array
          cache.writeQuery({
            query: GET_ME,
            data: { me: removeBook },
          });
        },
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>

      <Container fluid className='text-light bg-dark p-5'>

        <h1>Viewing saved books!</h1>
      </Container>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>

        <Row>
          {userData.savedBooks?.map((book) => {
            return (
              <Col md="4">
                <Card key={book.bookId} border='dark' >
                  {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                      Delete this Book!
                    </Button>
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

export default SavedBooks;
