# CrisisOS Simulation Engine Documentation

## 1. Overview

The CrisisOS Simulation Engine is a core innovation designed to model and predict the dynamic evolution of crisis scenarios within a hospitality venue. It allows operators to test different response strategies, understand potential outcomes, and train for various emergencies without real-world risk. The engine operates on a discrete-time simulation model, progressing through "ticks" where the state of the environment, hazards, and people is updated.

## 2. Simulation Goals

*   **Scenario Testing:** Evaluate the effectiveness of pre-defined crisis response plans.
*   **Predictive Analysis:** Forecast the spread of hazards (e.g., fire, smoke) and the movement of people.
*   **Decision Support:** Inform the `DecisionEngine` by providing simulated future states.
*   **Training:** Provide a realistic environment for staff training and emergency drills.
*   **System Validation:** Test the robustness and responsiveness of the entire CrisisOS system.

## 3. Core Components

*   **`SimulationEngine` (`server/src/core/simulation.js`):** The main orchestrator for simulations.
    *   Loads and manages simulation scenarios.
    *   Controls the simulation lifecycle (start, pause, resume, reset).
    *   Manages the simulation clock (`simulationTime`, `speedMultiplier`).
    *   Executes the `tick` function periodically.
    *   Dispatches scheduled and manually triggered events within the simulation.
*   **`StateManager` (`server/src/core/state.js`):** Holds both the real-time crisis state and a separate, isolated `simulationState`. The `SimulationEngine` updates this `simulationState` during a run.
*   **`Building Graph` (`server/src/graph/building.js`):** Provides the underlying spatial model of the venue, which is used by the simulation to understand adjacency, paths, and capacities.
*   **`RoutingEngine` (`server/src/core/routing.js`):** Used by the simulation to calculate evacuation paths for simulated people, dynamically avoiding simulated hazards.
*   **`DecisionEngine` (`server/src/core/decision.js`):** Can be integrated into the simulation loop to test autonomous decision-making in a simulated environment.
*   **`PredictionEngine` (`server/src/core/prediction.js`):** Can leverage the running simulation as a source of "ground truth" for its predictions, or run micro-simulations itself.
*   **`CrisisEvent` Schema (`server/src/db/schemas/eventSchema.js`):** Used to define and store simulation scenarios and their scheduled events.

## 4. Simulation Lifecycle

1.  **Load Scenarios:** The `SimulationEngine` loads pre-defined scenarios (from DB or static files). Each scenario includes an `initialState` and a list of `events` scheduled at specific `time` points.
2.  **Select Scenario:** An operator selects a scenario from the UI.
3.  **Start Simulation:**
    *   The `SimulationEngine.start(scenarioId)` method is called.
    *   It initializes the `simulationState` in the `StateManager` with the scenario's `initialState`.
    *   A periodic `simulationInterval` is set up to call the `tick` function.
    *   `eventBus.emit('simulation_started')` is broadcast.
4.  **Simulation Tick (`tick()` function):** This is the heart of the simulation, executed at regular intervals.
    *   **Increment Time:** `simulationTime` is incremented.
    *   **Process Scheduled Events:** Any events in the `currentScenario.events` list whose `time` matches `simulationTime` are triggered. These events directly modify the `simulationState` (e.g., `fire_detected` adds a hazard).
    *   **Evolve Hazards:** Logic for hazard spread (e.g., fire spreading to adjacent rooms, smoke propagation) is executed, updating `simulatedHazards`.
    *   **Recalculate Routes:** The `RoutingEngine` is invoked to find new evacuation paths for `simulatedPeopleLocations`, considering the updated `simulatedHazards`.
    *   **Make Decisions:** The `DecisionEngine` is invoked to make autonomous decisions based on the current `simulationState`. These decisions are then applied back to the `simulationState`.
    *   **Update Prediction:** The `PredictionEngine` is updated with the latest `simulationState`.
    *   **Emit Tick Data:** **`eventBus.emit('simulation_tick', { time, hazards, people, routes, ... })`** is broadcast, providing real-time updates to the client.
5.  **Pause/Resume:** The `simulationInterval` can be cleared/re-established.
6.  **Reset:** Clears the `simulationState` and stops the interval.
7.  **End Conditions:** The simulation can end after a fixed duration, when all people are evacuated, or when a specific objective is met/failed.

## 5. Scenario Structure Example

A simulation scenario is defined with:

*   **`id`**: Unique identifier.
*   **`name`**: Display name.
*   **`description`**: Details of the scenario.
*   **`initialState`**: The starting conditions for the simulation (e.g., initial `peopleLocations`, `hazards`). This is a snapshot of the `StateManager`'s `currentCrisisState` but for the simulation.
    \`\`\`javascript
    {
      people: [
        { id: 'p1', currentLocationId: 'room-101', currentFloorId: 'floor-1', status: 'normal' },
        // ... more people
      ],
      hazards: [], // Initial hazards
      alerts: [],  // Initial alerts
      // ... other state elements
    }
    \`\`\`
*   **`events`**: A chronological list of events that will occur during the simulation.
    \`\`\`javascript
    [
      { time: 5, type: 'fire_detected', payload: { locationId: 'room-102', intensity: 7 } },
      { time: 20, type: 'panic_triggered', payload: { locationId: 'room-101' } },
      { time: 60, type: 'fire_extinguished', payload: { locationId: 'room-102' } },
      // ... more events
    ]
    \`\`\`
    *   `time`: The simulation time (in seconds from start) when the event should occur.
    *   `type`: The event type (e.g., `fire_detected`, `panic_triggered`).
    *   `payload`: Data associated with the event.

## 6. Hazard Evolution

The `SimulationEngine` includes logic to evolve hazards dynamically:

*   **Fire Spread:** A `fire` hazard might have a `spreadRate`. In each tick, it checks adjacent nodes in the `Building Graph` and, with a certain probability, spreads to them.
*   **Smoke Propagation:** Similar to fire, smoke can spread, affecting visibility and path safety.
*   **Intensity Change:** Hazards can increase or decrease in intensity over time based on internal logic or external events (e.g., `fire_extinguished`).

## 7. Integration with Frontend

The client-side `Simulation` page (`client/src/pages/simulation.jsx`) and its components (`ScenarioPanel.jsx`, `SimulationControls.jsx`, `PredictionView.jsx`, `SimulationLogs.jsx`, `EventTrigger.jsx`) interact with the `SimulationEngine` via:

*   **REST API:** For fetching scenarios, and initiating/controlling the simulation.
*   **WebSockets:** The `simulation_tick` event is broadcast in real-time, allowing the UI to update the map visualization, logs, and statistics dynamically.

This tight integration provides an immersive and interactive simulation experience.
