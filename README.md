# ft_transcendence

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Stopping the Application](#stopping-the-application)

## Overview
This project is a web application that includes a backend, a frontend, and an Nginx server. It is containerized using Docker and managed via Docker Compose.

## Features
- Real-time multiplayer Pong game
- User authentication and profiles
- Tournament system
- Live chat functionality
- Responsive web design
- Showcase: ![Showcase Pong](./assets/Pong.gif)

## Prerequisites
Before you begin, ensure you have the following installed:
- Docker
- Docker Compose

## Installation
### 1. Clone the Repository
```sh
git clone https://github.com/0xSuitQ/ft_transcendence.git
cd ft_transcendence
```
### 2. Navigate to the Docker Directory
```sh
cd docker
```
### 3. Run Docker Compose
```sh
docker-compose up --build
```
This command builds the Docker images and starts the containers for:
- Database
- Backend server (Django)
- Frontend application
- Nginx server (reverse proxy)

_Note: The frontend is located in `nginx/var/www/html`._

## Usage
Once the containers are up, open your browser and navigate to:
```
https://localhost/
```
You can view the main frontend entry script here: [app.js](./nginx/var/www/html/app.js)

## Stopping the Application
To stop the application, press Ctrl+C in the terminal where docker-compose is running, or execute:
```sh
docker-compose down
```


