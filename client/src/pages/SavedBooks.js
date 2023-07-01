import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { deleteBook } from '../utils/API'; 
import { getMe } from '../utils/API'; 
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
  // useQuery hook to make query request
  console.log("Start of saved books")
  const { loading, data, error } = useQuery(getMe);
  if (error) {
    console.error("Error fetching data:", error);
  }

  const userData = data?.me || {};

  console.log(userData, ' this is userData in SavedBooks');

  // useMutation hook to create a function that runs the deleteBook mutation
  const [removeBook] = useMutation(deleteBook);

  
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
        update: (cache, { data: { removeBook } }) => {
          cache.writeQuery({
            query: getMe,
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
                <Card key={book.bookId} border='dark'>
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
