# Backend Reconstruction Plan

## Project Goal
Reconstruct a TypeScript backend for the reverse-engineered lab management app using the local domain model discovered in the decompiled Android sources.

## Guiding Principles
- Mirror the mobile app's data entities: equipment, components, maintenance records, and users.
- Use a lightweight Express backend compatible with Bun.
- Persist state in SQLite and preserve the existing database artifact at `src/db/DB`.
- Provide a clean REST API that can be consumed by a rebuilt frontend or an API-first migration.

## Data Model
- `Equipment`
  - inventoryNumber
  - name
  - commissioningDate
  - lastMaintenanceDate
  - nextMaintenanceDate
  - maintenanceHours
  - maintenanceNotes
  - maintenancePeriod
  - status

- `Component`
  - name
  - equipmentId
  - lifespanDays
  - quantityOnStock
  - purchaseDate
  - lastReplacementDate

- `Maintenance`
  - equipmentId
  - date
  - type
  - workPerformed
  - performedBy
  - checkedBy
  - hoursSpent
  - notes

- `User`
  - name
  - surname
  - patronymic
  - email
  - position

## API Surface
- `GET /api/equipment`
- `GET /api/equipment/:id`
- `POST /api/equipment`
- `PUT /api/equipment/:id`
- `DELETE /api/equipment/:id`

- `GET /api/components`
- `GET /api/components/:id`
- `POST /api/components`
- `PUT /api/components/:id`
- `DELETE /api/components/:id`

- `GET /api/maintenance`
- `GET /api/maintenance/:id`
- `GET /api/maintenance/equipment/:equipmentId`
- `POST /api/maintenance`
- `PUT /api/maintenance/:id`
- `DELETE /api/maintenance/:id`

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/auth/login`

## Implementation Notes
- `src/db/database.ts` initializes the SQLite schema and runs safe column migration for missing fields.
- `src/services/*` contains database access and normalization logic.
- `src/routes/*` exposes REST endpoints consistent with the app domain.
- `src/middleware/*` includes a generic error handler and a lightweight token generator for future auth.
- `src/server.ts` wires the API under `/api` and exposes a health endpoint.

## Next Steps
1. Seed representative equipment, maintenance, and component rows to reflect the mobile demo data.
2. Add request validation and stronger authentication if the rebuilt backend will be published.
3. Connect a frontend to the new API or generate a client from the provided OpenAPI specification.
4. Expand the backend to support filtering/search endpoints if needed by the UI.
