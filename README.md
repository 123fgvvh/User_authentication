# User Authentication Project

This project is a simple user authentication system built using Node.js, Express, MySQL, and Nodemailer. It allows users to sign up, log in, reset their password, and verify their email through OTP.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration with unique email validation
- Secure password storage using MySQL database
- Login with email and password
- Forgot password functionality with OTP verification
- Password reset mechanism
- Simple and clean user interface

## Technologies Used

- Node.js
- Express
- MySQL
- Nodemailer
- EJS (Embedded JavaScript) for views
- Tailwind CSS for styling

## Getting Started

### Prerequisites

- Node.js and npm installed
- MySQL database

### Installation

1. Clone the repository:
   
git clone <repository-url>

2. Install dependencies:
        
        `cd <project-directory>`
        `npm install`

3.Configuration
Create a MySQL database and configure the connection details in `app.js`.
Set up your Gmail account and configure the Nodemailer transporter with your email and an App Password.

4.Usage
  Start the server:
  `npm start`
  1. Visit *http://localhost:8000/login* in your web browser.
  2. Register a new account, log in, and explore the user authentication features.

5.Contributing
  Contributions are welcome! If you find any issues or want to enhance the project, feel free to open an issue or submit a pull request.
