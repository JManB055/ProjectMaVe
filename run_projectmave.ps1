# Stop on errors
$ErrorActionPreference = "Stop"

# Build the Docker image
docker build -t projectmave:latest .

# Stop and remove any existing container (ignore if it doesn't exist)
docker rm -f projectmave 2>$null

# Run the container
docker run -d -p 127.0.0.1:8080:8080 -v "C:\opt\project\DataProtection-Keys:/root/.aspnet/DataProtection-Keys" --env-file .env --name projectmave projectmave:latest

Write-Host "ProjectMaVe is now running at http://127.0.0.1:8080"