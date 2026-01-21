# LMS2 Backend

This is the backend for the LMS2 Learning Management System. It provides authentication and management APIs for Users, Teachers, and Admins.

## Features

- **Authentication**: Secure JWT-based authentication for all roles.
- **Role-Based Access Control (RBAC)**: Distinct permissions for Users, Teachers, and Admins.
- **Admin Dashboard**:
    - Register new Admins.
    - Register Users.
    - Register Teachers.
- **User Features**:
    - Login.
    - View Profile.
- **Teacher Features**:
    - Login.
    - View Profile.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ORM**: Mongoose
- **Authentication**: JSON Web Token (JWT) & bcryptjs

## API Endpoints

### Admin

| Method | Endpoint | Description | Auth Required | Admin Only |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/login` | Login as Admin | No | No |
| `POST` | `/api/admin/register` | Register a new Admin | No | No |
| `GET` | `/api/admin/profile` | Get Admin Profile | Yes | Yes |
| `POST` | `/api/admin/register/user` | Register a new User | Yes | Yes |
| `POST` | `/api/admin/register/teacher` | Register a new Teacher | Yes | Yes |

### User

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/login` | Login as User | No |
| `GET` | `/api/users/profile` | Get User Profile | Yes |

### Teacher

| Method | Endpoint | Description | Auth Required | Teacher Only |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/teachers/login` | Login as Teacher | No | No |
| `GET` | `/api/teachers/profile` | Get Teacher Profile | Yes | Yes |

## Setup & Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables in `.env`:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    ```
4.  Start the server:
    ```bash
    npm start
    ```
