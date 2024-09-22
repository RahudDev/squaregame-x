import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_URL, web_url } from './config';

const Square = ({ onClick }) => {
  return (
    <button className="btn btn-primary square" onClick={onClick}>
      {/* You can put any content inside the square */}
    </button>
  );
};

function App() {
  const [points, setPoints] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const uuid = urlParams.get('squareUUID');
  const decodedToken = urlParams.get('badass');
  const token = decodedToken ? atob(decodedToken) : null;
  const API = API_URL.split(',');
  const web = web_url.split(',');
  const WEB = web[0];
  const API_API = API[0];


  useEffect(() => {
    if (token && uuid) {
      setIsAuthenticated(true);
      fetchPoints(token, uuid);
    }
  }, [token, uuid]);

  const fetchPoints = async (token, uuid) => {
    try {
      const response = await axios.get(`${API_API}/api/get-points/${uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const newPoints = response.data.points;
      setPoints(newPoints);
      localStorage.setItem('points', newPoints);

      // Check if the user has a referrer and update the referrer's points
      if (response.data.referrer) {
        console.log(`Referrer exists for user. UUID: ${uuid}`);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const handleClick = async () => {
    try {
      const pointsToAdd = 10; // Points to add to the user
  
      // Add points to the user's account and let the server handle the commission
      await axios.post(`${API_API}/api/commission`, {
        userId: uuid,
        amountEarned: pointsToAdd,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
  
      // Fetch updated points to reflect the new balance
      const response = await axios.get(`${API_API}/api/get-points/${uuid}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
  
      const newPoints = response.data.points;
      setPoints(newPoints);
      localStorage.setItem('points', newPoints);
  
    } catch (error) {
      console.error('Error adding points or updating referrer:', error);
      // Handle error appropriately, e.g., show a message to the user
    }
  };
  

  const handleEnd = () => {
    localStorage.setItem('hasPlayedGame', 'true');
    window.location.href = `${WEB}/#/mainpage`; // Update this URL as needed
  };

  if (!isAuthenticated) {
    return (
      <Container className="mt-5">
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Not Authenticated</Card.Title>
                <Card.Text>Please navigate from the Main Page to access this page.</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Square Page</Card.Title>
              <Card.Text>
                Click on the square to earn $CUAN.
                <br />
                $CUAN : {points}
              </Card.Text>
              <Button variant="primary" onClick={handleEnd}>End</Button>
              <div className="board">
                {[...Array(9).keys()].map((i) => (
                  <Square key={i} onClick={handleClick} />
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
