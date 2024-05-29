import React from 'react';
import Card from 'react-bootstrap/Card';


const cardStyle = {
  width: '200px', 
  height: '150px',
  margin: '10px',  
};

const AdminCard = () => {
  const adminCardStyle = {
    ...cardStyle,
    backgroundColor: '#3498db', 
  };

  return (
    <Card style={adminCardStyle}>
      <Card.Body>
        <Card.Title>Admin Card</Card.Title>
      </Card.Body>
    </Card>
  );
};

const CustomerCard = () => {
  const customerCardStyle = {
    ...cardStyle,
    backgroundColor: '#2ecc71', 
  };

  return (
    <Card style={customerCardStyle}>
      <Card.Body>
        <Card.Title>Customer Card</Card.Title>
      </Card.Body>
    </Card>
  );
};

const SupervisorCard = () => {
  const supervisorCardStyle = {
    ...cardStyle,
    backgroundColor: '#e74c3c', 
  };

  return (
    <Card style={supervisorCardStyle}>
      <Card.Body>
        <Card.Title>Supervisor Card</Card.Title>
      </Card.Body>
    </Card>
  );
};

const HotelCard = () => {
  const hotelCardStyle = {
    ...cardStyle,
    backgroundColor: '#f39c12', 
  };

  return (
    <Card style={hotelCardStyle}>
      <Card.Body>
        <Card.Title>Hotel Card</Card.Title>
      </Card.Body>
    </Card>
  );
};

export { HotelCard, CustomerCard, SupervisorCard, AdminCard };
