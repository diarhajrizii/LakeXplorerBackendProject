# LakeXplorer

Welcome to LakeXplorer! This web app allows users to discover different lakes, view lake details, and share their lake sightings.

## Table of Contents

- Technical Overview
- Database Setup
- Project Structure
- Endpoints
- Authentication
- Testing
- Deployment Guidelines
- Error Handling and Responses
- Contact Information

## Technical Overview

LakeXplorer is built using:

- Programming Languages: JavaScript (Node.js)
- Frameworks and Libraries: Express.js, Multer, bcrypt, JSON Web Token (JWT)
- Database: MySQL

## Database Setup

Database Structure:

- sys (Schema)
- lakes (Table)
- lakeSightings (Table)
- likes (Table)
- users (Table)

To set up the database:

- Create the necessary schemas and tables using the provided SQL scripts.
- Make sure to populate initial data if required.

Database Configuration:

- Ensure the database configuration is correctly set in the .env file:
  - MAIN_HOST=localhost
  - MAIN_DATABASE=sys
  - MAIN_USERNAME="Your Username"
  - MAIN_PASSWORD="Your Password"

## Project Structure

- /src: Contains source code for API and routes.
  - /controllers: Handles the logic for various functionalities (e.g., user authentication, lake operations, sightings).
  - /middleware: Holds authentication middleware for securing routes.
  - /services: Includes database service configurations.
  - /utils: Houses utility functions for responses, error handling, etc.
- /public: Stores publicly accessible files (images, etc.).

### Endpoints

#### Authentication
- `POST /api/v1/register`: Register a new user.
- `POST /api/v1/login`: Log in and obtain JWT token.
- `GET /api/v1/verify/token`: Validate JWT token.

#### Lakes
- `GET /api/v1/lakes`: Get a list of all lakes.
- `GET /api/v1/lakes/:lakeId`: Get details of a specific lake.
- `PUT /api/v1/lakes/:lakeId`: Update lake details.
- `POST /api/v1/lakes`: Add a new lake.
- `DELETE /api/v1/lakes/:lakeId`: Delete a lake.

#### Lake Sightings
- `GET /api/v1/lake/sightings/:lakeId`: Get sightings for a specific lake.
- `POST /api/v1/lake/sightings/:lakeId`: Create a new lake sighting.
- `DELETE /api/v1/lake/sightings/:sightingId`: Delete a lake sighting.

#### Likes
- `GET /api/v1/lake/sightings/likes`: Get liked lake sightings for the user.
- `POST /api/v1/lake/sightings/:sightingId/like`: Like a lake sighting.
- `DELETE /api/v1/lake/sightings/:sightingId/like`: Unlike a lake sighting.
- 

## Authentication

LakeXplorer implements JWT-based authentication.

### Token Acquisition:

To obtain a token:

1. Sign in using valid credentials to receive a token.
2. Use the received token in the Authorization header for subsequent requests.

### Token Expiry:

Tokens have an expiration time of 1 hour.

### Setting Up the SECRET_KEY:

For secure token generation and verification, LakeXplorer requires a SECRET_KEY. Follow these steps to set it up:

1. Generate a secure SECRET_KEY.
2. Save the generated SECRET_KEY in the environment configuration file (.env) using the variable `SECRET_KEY`.

Ensure the SECRET_KEY remains confidential and is not shared or exposed in your code repository.



## Testing

- Utilize Postman or any API testing tool to simulate requests to various endpoints.
- Write unit tests using preferred testing frameworks (Jest, Mocha, etc.) covering authentication, CRUD operations, and edge cases.


## Deployment Guidelines

For local deployment:

- Ensure Node.js and MySQL are installed.
- Clone the repository and install dependencies.
- Configure the .env file with the appropriate database settings.
- Run the server using npm start.

## Error Handling and Responses

API Responses:

LakeXplorer uses a standardized response format.

### Successful Return

```javascript
successfulReturn: ({ message, data }, res) => {
  const resData = {
    success: true,
    data,
    message,
  };
},
```
### Error Return
```javascript
  errorReturn: ({ e, res }) => {
    const resData = {
      success: false,
      message: e.message,
    };
  },
```

## Contact Information

For any queries or support:

- Email: diarhajrizi@hotmail.com
- Phone: +38349435123
