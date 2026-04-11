# CrisisOS Event Flow Documentation

## 1. Overview

CrisisOS is built on a robust event-driven architecture (EDA) to ensure real-time responsiveness, modularity, and scalability. The `EventBus` acts as the central nervous system, allowing different modules to communicate without direct dependencies. Events are categorized and processed by dedicated handlers, ensuring a clear flow of information and actions.

## 2. Core Event Flow Diagram

\`\`\`mermaid
graph TD
    subgraph Event Producers
        A[Sensor Data / User Input]
        B[Simulation Engine]
        C[Decision Engine]
        D[Scheduler]
        E[API / Socket Input]
    end

    A --&gt; EventBus
    B --&gt; EventBus
    C --&gt; EventBus
    D --&gt; EventBus
    E --&gt; EventBus

    EventBus(Event Bus) --&gt; EventQueue(Event Queue)
    EventQueue --&gt; EventDispatcher(Event Dispatcher)

    EventDispatcher --&gt; F[Event Handlers]
    F --&gt; G[State Manager]
    F --&gt; H[Routing Engine]
    F --&gt; I[Alert Service]
    F --&gt; J[Log Service]
    F --&gt; K[Broadcaster (to Clients)]
    F --&gt; L[Other Core Modules]

    G --&gt; EventBus
    H --&gt; EventBus
    I --&gt; EventBus
    J --&gt; EventBus
    K --&gt; EventBus
    L --&gt; EventBus

    style EventBus fill:#ef4444,stroke:#9E7FFF,stroke-width:2px,color:#FFFFFF
    style EventQueue fill:#f472b6,stroke:#9E7FFF,stroke-width:1px
    style EventDispatcher fill:#f472b6,stroke:#9E7FFF,stroke-width:1px
    style F fill:#f59e0b,stroke:#9E7FFF,stroke-width:1px
    style G fill:#10b981,stroke:#9E7FFF,stroke-width:1px
    style H fill:#10b981,stroke:#9E7FFF,stroke-width:1px
    style I fill:#10b981,stroke:#9E7FFF,stroke-width:1px
    style J fill:#10b981,stroke:#9E7FFF,stroke-width:1px
    style K fill:#10b981,stroke:#9E7FFF,stroke-width:1px
    style L fill:#10b981,stroke:#9E7FFF,stroke-width:1px
\`\`\`

## 3. Key Components

*   **`EventBus` (`server/src/events/eventBus.js`):** A centralized Node.js `EventEmitter` instance. All modules emit and listen for events here. It ensures loose coupling.
*   **`eventTypes.js` (`server/src/events/eventTypes.js`):** A comprehensive list of all standardized event names used throughout the system. This ensures consistency and prevents typos.
*   **`EventQueue` (`server/src/events/eventQueue.js`):** An optional but crucial component for managing event flow. It buffers incoming events and processes them in batches. This prevents the system from being overwhelmed by a sudden burst of events (e.g., many sensor readings at once) and ensures events are processed in order.
*   **`EventDispatcher` (`server/src/events/dispatcher.js`):** Listens to events from the `EventQueue` (or directly from `EventBus` if `EventQueue` is bypassed for critical events) and routes them to the appropriate `Event Handlers`.
*   **`Event Handlers` (`server/src/events/handlers/`):** Dedicated modules (e.g., `fireHandler.js`, `panicHandler.js`, `evacuationHandler.js`) that contain the specific business logic for reacting to particular event types. They interact with core modules and services.

## 4. Example Event Flow: Fire Detection

1.  **Event Producer (Sensor/Simulation):**
    *   A temperature sensor detects a high temperature in `room-102`.
    *   The `SensorHandler` (`server/src/events/handlers/sensorHandler.js`) receives this raw data.
    *   It processes the data and determines a `fire_detected` event should be emitted.
    *   **`eventBus.emit('hazard_created', { type: 'fire', locationId: 'room-102', intensity: 7, ... })`**
2.  **Event Queue:**
    *   The `hazard_created` event is added to the `EventQueue`.
    *   The `EventQueue` processes it in its next batch.
3.  **Event Dispatcher:**
    *   The `EventDispatcher` receives the `hazard_created` event.
    *   It routes this event to the `fireHandler.handleHazardCreated` function.
4.  **Event Handler (`fireHandler.js`):**
    *   `fireHandler.handleHazardCreated` executes:
        *   Logs the event using `logService.createLog`.
        *   Creates a new alert using `alertService.createAlert`.
        *   Updates the `StateManager` by calling `stateManager.handleHazardCreated`.
        *   Emits a new event to trigger route recalculation: **`eventBus.emit('route_recalculation_needed', { affectedNodes: ['room-102'] })`**
5.  **State Manager (`state.js`):**
    *   `stateManager.handleHazardCreated` adds the new fire hazard to `currentCrisisState.activeHazards`.
    *   It then emits **`eventBus.emit('crisis_state_updated', currentCrisisState)`**.
6.  **Routing Engine (via Evacuation Handler):**
    *   The `evacuationHandler.handleRouteRecalculationNeeded` (listening to `route_recalculation_needed`) is triggered.
    *   It calls `routingEngine.findAllEvacuationRoutes` to find new safe paths, avoiding `room-102`.
    *   Updates the `StateManager` with new routes: `stateManager.handleRouteUpdated`.
    *   Emits **`eventBus.emit('route_updated', newRoutes)`**.
7.  **Decision Engine (`decision.js`):**
    *   The `decisionEngine.evaluateCrisisState` (listening to `crisis_state_updated`) is triggered.
    *   It analyzes the new state (fire, updated routes) and might decide to:
        *   Initiate a full evacuation for the floor: **`eventBus.emit('evacuation_initiated', { floorId: 'floor-1' })`**
        *   Issue further alerts.
8.  **Broadcaster (`broadcaster.js`):**
    *   Listens to `crisis_state_updated`, `new_alert`, `route_updated`, `evacuation_initiated` events.
    *   Broadcasts these updates via `Socket.IO` to all connected client dashboards.
9.  **Client (Frontend):**
    *   The client-side `useSocket` hook receives the WebSocket messages.
    *   Zustand stores (`useCrisisStore`, `useUiStore`) are updated.
    *   React components re-render, showing the fire on the map, new alerts, and updated evacuation routes in real-time.

## 5. Event Categories

CrisisOS uses a structured approach to event types, defined in `eventTypes.js`:

*   **System Events:** `system_ready`, `system_error`, `config_updated`
*   **Crisis State Events:** `hazard_created`, `person_moved`, `alert_issued`, `crowd_density_updated`
*   **Simulation Events:** `simulation_started`, `simulation_tick`, `simulation_event_triggered`
*   **Routing Events:** `route_recalculation_needed`, `route_updated`, `path_blocked`
*   **Decision Events:** `decision_proposed`, `decision_executed`, `evacuation_initiated`
*   **Prediction Events:** `prediction_updated`
*   **Risk Events:** `risk_score_updated`
*   **UI/API Interaction Events:** `client_connected`, `user_action`

This clear categorization helps in understanding the system's behavior and debugging.
