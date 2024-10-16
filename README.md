# MeetingBot API

MeetingBot API is a service for managing meetings and tasks with caching using Redis and persistent storage in MongoDB. This API allows users to create, update, delete, and view meetings and tasks, while optimizing performance by reducing the number of database queries through caching.

## Table of Contents

- [Technologies](#technologies)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Running Tests](#running-tests)
- [Available API Endpoints](#available-api-endpoints)
- [Error Handling](#error-handling)

## Technologies

- **Node.js**: Backend runtime
- **Express**: Web framework for handling routes and middleware
- **MongoDB**: Database used for storing meetings and tasks
- **Redis**: Cache layer to improve performance
- **Joi**: Input validation for incoming requests
- **Jest**: Testing framework for unit and integration tests
- **Supertest**: For testing API endpoints
- **Typescript**: Strongly typed language for building scalable Node.js applications
- **Docker**: Containerization platform to run the application
- **Docker Compose**: Tool for defining and running multi-container Docker applications

## Features

- **Meeting Management**: Create, read, update, and delete meetings.
- **Task Management**: Manage tasks tied to meetings.
- **Caching**: Redis is used to cache meeting data, reducing database queries and improving performance.
- **Input Validation**: Requests are validated with Joi for security and data integrity.
- **Error Handling**: Centralized error handling using custom middleware.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone git@github.com:italojs/fireflies-backend-test.git
   cd fireflies-backend-test
   ```

2. **Run the application using `docker-compose`**:
   Make sure you have Docker and Docker Compose installed on your machine. Then, simply run:

   ```bash
   docker-compose up --build
   ```

   This will build and start the containers for your application, including the Node.js server, MongoDB, and Redis.

3. **Check the application**:
   Once the services are up, the API will be available at `http://localhost:3000` (or the port you configured in `.env`).

## Configuration

1. Create a `.env` file in the root directory of your project. The environment variables should be added like this:

   ```env
   MONGODB_URI=mongodb://mongo:27017/meetingbot
   REDIS_URL=redis://redis:6379
   PORT=3000
   JWT_SECRET=yourSecretKey
   ```

   The `MONGODB_URI` and `REDIS_URL` point to the service names defined in `docker-compose.yml`.

## Running the Project

To run the project, you only need to use Docker Compose:

```bash
docker-compose up --build
```

This will start the application on the port specified in the .env file (default is 3000).

## Generate jwt

`docker-compose exec app npm run jwt` 

it will prints a 1h jwt for you in the terminal 


## To stop the project, run:

```bash
docker-compose down
```

Running Tests
To run unit and regression tests, use the following command inside the container:

```bash
docker-compose exec app npm run test
```

## Seed the Database

To populate your database with initial data, you can run the seed script:

```bash
docker-compose exec app npm run seed
```

This will add sample meetings and tasks to your MongoDB database.

## Available API Endpoints

### Authentication

Authorization Header: All routes require a JWT token in the header: Authorization: Bearer <token>

### Meetings

- GET /api/meetings: Get all meetings (paginated)
- GET /api/meetings/:id: Get a single meeting by its ID
- POST /api/meetings: Create a new meeting
- PUT /api/meetings/:id: Update an existing meeting
- DELETE /api/meetings/:id: Delete a meeting

### Tasks

- GET /api/tasks: Get all tasks associated with a user

### Error Handling

All errors are managed by a centralized error handler. The API will respond with the appropriate HTTP status code and a JSON body containing the error message. Example of error response:

```json
{
  "message": "Authentication required"
}
```

## Common Errors

- 400 Bad Request: Validation failed, the request body is invalid.
- 401 Unauthorized: No valid token provided or the token is expired.
- 404 Not Found: The requested resource does not exist.
- 500 Internal Server Error: Something went wrong on the server side.