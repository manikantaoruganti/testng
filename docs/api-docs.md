# CrisisOS API Documentation

## 1. Overview

The CrisisOS backend provides a RESTful API for managing and interacting with the crisis response system. This API is built using Fastify, ensuring high performance and scalability. It serves as the primary interface for the frontend application and can be extended for integration with other external systems.

All API endpoints are prefixed with `/api`.

## 2. Authentication

(Placeholder: Full JWT authentication middleware is included but not yet fully integrated into all routes. For development, routes are generally open.)

Authentication will be handled via JWT (JSON Web Tokens).
*   **Login:** `POST /api/auth/login` (returns a JWT).
*   **Protected Routes:** Require a `Bearer` token in the `Authorization` header.

\`\`\`http
Authorization: Bearer <your_jwt_token>
\`\`\`

## 3. Error Handling

API responses follow a standardized error format:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE_IDENTIFIER"
}
\`\`\`

Common error codes are defined in `server/src/utils/errorCodes.js`.

## 4. API Endpoints

### 4.1. Crisis Management (`/api/crisis`)

These endpoints provide real-time data about the current crisis state.

*   **`GET /api/crisis`**
    *   **Description:** Get the complete current real-time crisis state (hazards, people, routes, alerts, crowd density).
    *   **Response:** `200 OK`
        \`\`\`json
        {
          "timestamp": "2024-01-01T12:00:00.000Z",
          "activeHazards": [...],
          "peopleLocations": [...],
          "evacuationRoutes": [...],
          "activeAlerts": [...],
          "crowdDensity": {...},
          "systemStatus": "operational"
        }
        \`\`\`
*   **`GET /api/crisis/hazards`**
    *   **Description:** Get all active hazards.
    *   **Response:** `200 OK` - `Array<HazardObject>`
*   **`GET /api/crisis/people`**
    *   **Description:** Get all people locations and statuses.
    *   **Response:** `200 OK` - `Array<PersonObject>`
*   **`GET /api/crisis/routes`**
    *   **Description:** Get all active evacuation routes.
    *   **Response:** `200 OK` - `Array<RouteObject>`
*   **`GET /api/crisis/alerts`**
    *   **Description:** Get all active alerts.
    *   **Response:** `200 OK` - `Array<AlertObject>`
*   **`GET /api/crisis/crowd-density`**
    *   **Description:** Get current crowd density data per location.
    *   **Response:** `200 OK` - `Object<locationId, count>`
*   **`POST /api/crisis/trigger-event`**
    *   **Description:** Manually trigger a crisis event (for testing/admin).
    *   **Request Body:**
        \`\`\`json
        {
          "type": "fire_detected",
          "payload": {
            "locationId": "room-101",
            "intensity": 8
          }
        }
        \`\`\`
    *   **Response:** `200 OK` - `{ success: true, message: "Event 'fire_detected' triggered successfully." }`
*   **`POST /api/crisis/alerts/:id/resolve`**
    *   **Description:** Resolve a specific alert by its ID.
    *   **Response:** `200 OK` - `{ success: true, message: "Alert <id> resolved.", alert: {...} }`

### 4.2. Simulation Management (`/api/simulation`)

These endpoints control and query the simulation engine.

*   **`GET /api/simulation/scenarios`**
    *   **Description:** Get all available simulation scenarios.
    *   **Response:** `200 OK` - `Array<ScenarioObject>`
*   **`GET /api/simulation/scenarios/:id`**
    *   **Description:** Get a specific simulation scenario by ID.
    *   **Response:** `200 OK` - `ScenarioObject`
*   **`POST /api/simulation/start`**
    *   **Description:** Start a simulation with a given scenario.
    *   **Request Body:**
        \`\`\`json
        {
          "scenarioId": "scenario-fire-drill"
        }
        \`\`\`
    *   **Response:** `200 OK` - `{ success: true, message: "Simulation start requested..." }`
*   **`POST /api/simulation/pause`**
    *   **Description:** Pause the current simulation.
    *   **Response:** `200 OK` - `{ success: true, message: "Simulation pause requested." }`
*   **`POST /api/simulation/resume`**
    *   **Description:** Resume the paused simulation.
    *   **Response:** `200 OK` - `{ success: true, message: "Simulation resume requested." }`
*   **`POST /api/simulation/reset`**
    *   **Description:** Reset the current simulation.
    *   **Response:** `200 OK` - `{ success: true, message: "Simulation reset requested." }`
*   **`POST /api/simulation/set-speed`**
    *   **Description:** Set the speed multiplier for the simulation.
    *   **Request Body:**
        \`\`\`json
        {
          "speed": 2.0
        }
        \`\`\`
    *   **Response:** `200 OK` - `{ success: true, message: "Simulation speed set to 2x." }`
*   **`POST /api/simulation/event`**
    *   **Description:** Trigger an event within the running simulation.
    *   **Request Body:**
        \`\`\`json
        {
          "type": "panic_triggered",
          "payload": {
            "locationId": "room-101"
          }
        }
        \`\`\`
    *   **Response:** `200 OK` - `{ success: true, message: "Simulation event 'panic_triggered' triggered." }`
*   **`GET /api/simulation/data`**
    *   **Description:** Get the current state of the running simulation.
    *   **Response:** `200 OK` - `SimulationStateObject`

### 4.3. Analytics (`/api/analytics`)

These endpoints provide historical and aggregated data for performance analysis.

*   **`GET /api/analytics`**
    *   **Description:** Get overall analytics dashboard data.
    *   **Query Params:** `startDate`, `endDate`, `incidentType` (optional filters)
    *   **Response:** `200 OK` - `{ riskScores: [...], responseTimes: [...], ... }`
*   **`GET /api/analytics/risk-scores`**
    *   **Description:** Get risk scores over time.
    *   **Response:** `200 OK` - `Array<RiskScoreDataPoint>`
*   **`GET /api/analytics/response-times`**
    *   **Description:** Get response times for incidents.
    *   **Response:** `200 OK` - `Array<ResponseTimeDataPoint>`
*   **`GET /api/analytics/evacuation-efficiency`**
    *   **Description:** Get evacuation efficiency metrics.
    *   **Response:** `200 OK` - `Array<EvacuationEfficiencyDataPoint>`
*   **`GET /api/analytics/hazard-trends`**
    *   **Description:** Get hazard trends over time.
    *   **Response:** `200 OK` - `Array<HazardTrendDataPoint>`
*   **`GET /api/analytics/incident-breakdown`**
    *   **Description:** Get incident breakdown by type.
    *   **Response:** `200 OK` - `Array<IncidentBreakdownDataPoint>`

### 4.4. System Status (`/api/system`)

These endpoints provide information about the backend system's health and status.

*   **`GET /api/system/health`**
    *   **Description:** Get overall system health status.
    *   **Response:** `200 OK`
        \`\`\`json
        {
          "status": "ok",
          "uptime": 12345,
          "timestamp": "2024-01-01T12:00:00.000Z",
          "database": "connected"
        }
        \`\`\`
*   **`GET /api/system/metrics`**
    *   **Description:** Get system metrics (CPU, memory, uptime).
    *   **Response:** `200 OK` - `SystemMetricsObject`
*   **`POST /api/system/shutdown`**
    *   **Description:** Trigger a graceful system shutdown (admin only).
    *   **Response:** `200 OK` - `{ success: true, message: "System shutdown initiated." }`
*   **`GET /api/system/connections`**
    *   **Description:** Get a list of currently connected WebSocket clients.
    *   **Response:** `200 OK` - `{ count: 5, clients: ["socket-id-1", "socket-id-2"] }`

### 4.5. Logs (`/api/logs`)

These endpoints retrieve various types of system logs.

*   **`GET /api/logs/events`**
    *   **Description:** Get all event logs.
    *   **Query Params:** `severity`, `eventType`, `locationId`, `startDate`, `endDate` (optional filters)
    *   **Response:** `200 OK` - `Array<EventLogObject>`
*   **`GET /api/logs/decisions`**
    *   **Description:** Get all decision logs.
    *   **Response:** `200 OK` - `Array<DecisionLogObject>`
*   **`GET /api/logs/system`**
    *   **Description:** Get all system logs.
    *   **Response:** `200 OK` - `Array<SystemLogObject>`
*   **`GET /api/logs/:type`**
    *   **Description:** Get logs by a specific type (`events`, `decisions`, `system`).
    *   **Path Params:** `type` (e.g., `events`)
    *   **Response:** `200 OK` - `Array<LogObject>` (type-specific)

### 4.6. Configuration (`/api/config`)

These endpoints manage application and building configurations.

*   **`GET /api/config/app`**
    *   **Description:** Get application configuration settings.
    *   **Response:** `200 OK` - `AppConfigObject`
*   **`PUT /api/config/app`**
    *   **Description:** Update application configuration settings.
    *   **Request Body:** `AppConfigObject` (partial updates allowed)
    *   **Response:** `200 OK` - `{ success: true, message: "Application configuration updated.", config: {...} }`
*   **`GET /api/config/building`**
    *   **Description:** Get the current building configuration (e.g., raw `building.json` content).
    *   **Response:** `200 OK` - `BuildingConfigObject`
*   **`PUT /api/config/building`**
    *   **Description:** Update the building configuration. This might trigger a graph rebuild.
    *   **Request Body:** `BuildingConfigObject` (full new config)
    *   **Response:** `200 OK` - `{ success: true, message: "Building configuration updated.", config: {...} }`
