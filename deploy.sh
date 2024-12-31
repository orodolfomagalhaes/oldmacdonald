#!/bin/bash

echo "Starting deployment process..."

# Função para verificar se uma porta está em uso
check_port() {
    lsof -i:$1 > /dev/null
    return $?
}

# Iniciar json-server
echo "Starting JSON Server..."
if check_port 3000; then
    echo "Port 3000 is already in use. Stopping existing process..."
    kill $(lsof -t -i:3000)
fi

npm run server &
JSON_SERVER_PID=$!

# Aguardar o json-server iniciar
echo "Waiting for JSON Server to start..."
sleep 5

# Verificar se o json-server está rodando
if ! check_port 3000; then
    echo "JSON Server failed to start. Aborting deployment."
    exit 1
fi

echo "JSON Server is running successfully!"

# Run tests and check coverage
echo "Running tests..."
npm run test
TEST_EXIT_CODE=$?

if [ $TEST_EXIT_CODE -ne 0 ]; then
    echo "Tests failed or coverage below 80%. Aborting deployment."
    kill $JSON_SERVER_PID
    exit 1
fi

# Build the application
echo "Building application..."
npm run build
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo "Build failed. Aborting deployment."
    kill $JSON_SERVER_PID
    exit 1
fi

# Check if container already exists and remove it
CONTAINER_NAME="oldmacdonald"
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Removing existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Build and run Docker container
echo "Building and running Docker container..."
docker build -t alpine-nginx .
docker run -d --name $CONTAINER_NAME -p 3001:80 alpine-nginx

# Wait for container to be healthy
echo "Waiting for container to be ready..."
sleep 5

# Check if container is running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Container is running successfully!"

    echo "Deploying to server..."

    echo "Deployment completed successfully!"

    echo "Server running on http://localhost:3001"
else
    echo "Container failed to start. Aborting deployment."
    kill $JSON_SERVER_PID
    exit 1
fi

echo "Deployment complete. JSON Server is still running on PID $JSON_SERVER_PID"
echo "To stop JSON Server later, run: kill $JSON_SERVER_PID"