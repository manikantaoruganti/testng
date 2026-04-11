# CrisisOS Deployment Documentation

## 1. Overview

CrisisOS is designed for containerized deployment using Docker and Docker Compose. This approach ensures consistency across development, testing, and production environments, simplifies dependency management, and provides a scalable and isolated runtime for both the frontend and backend services.

## 2. Prerequisites

Before deploying CrisisOS, ensure you have the following installed:

*   **Docker:** [Install Docker Engine](https://docs.docker.com/engine/install/)
*   **Docker Compose:** [Install Docker Compose](https://docs.docker.com/compose/install/)
*   **Git:** For cloning the repository.

## 3. Local Development with Docker Compose

For local development, Docker Compose can be used to spin up the entire CrisisOS stack, including the frontend, backend, and a MongoDB database.

1.  **Clone the Repository:**
    \`\`\`bash
    git clone [your-repository-url]
    cd crisis-os
    \`\`\`

2.  **Create `.env` file:**
    Create a `.env` file in the root directory of the project. This file will contain environment variables for the backend service and MongoDB.

    \`\`\`dotenv
    # .env
    # MongoDB Connection
    MONGO_URI=mongodb://mongodb:27017/crisis_os_db

    # Server Port
    PORT=3000

    # JWT Secret (CRITICAL: Change this in production!)
    JWT_SECRET=your_jwt_secret_key_here

    # Node Environment
    NODE_ENV=development

    # Client-side API Base URL (for Vite proxy)
    VITE_API_BASE_URL=/api
    VITE_SOCKET_URL=ws://localhost:3000 # For local dev, use host machine's port
    \`\`\`
    *Note: `mongodb` in `MONGO_URI` refers to the service name defined in `docker-compose.yml`.*

3.  **Build and Run with Docker Compose:**
    Navigate to the root directory of the project (where `docker-compose.yml` is located) and run:

    \`\`\`bash
    docker-compose up --build
    \`\`\`
    This command will:
    *   Build the Docker images for the `client` and `server` services based on their respective `Dockerfile`s.
    *   Start the `mongodb` service.
    *   Start the `server` (Fastify backend) service.
    *   Start the `client` (Vite development server) service.

4.  **Access the Application:**
    Once all services are up and running:
    *   **Frontend:** Open your browser and navigate to `http://localhost:5173` (or the port specified in `client/vite.config.js`).
    *   **Backend API:** The backend will be accessible internally within the Docker network on port `3000`. For direct access from your host machine (e.g., for testing with Postman), it will be available at `http://localhost:3000`.

5.  **Stop Services:**
    To stop and remove the containers, networks, and volumes created by `docker-compose up`:
    \`\`\`bash
    docker-compose down
    \`\`\`

## 4. Production Deployment Strategy (Example)

For production, a more robust setup is recommended, potentially involving:

*   **Container Orchestration:** Kubernetes, Docker Swarm, or cloud-managed container services (AWS ECS, Google Kubernetes Engine, Azure Kubernetes Service).
*   **Reverse Proxy/Load Balancer:** Nginx or a cloud load balancer to handle traffic, SSL termination, and distribute requests to multiple instances of the frontend and backend.
*   **Persistent Storage:** Ensure MongoDB data is stored persistently using Docker volumes or a managed database service (e.g., MongoDB Atlas).
*   **Environment Variables:** Manage secrets securely using Kubernetes Secrets, AWS Secrets Manager, or similar tools.
*   **CI/CD Pipeline:** Automate building Docker images, pushing to a container registry, and deploying to the production environment.

### Example Production `docker-compose.yml` (Simplified)

For a simple production deployment on a single server, you might use a `docker-compose.prod.yml` file:

\`\`\`yaml
# docker-compose.prod.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: crisisos_mongodb_prod
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    restart: always
    networks:
      - crisisos-network

  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    container_name: crisisos_server_prod
    environment:
      PORT: 3000
      MONGO_URI: mongodb://${MONGO_ROOT_USERNAME}:${MONGO_ROOT_PASSWORD}@mongodb:27017/crisis_os_db?authSource=admin
      JWT_SECRET: ${JWT_SECRET} # Use a strong, unique secret
      NODE_ENV: production
    ports:
      - "3000:3000" # Expose backend port
    depends_on:
      - mongodb
    restart: always
    networks:
      - crisisos-network

  client:
    build:
      context: .
      dockerfile: docker/Dockerfile.client
      args:
        VITE_API_BASE_URL: /api # Client will make requests to /api, which Nginx will proxy
        VITE_SOCKET_URL: ws://your-domain.com # Replace with your production domain
    container_name: crisisos_client_prod
    ports:
      - "80:80" # Serve client on default HTTP port
    depends_on:
      - server
    restart: always
    networks:
      - crisisos-network

volumes:
  mongodb_data:

networks:
  crisisos-network:
    driver: bridge
\`\`\`

To run this production setup:

1.  Create a `.env.prod` file with production-ready environment variables (strong `JWT_SECRET`, `MONGO_ROOT_USERNAME`, `MONGO_ROOT_PASSWORD`).
2.  Run: `docker-compose -f docker-compose.prod.yml up --build -d`

*Note: This example assumes the client serves directly on port 80. In a real production setup, you'd likely have an Nginx container acting as a reverse proxy for both client and server, handling SSL and routing.*

## 5. Building Docker Images Manually

You can also build the Docker images individually:

*   **Backend Server:**
    \`\`\`bash
    docker build -t crisisos-server -f docker/Dockerfile.server .
    \`\`\`
*   **Frontend Client:**
    \`\`\`bash
    docker build -t crisisos-client -f docker/Dockerfile.client .
    \`\`\`

## 6. Seeding the Database

After the MongoDB container is running, you can seed initial data using the provided script:

\`\`\`bash
# First, ensure your MongoDB container is running (e.g., via docker-compose up)
# Then, execute the seed script from your host machine or within the server container
node server/src/db/seed.js
\`\`\`
*Note: If running from your host, ensure `MONGO_URI` in your local `.env` points to `localhost:27017` if MongoDB is exposed, or the correct Docker IP if not.*

Alternatively, you can execute the seed script directly within the running `server` container:

\`\`\`bash
docker-compose exec server node src/db/seed.js
\`\`\`
This is often safer as it uses the container's network configuration to connect to MongoDB.
