# ft_transcendence

ft_transcendence/\n
├── backend/                  # Backend logic (if applicable) \n
│   ├── src/ \n
│   │   ├── controllers/      # Request/response handlers \n
│   │   ├── models/           # Database models (ORM, Schema definitions) \n
│   │   ├── routes/           # API endpoints \n
│   │   ├── services/         # Business logic and services \n
│   │   └── app.js            # Main backend app entry point \n
│   ├── config/               # Configuration files (database, environment) \n
│   ├── middlewares/          # Custom middlewares (auth, logging, etc.) \n
│   ├── tests/                # Backend-specific tests \n
│   └── package.json          # Dependencies for the backend \n
│ \n
├── frontend/                 # Frontend logic (React or Vanilla JS) \n
│   ├── src/ \n
│   │   ├── components/       # Reusable UI components \n
│   │   ├── assets/           # Static files like images, fonts, etc. \n
│   │   ├── views/            # Main pages or views \n
│   │   ├── utils/            # Helper functions for frontend logic \n
│   │   ├── styles/           # CSS or SCSS files \n
│   │   └── index.js          # Frontend entry point \n
│   ├── public/               # Static public files (index.html, favicon) \n
│   └── package.json          # Dependencies for the frontend \n
│ \n
├── database/                 # Database-related files \n
│   ├── migrations/           # SQL migrations or ORM migrations \n
│   ├── seeds/                # Database seeding files \n
│   └── config.js             # Database configuration \n
│ \n 
├── docker/                   # Docker setup and environment \n
│   ├── Dockerfile            # Dockerfile for building the container \n
│   ├── docker-compose.yml    # Compose configuration \n
│   └── env/                  # Environment-specific variables (ignored by git) \n
│ \n
├── tests/                    # Testing suite (if combined) \n
│   ├── integration/          # Integration tests (backend + frontend) \n
│   └── unit/                 # Unit tests for isolated components \n
│ \n
├── blockchain/               # Optional: Blockchain-related files (if used) \n
│   └── score_storage.sol     # Solidity smart contract for storing scores \n
│ \n 
├── .env                      # Environment variables (ignored by git) \n
├── .gitignore                # List of files and directories to ignore by Git \n
└── README.md                 # Documentation about the project \n
