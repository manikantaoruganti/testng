# CrisisOS Architecture Documentation

## 1. Overview

CrisisOS is an autonomous crisis response operating system designed for hospitality venues. It's built as a full-stack JavaScript application, leveraging a modular, event-driven architecture to ensure real-time responsiveness, scalability, and maintainability. The system is divided into a client-side application (React/Vite) and a server-side application (Node.js/Fastify), communicating via REST APIs and WebSockets.

## 2. High-Level Architecture

\`\`\`mermaid
graph TD
    subgraph Client (Frontend)
        C[React App] -->|HTTP/WS| API_GW(API Gateway / Proxy)
        C -->|WebSockets| WS_SERVER(WebSocket Server)
    end

    subgraph Server (Backend)
        API_GW --> FASTIFY(Fastify API)
        WS_SERVER --> SOCKET_IO(Socket.IO Server)

        FASTIFY --&gt; CONTROLLERS(API Controllers)
        SOCKET_IO --&gt; SOCKET_HANDLERS(Socket Handlers)

        CONTROLLERS & SOCKET_HANDLERS --&gt; ORCHESTRATOR(Orchestrator)
        ORCHESTRATOR --&gt; CORE_MODULES(Core Modules)
        CORE_MODULES --&gt; EVENT_BUS(Event Bus)
        EVENT_BUS --&gt; EVENT_HANDLERS(Event Handlers)

        CORE_MODULES & EVENT_HANDLERS --&gt; DB(MongoDB)
        CORE_MODULES & EVENT_HANDLERS --&gt; GRAPH(Building Graph / Digital Twin)
    end

    subgraph Data Stores
        DB(MongoDB)
        GRAPH(Building Graph / Digital Twin)
    end

    subgraph External Systems (Simulated/Future)
        SENSORS(Sensors) -->|Data Stream| EVENT_BUS
        EMERGENCY_SERVICES(Emergency Services) -->|API/WS| FASTIFY
        STAFF_DEVICES(Staff Devices) -->|API/WS| FASTIFY
    end

    style C fill:#9E7FFF,stroke:#38bdf8,stroke-width:2px
    style API_GW fill:#262626,stroke:#2F2F2F,stroke-width:1px,color:#FFFFFF
    style WS_SERVER fill:#262626,stroke:#2F2F2F,stroke-width:1px,color:#FFFFFF
    style FASTIFY fill:#38bdf8,stroke:#9E7FFF,stroke-width:2px
    style SOCKET_IO fill:#38bdf8,stroke:#9E7FFF,stroke-width:2px
    style CONTROLLERS fill:#f472b6,stroke:#9E7FFF,stroke-width:1px
    style SOCKET_HANDLERS fill:#f472b6,stroke:#9E7FFF,stroke-width:1px
    style ORCHESTRATOR fill:#10b981,stroke:#9E7FFF,stroke-width:2px
    style CORE_MODULES fill:#f59e0b,stroke:#9E7FFF,stroke-width:1px
    style EVENT_BUS fill:#ef4444,stroke:#9E7FFF,stroke-width:1px
    style EVENT_HANDLERS fill:#f59e0b,stroke:#9E7FFF,stroke-width:1px
    style DB fill:#A3A3A3,stroke:#2F2F2F,stroke-width:1px
    style GRAPH fill:#A3A3A3,stroke:#2F2F2F,stroke-width:1px
    style SENSORS fill:#262626,stroke:#2F2F2F,stroke-width:1px,color:#FFFFFF
    style EMERGENCY_SERVICES fill:#262626,stroke:#2F2F2F,stroke-width:1px,color:#FFFFFF
    style STAFF_DEVICES fill:#262626,stroke:#2F2F2F,stroke-width:1px,color:#FFFFFF
\`\`\`

## 3. Component Breakdown

### 3.1. Client (Frontend)

*   **React Application (Vite):** Single-page application providing the user interface.
*   **Pages:** Dashboard (real-time overview), Simulation (scenario testing), Analytics (performance metrics), Logs (event/decision history), Settings (system configuration).
*   **Components:** Reusable UI elements (Navbar, Sidebar, Cards, Buttons, Modals) and domain-specific components (BuildingMap, AlertsPanel, ScenarioPanel, RiskChart).
*   **State Management (Zustand):** Lightweight and flexible state management for global application state (e.g., `crisisStore`, `simulationStore`, `uiStore`).
*   **Hooks:** Custom React hooks (`useSocket`, `useSimulation`, `useCrisisState`, `useAnalytics`, `usePolling`, `useEventStream`) encapsulate logic and side effects.
*   **Services:** Client-side API (`api.js`) and WebSocket (`socket.js`) wrappers for interacting with the backend.
*   **Utilities:** Helper functions, constants, formatters, and validators.
*   **Styling (Tailwind CSS):** Utility-first CSS framework for rapid and consistent UI development.

### 3.2. Server (Backend)

*   **Fastify API:** High-performance Node.js web framework for handling RESTful API requests.
    *   **Routes:** Define API endpoints (`/api/crisis`, `/api/simulation`, etc.).
    *   **Controllers:** Process incoming requests, interact with services, and send responses.
    *   **Middlewares:** `auth.js` (JWT authentication), `errorHandler.js` (centralized error handling), `requestLogger.js` (request logging).
*   **Socket.IO Server:** Real-time, bidirectional event-based communication between client and server.
    *   **`socketServer.js`:** Initializes the Socket.IO instance.
    *   **`socketHandlers.js`:** Registers specific handlers for incoming client WebSocket messages (e.g., `simulation:start`).
    *   **`broadcaster.js`:** Listens to internal `EventBus` events and broadcasts relevant updates to connected clients.
    *   **`connectionManager.js`:** Tracks active client connections.
    *   **`rooms.js`:** Manages Socket.IO rooms for targeted broadcasting.
*   **Orchestrator (`orchestrator.js`):** The central coordinator. Initializes all core modules, loads initial data (e.g., building graph), and sets up periodic tasks.
*   **Core Modules:**
    *   **`state.js` (StateManager):** Manages the real-time "Digital Twin" state of the building, people, hazards, routes, and alerts. Also manages simulated state.
    *   **`simulation.js` (SimulationEngine):** Executes crisis scenarios, progresses simulation time, evolves hazards, and interacts with other core modules in a simulated context.
    *   **`routing.js` (RoutingEngine):** Implements pathfinding algorithms (e.g., Dijkstra) to find optimal evacuation routes, considering blocked nodes/paths.
    *   **`decision.js` (DecisionEngine):** Analyzes current (real or simulated) crisis state and predictions to recommend or execute optimal actions (e.g., initiate evacuation, divert crowd).
    *   **`prediction.js` (PredictionEngine):** Forecasts future crisis evolution based on current state and historical data, or leverages active simulations.
    *   **`scheduler.js`:** Manages scheduled tasks (e.g., periodic risk calculations, data updates).
    *   **`riskEngine.js`:** Assesses the overall risk level of the crisis based on various factors.
*   **Building Graph (`graph/`):** Represents the Digital Twin of the building.
    *   **`building.js`:** Loads and maintains the graph structure (nodes, edges, floors) from `building.json`.
    *   **`graphBuilder.js`:** Utilities for dynamically modifying the graph (add/remove nodes/edges).
    *   **`nodeManager.js`, `edgeManager.js`:** Specific managers for node and edge operations.
    *   **`pathUtils.js`:** Helper functions for path manipulation and analysis.
    *   **`zoneMapper.js`:** Manages dynamic zones (e.g., smoke, clear) within the building.
*   **Event-Driven Architecture (`events/`):**
    *   **`eventBus.js`:** Centralized Node.js `EventEmitter` for inter-module communication.
    *   **`eventTypes.js`:** Defines all standardized event names.
    *   **`eventQueue.js`:** Buffers and processes events in batches to prevent system overload.
    *   **`dispatcher.js`:** Routes events from the `EventBus` to their specific `handlers/`.
    *   **`handlers/`:** Contains specific logic for reacting to different event types (e.g., `fireHandler.js`, `panicHandler.js`, `evacuationHandler.js`).
*   **Services (`services/`):** Business logic layer. Encapsulates complex operations and interacts with core modules and the database.
    *   `crisisService.js`, `routingService.js`, `simulationService.js`, `alertService.js`, `analyticsService.js`, `logService.js`, `configService.js`.
*   **Database (`db/`):** MongoDB with Mongoose ODM.
    *   **`connection.js`:** Manages MongoDB connection lifecycle.
    *   **`mongo.js`:** Mongoose connection setup.
    *   **`seed.js`:** Script for populating initial database data.
    *   **`schemas/`:** Mongoose schemas for data models (`eventSchema.js`, `userSchema.js`, `buildingSchema.js`, `logSchema.js`, `configSchema.js`).
*   **Utilities (`utils/`):** General helper functions, logging (`logger.js`), validation (`validator.js`), constants, and error codes.
*   **Configuration (`config/`):** Environment variable loading (`env.js`) and application-specific settings (`appConfig.js`).

## 4. Data Flow and Interactions

1.  **Sensor Data / User Input:**
    *   Simulated sensor data or user actions (e.g., triggering a fire in simulation) are received by the server (via API or WebSocket).
    *   These inputs are translated into internal events and emitted onto the `EventBus`.
2.  **Event Processing:**
    *   The `EventQueue` buffers events.
    *   The `EventDispatcher` routes events to relevant `Event Handlers`.
    *   `Event Handlers` update the `StateManager` (Digital Twin), trigger `RoutingEngine` recalculations, `DecisionEngine` evaluations, or `AlertService` actions.
3.  **Digital Twin Update:**
    *   The `StateManager` updates its internal representation of the crisis (hazards, people, routes).
    *   Any update to the `StateManager` emits a `crisis_state_updated` event.
4.  **Decision & Prediction:**
    *   The `DecisionEngine` listens to `crisis_state_updated` and `simulation_tick` events. It analyzes the state and `PredictionEngine` forecasts to propose/execute actions.
    *   The `PredictionEngine` periodically generates forecasts or updates based on active simulations.
5.  **Real-time UI Updates:**
    *   The `Broadcaster` listens to key `EventBus` events (e.g., `crisis_state_updated`, `simulation_tick`, `alert_issued`).
    *   It broadcasts these updates via `Socket.IO` to connected clients.
    *   The client-side `useSocket` hook and Zustand stores consume these updates to render the real-time dashboard.
6.  **API Interactions:**
    *   Client-side components make REST API calls (via `apiService`) for initial data fetching, configuration changes, or non-real-time operations.
    *   `API Controllers` process these requests, interact with `Services` (which in turn use core modules and DB), and return data.
7.  **Logging:**
    *   All significant events, decisions, and system activities are logged to MongoDB via `LogService`.

## 5. Key Innovations Integration

*   **Digital Twin:** Implemented by `Building Graph` and `StateManager`. The `building.json` defines the static structure, while `StateManager` holds the dynamic, real-time state (people, hazards).
*   **Simulation Engine:** The `simulation.js` module, interacting with `StateManager`, `RoutingEngine`, `DecisionEngine`, and `PredictionEngine` to run scenarios.
*   **Routing Engine:** The `routing.js` module, providing dynamic pathfinding based on current hazards.
*   **Decision Engine:** The `decision.js` module, acting as the intelligent core for autonomous actions.
*   **Event-Driven Architecture:** Central to the system, enabling loose coupling and real-time reactions through `EventBus`, `EventQueue`, `Dispatcher`, and `Handlers`.
*   **Real-Time Coordination:** Achieved via `Socket.IO` (`socketServer.js`, `broadcaster.js`) for instant UI updates and potential future integration with staff/emergency services.

## 6. Deployment Considerations (Docker)

The project includes a `docker/` directory for containerization, enabling consistent deployment across environments.
*   `Dockerfile.server`: For the Node.js backend.
*   `Dockerfile.client`: For the React frontend.
*   `docker-compose.yml`: Orchestrates both services and a MongoDB instance.

## 7. Future Enhancements

*   **Machine Learning Integration:** For more advanced prediction models and anomaly detection.
*   **External System Integrations:** APIs for emergency services, building management systems, IoT platforms.
*   **Advanced UI Visualizations:** 3D building models, AR/VR overlays.
*   **User Authentication & Authorization:** Robust JWT implementation for different user roles.
*   **Scalability:** Microservices architecture for larger deployments.
