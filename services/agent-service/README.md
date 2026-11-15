# Movie Booking AI Agent Service (`services/agent-service`)

Conversational intelligence orchestrator powering the Movie Booking Agent Workspace.

## Core Responsibilities
- **Natural Language Understanding**: Parses natural language booking intents, user preferences (genre, theater location, showtime, seat positioning).
- **Tool Calling & Orchestration**: Invokes Cinema Core API endpoints (search movies, get showtimes, inspect seat maps, trigger hold, prepare payment intent).
- **Session & Dialogue State**: Maintains conversational state across multi-turn booking flows (CB-01 through CB-06).
- **Transactional Safety Boundary**: Strictly distinguishes AI model conversational output from authoritative Cinema Core transactions. Never hallucinates ticket confirmation without a verified Core signature.
