# Farm Management Application

This project is a web application for managing farms and their associated crop productions. Users can create, list, and delete farms, with data stored via a REST API using json-server.

Built with [Vite](https://vitejs.dev/) and [Vitest](https://vitest.dev/), this frontend application includes instructions for setting up the development environment, running the app locally, and deploying it.


## Prerequisites
Ensure that the following dependencies are installed:

- [Node.js](https://nodejs.org/) (recommended: version 16 or higher)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (optional)

### 1. Cloning the repository
First, clone the repository to your computer:
```bash
  git clone https://github.com/orodolfomagalhaes/oldmacdonald.git
  cd oldmacdonald
```

### 2. Install dependencies
After cloning the repository, install the project dependencies:
```bash
  npm install
```

### 3. Starting the JSON Server
This project uses [json-server](https://www.npmjs.com/package/json-server) to simulate a REST API. Start the server with:
```bash
  npm run server
```
This command will start the JSON Server on port 3000.

### 4. Running the application locally
To start the application in development mode, run:
```bash
  npm run dev
```
The app will be available at http://localhost:5173 (or another port, if configured).



### 5. Testing the application
To run the unit tests and check the test coverage, use:
```bash
  npm run test
```
The tests will run, and if coverage is below 80%, the process will return an error.

## Deploy

### 1. Running the Deploy with Docker
If you have Docker installed, you can run the application in a container. The goal is to build the application, run all the tests, start the json-server, build a container from a Dockerfile, and deploy the application in the created container.

### Linux

If you are using a Linux system, you can run the `deploy.sh` script.

The script will do the following:

- **Check if port 3000 is in use:** *The script will check if [port 3000](http://localhost:3000) is occupied. If so, it will stop the process using that port.*

- **Start the JSON Server:** *The script will start the JSON server on port 3000.*

- **Wait for the JSON Server to start:** *The script will wait 5 seconds to ensure that the JSON Server has started correctly.*

- **Run the application tests:** *It will execute the tests and verify that the coverage is above 80%.*

- **Build the application:** *If the tests pass, the app will be built using `npm run build`.*

- **Check Docker container:** *The script will check if an existing Docker container needs to be removed.*

- **Build and run the Docker container:** *The script will build a Docker image (alpine-nginx) and run a container with the app.*

After deployment, the application will be accessible on http://localhost:3001.

**Important**: 

To stop the JSON Server, use:
```bash
  kill $(lsof -t -i:3000)
```
Alternatively, use:

```bash
  kill <PID>
```
The JSON Server PID will be shown at the end of the script execution.

To stop the Docker container, use:
```bash
  docker stop oldmacdonald
```

### Manual Deployment (Other Operating Systems)

If you are using an operating system other than Linux, you can deploy the application manually by following these steps:
1. Run the tests: (`npm run test`);
2. Build the app: (`npm run build`);
3. Start the JSON Server: (`npm run server`);
4. Build the Docker image: (`docker build -t alpine-nginx .`) 
5. Run the container: (`docker run -d --name oldmacdonald -p 3001:80 alpine-nginx`).

The Docker container will handle copying the generated build files to the correct directory.


