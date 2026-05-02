#!/bin/bash

echo "Starting Real-time Chat Application..."

echo ""
echo "Starting Server..."
cd server
npm run server &
SERVER_PID=$!

echo ""
echo "Waiting 3 seconds before starting client..."
sleep 3

echo ""
echo "Starting Client..."
cd ../chat-app
npm run dev &
CLIENT_PID=$!

echo ""
echo "Both server and client are starting..."
echo "Server: http://localhost:5000"
echo "Client: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both processes"

# Wait for user to stop
wait
