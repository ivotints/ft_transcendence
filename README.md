# ft_transcendence

ft_transcendence/
├── backend/                  # Backend logic (if applicable) 
│   ├── src/ 
│   │   ├── controllers/      # Request/response handlers 
│   │   ├── models/           # Database models (ORM, Schema definitions) 
│   │   ├── routes/           # API endpoints 
│   │   ├── services/         # Business logic and services 
│   │   └── app.js            # Main backend app entry point 
│   ├── config/               # Configuration files (database, environment) 
│   ├── middlewares/          # Custom middlewares (auth, logging, etc.) 
│   ├── tests/                # Backend-specific tests 
│   └── package.json          # Dependencies for the backend 
│ 
├── frontend/                 # Frontend logic (React or Vanilla JS) 
│   ├── src/ 
│   │   ├── components/       # Reusable UI components 
│   │   ├── assets/           # Static files like images, fonts, etc. 
│   │   ├── views/            # Main pages or views 
│   │   ├── utils/            # Helper functions for frontend logic 
│   │   ├── styles/           # CSS or SCSS files 
│   │   └── index.js          # Frontend entry point 
│   ├── public/               # Static public files (index.html, favicon) 
│   └── package.json          # Dependencies for the frontend 
│ 
├── database/                 # Database-related files 
│   ├── migrations/           # SQL migrations or ORM migrations 
│   ├── seeds/                # Database seeding files 
│   └── config.js             # Database configuration 
│  
├── docker/                   # Docker setup and environment 
│   ├── Dockerfile            # Dockerfile for building the container 
│   ├── docker-compose.yml    # Compose configuration 
│   └── env/                  # Environment-specific variables (ignored by git) 
│ 
├── tests/                    # Testing suite (if combined) 
│   ├── integration/          # Integration tests (backend + frontend) 
│   └── unit/                 # Unit tests for isolated components 
│ 
├── blockchain/               # Optional: Blockchain-related files (if used) 
│   └── score_storage.sol     # Solidity smart contract for storing scores 
│  
├── .env                      # Environment variables (ignored by git) 
├── .gitignore                # List of files and directories to ignore by Git 
└── README.md                 # Documentation about the project 
