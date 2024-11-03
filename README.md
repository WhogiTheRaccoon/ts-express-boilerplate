# tsExpressBoiler

A boilerplate project for building RESTful APIs using TypeScript and Express.js.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

## Introduction
`tsExpressBoiler` is a starter template for building scalable and maintainable RESTful APIs using TypeScript and Express.js. It includes a set of best practices and tools to help you get started quickly. Please note that this project is still a work in progress and may not be suitable for production use.

## Features
- **TypeScript**: Strongly typed language for better code quality.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **DrizzleORM**: a lightweight and performant TypeScript ORM.
- **Database Migrations**: A simple database migration system using DrizzleORM.
- **Joi**: Object schema description language and validator for JavaScript objects.
- **Morgan**: HTTP request logger middleware for Node.js.
- **Winston**: Versatile logging library for Node.js.
- **Passport**: Authentication middleware for Node.js.
- **Queue System**: A simple queue system using Bull.
- **Email Service**: A simple email service using Nodemailer.
- **Full Authentication**: Register, Login, Forgot-Passord, Reset-Password, and Email-Verification.
- **Redis Cache**: Used for caching and rate limiting.
- **Example Crud**: Example CRUD operations for a User model.


## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/whogivsachit/tsExpressBoiler.git
    cd tsExpressBoiler
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Copy the `.env.example` file to `.env` and update the environment variables

## Usage
1. Start the development server:
    ```bash
    npm run dev
    ```

2. Build the project:
    ```bash
    npm run build
    ```

3. Generate database migrations
    ```bash
    npm run db:generate
    ```

4. Run database migrations
    ```bash
    npm run db:migrate
    ```

5. Seed database
    ```bash
    npm run db:seed
    ```

## Project Structure
```
/tsExpressBoiler
├── src
│   ├── controllers
│   ├── db
│   ├── middlewares
│   ├── policies
│   ├── routes
│   ├── services
│   ├── templates
│   ├── types
│   ├── utils
│   └── index.ts
├── .env
├── .gitignore
├── drizzle.config.ts
├── package.json
├── README.md
└── tsconfig.json
```

`Controllers` - Handles incoming requests, retrieves data from the models, and returns a response.<br>
`DB` - Contains the database configuration and models.<br>
`Middlewares` - Custom middleware functions.<br>
`Policies` - Joi validation schemas.<br>
`Routes` - Routes API endpoints to the appropriate controller.<br>
`Services` - Business logic and data manipulation, reusable components.<br>
`Templates` - Email templates.<br>
`Types` - Custom TypeScript types.<br>
`Utils` - Commonly used or repeated code.


## Scripts
- `npm run dev`: Start the development server with Nodemon.
- `npm run build`: Compile typescript.
- `npm run db:generate`: Generate database migrations.
- `npm run db:migrate`: Run database migrations.
- `npm run db:seed`: Seed the database [users].

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.