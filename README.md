# CrisisOS – Autonomous Crisis Response Operating System

CrisisOS is a cutting-edge, real-time autonomous decision-making system designed to revolutionize crisis response in hospitality venues like hotels, resorts, and airports. It addresses the critical need for a unified system that can instantly detect, simulate, coordinate, and guide stakeholders during high-stakes emergencies such as fires, medical incidents, security threats, or infrastructure failures.

## 🎯 Objective

The primary objective of CrisisOS is to eliminate fragmented communication and delayed responses during crises by providing an intelligent platform that:
*   Instantly detects and processes crisis events from various sensors and inputs.
*   Maintains a real-time digital twin model of the environment.
*   Synchronizes communication between guests, staff, and emergency services.
*   Dynamically computes and adapts safe evacuation strategies based on evolving conditions.

## 💡 Solution Vision

CrisisOS is more than just an application; it's an operating system that thinks like a control center. It simulates future outcomes, adapts strategies dynamically, and operates autonomously even when human operators are overwhelmed.

## 🧠 Key Innovations

1.  **Digital Twin:** A graph-based model of the building where nodes represent rooms/zones and edges represent paths, enabling precise spatial awareness.
2.  **Simulation Engine:** Advanced algorithms to simulate the dynamic evolution of crises, such as fire spread, smoke propagation, and hazard zone changes over time.
3.  **Routing Engine:** Utilizes algorithms like A* or Dijkstra to compute the safest and most efficient evacuation paths in real-time, dynamically avoiding hazards.
4.  **Decision Engine:** An intelligent core that determines optimal actions, including which exits to block, where to route people, and crowd distribution strategies to minimize risk.
5.  **Event-Driven Architecture:** A highly reactive system that processes events (`fire_detected`, `panic_triggered`, `evacuation_started`) to drive real-time responses.
6.  **Real-Time Coordination:** Broadcasts critical updates instantly to guests (via notifications), staff (via dedicated interfaces), and the central dashboard, ensuring everyone has the latest information.

## 🏗️ System Architecture

CrisisOS is built as a full-stack JavaScript application, adhering to a clean, modular, and production-ready architecture.

### Frontend (`client/`)
Developed with React (Vite) for a dynamic and responsive user interface.
*   **Pages:** Dashboard, Simulation, Analytics, Logs, Settings.
*   **Components:** Comprehensive visualization tools (Building Map, Heat Map, People Tracker), interactive controls, and data displays.
*   **State Management:** Zustand for efficient global state management.
*   **Real-time:** `socket.io-client` for live updates from the server.

### Backend (`server/`)
Powered by Node.js with Fastify for high performance and scalability.
*   **Core Logic:** Modules for state management, simulation, routing, decision-making, prediction, and orchestration.
*   **Graph Management:** Dedicated modules for building and managing the digital twin graph.
*   **Event System:** A robust event bus with handlers for various crisis events.
*   **Real-time Communication:** `socket.io` server for broadcasting updates to connected clients.
*   **API:** RESTful API for data interaction, built with Fastify routes and controllers.
*   **Database:** MongoDB (via Mongoose) for persistent storage of building configurations, events, logs, and analytics.

## 🧪 Demo Scenario

The system is designed to demonstrate a critical scenario:
1.  **Trigger Fire:** An operator or sensor detects and triggers a fire event in a specific room.
2.  **Fire Spreads:** The Simulation Engine dynamically models the fire's spread and smoke propagation, creating evolving hazard zones.
3.  **Routes Dynamically Change:** The Routing Engine continuously re-computes the safest evacuation paths, avoiding newly formed hazard zones.
4.  **Decision Engine Reacts:** The Decision Engine autonomously determines optimal actions, such as blocking compromised exits and re-routing occupants.
5.  **UI Updates in Real-time:** The client dashboard instantly reflects all changes: hazard zones, updated evacuation routes, and people movement, providing operators with immediate situational awareness.

## ⚙️ Technical Stack

*   **Frontend:** React (Vite), React Router DOM, Zustand, Tailwind CSS, Lucide React, Recharts, Socket.IO Client, Axios.
*   **Backend:** Node.js, Fastify, Socket.IO, Mongoose (MongoDB), Dotenv, Pino (logging), Concurrently, Nodemon.

## 🚀 Getting Started

To set up and run CrisisOS locally:

1.  **Clone the repository:**
    \`\`\`bash
    git clone [repository-url]
    cd crisis-os
    \`\`\`
2.  **Install dependencies:**
    \`\`\`bash
    npm install
    \`\`\`
3.  **Set up environment variables:**
    Create a \`.env\` file in the root directory with necessary configurations (e.g., MongoDB connection string).
    \`\`\`
    # .env example
    MONGO_URI=mongodb://localhost:27017/crisis_os
    PORT=3000
    \`\`\`
4.  **Start the development servers:**
    \`\`\`bash
    npm run dev
    \`\`\`
    This will concurrently start both the Fastify backend and the React frontend.
5.  **Access the application:**
    Open your browser and navigate to \`http://localhost:5173\` (or the port specified by Vite).

## 📚 Documentation

Detailed documentation for architecture, event flow, simulation logic, API, and deployment can be found in the \`docs/\` directory.
