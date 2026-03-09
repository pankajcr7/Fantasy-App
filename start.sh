#!/bin/bash
cd /home/Fantasy-App/server && node index.js &
cd /home/Fantasy-App/client && npx vite --host 0.0.0.0 --port 5173 &
wait
