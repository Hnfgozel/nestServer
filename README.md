# NestJS Flight Reservation Management Server

This is a server application built with [NestJS](https://nestjs.com/) for managing flight reservations. The server handles authentication, data retrieval, and business logic for the flight reservation system.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (Node Package Manager)
- Firebase account for Firestore database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Hnfgozel/nestServer.git
   cd nestServer
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up your Firebase project and configure the Firestore database. Update the Firebase configuration in your application as needed. on firebase.service.ts file there is a line 
 await this.generateMockDataIfNeeded(false); make it true to generate new mock data on each run. 

### Running the Development Server

To start the development server, run:

   ```bash
 npm run start:dev
   ```

   
The server will be running on [http://localhost:4000](http://localhost:4000).

### Features

- RESTful API for managing reservations and users.
- JWT-based authentication for secure access.
- Role-based access control for admin and staff users.
- Integration with Firebase Firestore for data storage.

### Learn More

To learn more about NestJS, take a look at the following resources:
- [NestJS Documentation](https://docs.nestjs.com/)
- [NestJS GitHub Repository](https://github.com/nestjs/nest)

## License

This project is licensed under the MIT License.