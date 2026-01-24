# Database Integration Specification

## Overview

This document outlines the specification for adding database integration to the Warehouse In/Out Storage Management Web App to enable persistent data storage across sessions.

**Status:** Planning Phase  
**Priority:** High  
**Estimated Effort:** 3-4 weeks  
**Target Version:** 2.0

---

## Table of Contents

1. [Goals and Objectives](#goals-and-objectives)
2. [Current State Analysis](#current-state-analysis)
3. [Proposed Architecture](#proposed-architecture)
4. [Database Schema](#database-schema)
5. [Backend API Design](#backend-api-design)
6. [Frontend Changes](#frontend-changes)
7. [Implementation Plan](#implementation-plan)
8. [Technology Stack Options](#technology-stack-options)
9. [Security Considerations](#security-considerations)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Considerations](#deployment-considerations)
12. [Migration Path](#migration-path)

---

## Goals and Objectives

### Primary Goals
- **Persistent Storage**: Store inventory data in a database so it persists across browser sessions
- **Multi-User Access**: Enable multiple users to access and update the same warehouse data
- **Data Integrity**: Ensure data consistency and prevent data loss
- **Scalability**: Support growing data volumes (1000+ items per warehouse)

### Secondary Goals
- **Audit Trail**: Track who made what changes and when
- **Backup & Recovery**: Enable automated backups and point-in-time recovery
- **Data Export**: Maintain Excel export functionality with database as source
- **Offline Capability**: Consider offline-first approach with sync

### Non-Goals (for v2.0)
- Real-time collaborative editing (can be added in v3.0)
- Advanced analytics and reporting (separate feature)
- Mobile app (web-responsive is sufficient for now)

---

## Current State Analysis

### Current Implementation
- **Architecture**: Pure client-side JavaScript application
- **Storage**: In-memory JavaScript array (`storageData`)
- **Data Lifetime**: Session-only (lost on page refresh)
- **Persistence**: Manual Excel export/import only

### Current Data Structure
```javascript
{
    name: string,           // Item name
    classification: string, // Item category/type
    unit: string,          // Unit of measurement
    startStorage: number,  // Starting quantity
    in: number,            // Incoming quantity
    out: number,           // Outgoing quantity
    note: string           // Additional notes
    // End Storage calculated: startStorage + in - out
}
```

### Limitations
1. No data persistence between sessions
2. No multi-user access
3. No backup/recovery mechanism
4. No change history
5. Data loss risk if browser crashes

---

## Proposed Architecture

### Architecture Style
**Option A: RESTful API with Traditional Backend** (Recommended)
```
┌─────────────┐      HTTP/HTTPS      ┌─────────────┐      SQL      ┌──────────┐
│   Browser   │ ◄──────────────────► │   Backend   │ ◄───────────► │ Database │
│  (Frontend) │      REST API        │   Server    │               │          │
└─────────────┘                      └─────────────┘               └──────────┘
```

**Option B: Serverless with Cloud Database**
```
┌─────────────┐    HTTPS/API Gateway   ┌──────────────┐     ┌──────────────┐
│   Browser   │ ◄────────────────────► │  Serverless  │ ◄──► │ Cloud DB     │
│  (Frontend) │                        │  Functions   │     │ (Firebase/   │
└─────────────┘                        └──────────────┘     │  Supabase)   │
                                                            └──────────────┘
```

### Recommended: Option A
- **Pros**: Full control, easier local development, no vendor lock-in
- **Cons**: Requires server hosting
- **Best for**: Self-hosted or small business deployments

---

## Database Schema

### Tables

#### 1. `warehouses`
Stores warehouse information.

| Column      | Type         | Constraints          | Description                    |
|-------------|--------------|----------------------|--------------------------------|
| id          | UUID         | PRIMARY KEY          | Unique warehouse identifier    |
| name        | VARCHAR(255) | NOT NULL, UNIQUE     | Warehouse name                 |
| location    | VARCHAR(255) | NULL                 | Physical location (optional)   |
| created_at  | TIMESTAMP    | NOT NULL, DEFAULT NOW| Creation timestamp             |
| updated_at  | TIMESTAMP    | NOT NULL             | Last update timestamp          |
| created_by  | UUID         | FOREIGN KEY (users)  | User who created (future auth) |

#### 2. `inventory_items`
Stores individual inventory items.

| Column         | Type          | Constraints                    | Description                   |
|----------------|---------------|--------------------------------|-------------------------------|
| id             | UUID          | PRIMARY KEY                    | Unique item identifier        |
| warehouse_id   | UUID          | FOREIGN KEY (warehouses), NOT NULL | Associated warehouse      |
| name           | VARCHAR(255)  | NOT NULL                       | Item name                     |
| classification | VARCHAR(255)  | NULL                           | Item category/type            |
| unit           | VARCHAR(50)   | NULL                           | Unit of measurement           |
| note           | TEXT          | NULL                           | Additional notes              |
| created_at     | TIMESTAMP     | NOT NULL, DEFAULT NOW          | Creation timestamp            |
| updated_at     | TIMESTAMP     | NOT NULL                       | Last update timestamp         |

#### 3. `inventory_records`
Stores daily inventory records for each item.

| Column        | Type      | Constraints                             | Description                      |
|---------------|-----------|------------------------------------------|----------------------------------|
| id            | UUID      | PRIMARY KEY                              | Unique record identifier         |
| item_id       | UUID      | FOREIGN KEY (inventory_items), NOT NULL  | Associated item                  |
| record_date   | DATE      | NOT NULL                                 | Date of this record              |
| start_storage | DECIMAL   | NOT NULL, DEFAULT 0                      | Starting quantity                |
| in_quantity   | DECIMAL   | NOT NULL, DEFAULT 0                      | Incoming quantity                |
| out_quantity  | DECIMAL   | NOT NULL, DEFAULT 0                      | Outgoing quantity                |
| end_storage   | DECIMAL   | COMPUTED (start+in-out)                  | Calculated end quantity          |
| created_at    | TIMESTAMP | NOT NULL, DEFAULT NOW                    | Creation timestamp               |
| updated_at    | TIMESTAMP | NOT NULL                                 | Last update timestamp            |

**Unique Constraint**: `(item_id, record_date)` - One record per item per day

#### 4. `audit_log` (Optional for v2.0, Recommended for v2.1)
Tracks all changes for accountability.

| Column        | Type         | Constraints                    | Description                   |
|---------------|--------------|--------------------------------|-------------------------------|
| id            | UUID         | PRIMARY KEY                    | Unique log entry              |
| table_name    | VARCHAR(50)  | NOT NULL                       | Table that was modified       |
| record_id     | UUID         | NOT NULL                       | ID of modified record         |
| action        | VARCHAR(20)  | NOT NULL                       | INSERT/UPDATE/DELETE          |
| old_values    | JSONB        | NULL                           | Previous values               |
| new_values    | JSONB        | NULL                           | New values                    |
| changed_by    | UUID         | FOREIGN KEY (users), NULL      | User who made change          |
| changed_at    | TIMESTAMP    | NOT NULL, DEFAULT NOW          | When change occurred          |

#### 5. `users` (For future authentication)
User management table for authentication.

| Column         | Type         | Constraints            | Description                   |
|----------------|--------------|------------------------|-------------------------------|
| id             | UUID         | PRIMARY KEY            | Unique user identifier        |
| username       | VARCHAR(50)  | UNIQUE, NOT NULL       | Username for login            |
| email          | VARCHAR(255) | UNIQUE, NOT NULL       | User email                    |
| password_hash  | VARCHAR(255) | NOT NULL               | Bcrypt password hash          |
| role           | VARCHAR(20)  | NOT NULL, DEFAULT user | admin/user/viewer             |
| created_at     | TIMESTAMP    | NOT NULL, DEFAULT NOW  | Account creation date         |
| last_login     | TIMESTAMP    | NULL                   | Last login timestamp          |

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_inventory_items_warehouse ON inventory_items(warehouse_id);
CREATE INDEX idx_inventory_records_item ON inventory_records(item_id);
CREATE INDEX idx_inventory_records_date ON inventory_records(record_date);
CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id);

-- Composite index for common queries
CREATE INDEX idx_records_item_date ON inventory_records(item_id, record_date DESC);
```

---

## Backend API Design

### Base URL
```
http://localhost:3000/api/v1
or
https://your-domain.com/api/v1
```

### Authentication
- **v2.0**: Optional (open access or simple API key)
- **v2.1+**: JWT-based authentication

### Endpoints

#### Warehouses

**GET /warehouses**
- List all warehouses
- Response: `{ warehouses: Array<Warehouse> }`

**GET /warehouses/:id**
- Get specific warehouse
- Response: `{ warehouse: Warehouse }`

**POST /warehouses**
- Create new warehouse
- Request: `{ name: string, location?: string }`
- Response: `{ warehouse: Warehouse }`

**PUT /warehouses/:id**
- Update warehouse
- Request: `{ name?: string, location?: string }`
- Response: `{ warehouse: Warehouse }`

**DELETE /warehouses/:id**
- Delete warehouse (and all items)
- Response: `{ success: boolean }`

#### Inventory Items

**GET /warehouses/:warehouseId/items**
- List all items in a warehouse
- Query params: `?date=YYYY-MM-DD` (get items with records for specific date)
- Response: `{ items: Array<ItemWithRecord> }`

**GET /items/:id**
- Get specific item
- Response: `{ item: Item }`

**POST /warehouses/:warehouseId/items**
- Create new item
- Request: `{ name: string, classification?: string, unit?: string, note?: string }`
- Response: `{ item: Item }`

**PUT /items/:id**
- Update item details
- Request: `{ name?: string, classification?: string, unit?: string, note?: string }`
- Response: `{ item: Item }`

**DELETE /items/:id**
- Delete item (and all records)
- Response: `{ success: boolean }`

#### Inventory Records

**GET /items/:itemId/records**
- Get all records for an item
- Query params: `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
- Response: `{ records: Array<Record> }`

**GET /records/:id**
- Get specific record
- Response: `{ record: Record }`

**POST /items/:itemId/records**
- Create/update record for specific date
- Request: `{ record_date: string, start_storage: number, in_quantity: number, out_quantity: number }`
- Response: `{ record: Record }`

**PUT /records/:id**
- Update record
- Request: `{ start_storage?: number, in_quantity?: number, out_quantity?: number }`
- Response: `{ record: Record }`

**DELETE /records/:id**
- Delete record
- Response: `{ success: boolean }`

#### Batch Operations

**POST /warehouses/:warehouseId/batch-import**
- Bulk import from Excel
- Request: `{ date: string, items: Array<ItemData> }`
- Response: `{ created: number, updated: number, errors: Array }`

**GET /warehouses/:warehouseId/export**
- Export to Excel format
- Query params: `?date=YYYY-MM-DD`
- Response: Excel file download or JSON data

### Error Responses

Standard error format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

---

## Frontend Changes

### State Management

**Current**: In-memory array
```javascript
let storageData = [];
```

**Proposed**: State management with API integration
```javascript
class InventoryStore {
  constructor() {
    this.currentWarehouse = null;
    this.currentDate = new Date();
    this.items = [];
    this.loading = false;
    this.error = null;
  }
  
  async loadWarehouseData(warehouseId, date) { ... }
  async saveItem(itemData) { ... }
  async deleteItem(itemId) { ... }
  // ... more methods
}
```

### Key Changes

1. **Add API Client**
```javascript
class WarehouseAPI {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }
  
  async getWarehouses() { ... }
  async getWarehouseItems(warehouseId, date) { ... }
  async saveItem(warehouseId, itemData) { ... }
  // ... more methods
}
```

2. **Add Loading States**
- Show loading spinner during API calls
- Disable buttons during operations
- Handle errors gracefully

3. **Add Warehouse Selection**
- Dropdown to select warehouse
- Create new warehouse dialog
- Remember last selected warehouse (localStorage)

4. **Auto-save on Changes**
- Debounce input changes
- Auto-save after 2 seconds of inactivity
- Show save status indicator

5. **Conflict Resolution**
- Handle concurrent edits
- Show "Data changed, reload?" message
- Implement optimistic updates

### Backward Compatibility

Maintain Excel import/export for:
- Data migration from old version
- Offline data entry
- Backup purposes

---

## Implementation Plan

### Phase 1: Backend Setup (Week 1-2)

**Tasks:**
1. Choose and set up backend framework (Node.js + Express recommended)
2. Set up database (PostgreSQL recommended)
3. Create database schema and migrations
4. Implement basic CRUD API endpoints
5. Add input validation and error handling
6. Write API documentation
7. Set up development database seeding

**Deliverables:**
- Working backend API
- API documentation
- Database migrations
- Postman/Thunder Client collection for testing

### Phase 2: Frontend Integration (Week 2-3)

**Tasks:**
1. Create API client module
2. Add state management
3. Update UI for warehouse selection
4. Implement loading states and error handling
5. Add auto-save functionality
6. Update Excel import/export to work with API
7. Add offline detection and queue

**Deliverables:**
- Updated frontend code
- Working data persistence
- Seamless user experience

### Phase 3: Testing & Polish (Week 3-4)

**Tasks:**
1. Write unit tests for backend
2. Write integration tests for API
3. Add frontend tests for critical paths
4. Performance testing (load 1000+ items)
5. Security audit
6. User acceptance testing
7. Bug fixes and polish

**Deliverables:**
- Test suite with >80% coverage
- Performance benchmarks
- Security audit report
- Bug-free release candidate

### Phase 4: Deployment (Week 4)

**Tasks:**
1. Set up production database
2. Configure production backend server
3. Set up environment variables
4. Deploy backend to hosting service
5. Update frontend to use production API
6. Set up monitoring and logging
7. Create user migration guide

**Deliverables:**
- Production deployment
- Monitoring dashboard
- User documentation
- Migration guide

---

## Technology Stack Options

### Backend Framework

**Option 1: Node.js + Express** (Recommended)
- **Pros**: JavaScript consistency, large ecosystem, fast development
- **Cons**: Callback hell if not careful
- **Best for**: Small to medium deployments

**Option 2: Python + FastAPI**
- **Pros**: Clean syntax, automatic API docs, type safety
- **Cons**: Different language from frontend
- **Best for**: Teams familiar with Python

**Option 3: Go + Gin/Fiber**
- **Pros**: High performance, compiled binary, built-in concurrency
- **Cons**: Steeper learning curve, smaller ecosystem
- **Best for**: High-performance requirements

### Database

**Option 1: PostgreSQL** (Recommended)
- **Pros**: Feature-rich, JSONB support, excellent performance
- **Cons**: More complex setup than SQLite
- **Best for**: Production deployments

**Option 2: MySQL/MariaDB**
- **Pros**: Widely used, good performance, familiar
- **Cons**: Less advanced features than PostgreSQL
- **Best for**: Shared hosting environments

**Option 3: SQLite**
- **Pros**: Zero configuration, file-based, perfect for development
- **Cons**: Limited concurrency, not for production at scale
- **Best for**: Development/testing only

### ORM/Query Builder

**Option 1: Prisma** (Recommended for Node.js)
- **Pros**: Type-safe, excellent developer experience, migrations
- **Cons**: Relatively new
- **Best for**: TypeScript projects

**Option 2: Sequelize**
- **Pros**: Mature, feature-rich, good documentation
- **Cons**: Verbose, callback-based
- **Best for**: Traditional Node.js projects

**Option 3: Knex.js**
- **Pros**: Lightweight, SQL-like syntax, great migrations
- **Cons**: No ORM features, manual mapping
- **Best for**: Teams that prefer SQL control

---

## Security Considerations

### v2.0 Security (Minimum)

1. **Input Validation**
   - Validate all inputs on backend
   - Sanitize user input to prevent XSS
   - Use parameterized queries to prevent SQL injection

2. **CORS Configuration**
   - Restrict CORS to known frontend origins
   - Don't use wildcard (`*`) in production

3. **Rate Limiting**
   - Limit API requests per IP/user
   - Prevent DoS attacks

4. **Environment Variables**
   - Store sensitive config in environment variables
   - Never commit secrets to git

5. **HTTPS**
   - Use HTTPS in production
   - Redirect HTTP to HTTPS

### v2.1+ Security (Enhanced)

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (admin/user/viewer)
   - Password hashing with bcrypt
   - Session management

2. **Audit Logging**
   - Log all data modifications
   - Track user actions
   - Regular audit reviews

3. **Data Encryption**
   - Encrypt sensitive data at rest
   - Use TLS 1.3 for data in transit

4. **Backup & Recovery**
   - Automated daily backups
   - Point-in-time recovery
   - Disaster recovery plan

---

## Testing Strategy

### Backend Tests

1. **Unit Tests**
   - Test individual functions
   - Mock database calls
   - Target: >80% code coverage

2. **Integration Tests**
   - Test API endpoints
   - Use test database
   - Test error handling

3. **Load Tests**
   - Simulate 100+ concurrent users
   - Test with 10,000+ items
   - Measure response times

### Frontend Tests

1. **Unit Tests**
   - Test utility functions
   - Test calculation logic
   - Mock API calls

2. **Integration Tests**
   - Test user workflows
   - Test API integration
   - Test error handling

3. **E2E Tests**
   - Full user journey tests
   - Test critical paths
   - Use Playwright or Cypress

### Testing Tools

- **Backend**: Jest, Mocha, Supertest
- **Frontend**: Jest, Vitest, Testing Library
- **E2E**: Playwright, Cypress
- **Load**: k6, Apache JMeter

---

## Deployment Considerations

### Hosting Options

**Option 1: Cloud Platforms** (Recommended for ease)
- **Heroku**: Easy deployment, free tier available
- **Railway**: Modern, developer-friendly
- **Render**: Free tier, good performance
- **Vercel/Netlify** (frontend) + **Railway** (backend)

**Option 2: VPS Providers** (Recommended for control)
- **DigitalOcean**: Affordable, reliable
- **Linode**: Good performance, competitive pricing
- **Vultr**: Global locations, good specs

**Option 3: Self-Hosted**
- **Docker Compose**: Easy local deployment
- **Kubernetes**: For advanced scaling needs

### Recommended Architecture

```
┌─────────────────┐
│   Cloudflare    │ ← CDN + DDoS Protection
└────────┬────────┘
         │
┌────────▼────────┐
│    Frontend     │ ← Static hosting (Vercel/Netlify)
│   (HTML/CSS/JS) │
└────────┬────────┘
         │ HTTPS
┌────────▼────────┐
│   Backend API   │ ← Node.js/Express (Railway/Heroku)
│   (Express.js)  │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │ ← Managed database (Railway/Heroku)
└─────────────────┘
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
DATABASE_POOL_SIZE=10

# Server
PORT=3000
NODE_ENV=production
API_BASE_URL=https://api.your-domain.com

# Security
JWT_SECRET=your-secret-key
SESSION_SECRET=another-secret-key
CORS_ORIGIN=https://your-frontend-domain.com

# Optional
LOG_LEVEL=info
RATE_LIMIT_MAX=100
```

---

## Migration Path

### From Current (v1.0) to Database Version (v2.0)

#### Migration Steps for Users

1. **Export Current Data**
   - Click "Export Excel" to save current data
   - Save the Excel file as backup

2. **Upgrade to v2.0**
   - Update to new version
   - First time: Create warehouse
   - Select warehouse and date

3. **Import Existing Data**
   - Click "Import Excel"
   - Select previously exported file
   - Data is now persisted in database

4. **Verify Data**
   - Check all items are present
   - Verify calculations are correct
   - Test adding new items

#### Data Migration Script

For administrators moving multiple files:

```javascript
// migrate_to_db.js
const XLSX = require('xlsx');
const { createWarehouse, importItems } = require('./api-client');

async function migrateExcelToDatabase(filePath, warehouseName) {
  // Read Excel file
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  // Create warehouse
  const warehouse = await createWarehouse(warehouseName);
  
  // Import items
  await importItems(warehouse.id, data);
  
  console.log(`Migrated ${data.length} items to warehouse: ${warehouseName}`);
}

// Usage
migrateExcelToDatabase('./backup-jan-2026.xlsx', 'Main Warehouse');
```

---

## Success Metrics

### Technical Metrics
- API response time < 200ms (95th percentile)
- Database query time < 50ms (95th percentile)
- Uptime > 99.5%
- Data loss incidents: 0

### User Metrics
- User adoption rate > 80%
- Data entry time reduced by 30%
- User satisfaction score > 4.0/5.0
- Support tickets related to data loss: 0

### Business Metrics
- Reduced manual data reconciliation time
- Improved data accuracy
- Multi-user collaboration enabled
- Foundation for future features

---

## Risks and Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Database performance issues | High | Medium | Proper indexing, query optimization, caching |
| Data migration failures | High | Low | Thorough testing, rollback plan, backups |
| API downtime | High | Low | Monitoring, redundancy, quick rollback |
| Security vulnerabilities | High | Medium | Security audit, regular updates, input validation |

### Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| User resistance to change | Medium | Medium | Clear documentation, training, gradual rollout |
| Increased hosting costs | Low | High | Choose scalable pricing, optimize resource usage |
| Vendor lock-in | Medium | Low | Use open standards, document architecture |

---

## Next Steps

### Immediate Actions (Before Starting Development)

1. ✅ **Review this specification** with stakeholders
2. ⬜ **Choose technology stack** (Node.js + PostgreSQL recommended)
3. ⬜ **Set up development environment**
4. ⬜ **Create project repository** for backend
5. ⬜ **Set up project management** (GitHub Issues/Projects)

### Decision Points

Before proceeding, decide on:

- [ ] Backend framework (Node.js/Python/Go)
- [ ] Database (PostgreSQL/MySQL/SQLite for dev)
- [ ] Hosting provider (Heroku/Railway/DigitalOcean)
- [ ] Authentication approach (v2.0 or v2.1)
- [ ] Timeline and resource allocation

### Questions to Answer

1. Who will be the primary developer(s)?
2. What is the target launch date?
3. What is the budget for hosting?
4. Should authentication be in v2.0 or deferred to v2.1?
5. Do we need offline support in v2.0?

---

## Appendix

### A. Sample API Request/Response

**Create Item:**
```bash
POST /api/v1/warehouses/550e8400-e29b-41d4-a716-446655440000/items
Content-Type: application/json

{
  "name": "Electric Drill",
  "classification": "Tool",
  "unit": "pcs",
  "note": "Bosch model"
}
```

Response:
```json
{
  "item": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "warehouse_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Electric Drill",
    "classification": "Tool",
    "unit": "pcs",
    "note": "Bosch model",
    "created_at": "2026-01-24T08:00:00Z",
    "updated_at": "2026-01-24T08:00:00Z"
  }
}
```

### B. Database Migration Scripts

See separate `migrations/` folder for SQL migration scripts.

### C. References

- [REST API Best Practices](https://restfulapi.net/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Authentication](https://jwt.io/introduction)

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-24  
**Author:** Development Team  
**Status:** Draft - Pending Review
