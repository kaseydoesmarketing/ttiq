# TitleIQ Admin Dashboard v2 - API Contracts

**VERSION:** 1.0.0
**AUTHORITY:** BOSS PRIME
**DATE:** 2025-10-28
**STATUS:** LOCKED FOR IMPLEMENTATION

---

## AUTHENTICATION

All `/api/admin/*` endpoints require:
- `Authorization: Bearer <JWT_TOKEN>` header
- Token must belong to user with `role='admin'`
- Returns `401` if missing/invalid token
- Returns `403` if user is not admin

---

## ENDPOINT SPECIFICATIONS

### 1. GET /api/admin/stats/overview

**Purpose:** Primary dashboard metrics
**Auth:** Admin only
**Method:** GET
**Query Params:** None

**Response (200 OK):**
```json
{
  "success": true,
  "overview": {
    "totalUsers": 1234,
    "activeNow": 27,
    "totalTitleGenerations": 45678,
    "titleGenerations24h": 982
  },
  "performance": {
    "requestsTotal24h": 10234,
    "avgResponseMs": 183,
    "errorRatePct": 0.7
  },
  "system": {
    "api": "green",
    "db": "green",
    "refreshedAt": "2025-10-28T12:34:56.789Z"
  }
}
```

**Field Definitions:**
- `overview.totalUsers`: COUNT(*) FROM users
- `overview.activeNow`: COUNT(DISTINCT user_id) FROM sessions WHERE last_seen_at >= now() - 5min
- `overview.totalTitleGenerations`: SUM(titles_generated) FROM usage_counters
- `overview.titleGenerations24h`: SUM(titles_generated) FROM usage_counters WHERE updated_at >= now() - 24h
- `performance.requestsTotal24h`: COUNT(*) FROM request_metrics WHERE ts >= now() - 24h
- `performance.avgResponseMs`: AVG(duration_ms) FROM request_metrics WHERE ts >= now() - 24h
- `performance.errorRatePct`: (COUNT where status >= 400) / COUNT(*) * 100
- `system.api`: "green" | "yellow" | "red" (health check status)
- `system.db`: "green" | "yellow" | "red" (DB connection status)
- `system.refreshedAt`: ISO 8601 timestamp

---

### 2. GET /api/admin/live

**Purpose:** Real-time telemetry stream (SSE)
**Auth:** Admin only
**Method:** GET
**Headers:** `Accept: text/event-stream`

**Event Types:**

**a) active_users** (every 5s)
```
event: active_users
data: {"count": 27, "timestamp": "2025-10-28T12:34:56.789Z"}
```

**b) performance_tick** (every 10s)
```
event: performance_tick
data: {"avgResponseMs": 183, "errorRatePct": 0.7, "timestamp": "2025-10-28T12:34:56.789Z"}
```

**c) system_status** (every 30s)
```
event: system_status
data: {"api": "green", "db": "green", "timestamp": "2025-10-28T12:34:56.789Z"}
```

**Heartbeat** (every 10s to keep connection alive):
```
: heartbeat
```

---

### 3. POST /api/admin/grants

**Purpose:** Grant "Pro — Lifetime" entitlement to user
**Auth:** Admin only
**Method:** POST

**Request Body:**
```json
{
  "user_id": "user_1761610047445_18c191940e560615",
  "label": "Pro — Lifetime",
  "source": "beta_comp",
  "notes": "Founding tester wave A"
}
```

**Validation:**
- `user_id`: required, must exist in users table
- `label`: required, string, max 100 chars
- `source`: required, enum ["beta_comp", "manual_override", "partner_referral"]
- `notes`: optional, string, max 500 chars

**Response (200 OK):**
```json
{
  "success": true,
  "grant_id": 456,
  "user_id": "user_1761610047445_18c191940e560615",
  "label": "Pro — Lifetime",
  "active": true,
  "created_at": "2025-10-28T12:34:56.789Z"
}
```

**Error Responses:**
- `400` if validation fails
- `404` if user_id not found
- `409` if active grant already exists for this user

---

### 4. DELETE /api/admin/grants/:id

**Purpose:** Revoke an entitlement grant
**Auth:** Admin only
**Method:** DELETE
**Params:** `id` (grant ID from entitlements table)

**Response (200 OK):**
```json
{
  "success": true,
  "grant_id": 456,
  "revoked_at": "2025-10-28T12:34:56.789Z"
}
```

**Error Responses:**
- `404` if grant ID not found
- `400` if grant already revoked

**Note:** This sets `revoked_at = datetime('now')`, does NOT delete the row (audit trail)

---

### 5. GET /api/admin/grants

**Purpose:** List all grants (with optional filters)
**Auth:** Admin only
**Method:** GET

**Query Params:**
- `user_id` (optional): Filter by specific user
- `active` (optional): "true" | "false" (filter by revoked_at IS NULL)

**Response (200 OK):**
```json
{
  "success": true,
  "grants": [
    {
      "id": 456,
      "user_id": "user_1761610047445_18c191940e560615",
      "email": "test@example.com",
      "label": "Pro — Lifetime",
      "source": "beta_comp",
      "notes": "Founding tester wave A",
      "active": true,
      "granted_by": "admin_1761608522301_wp65oqnwi",
      "granted_by_email": "kasey@tightslice.com",
      "created_at": "2025-10-28T12:34:56.789Z",
      "revoked_at": null
    }
  ]
}
```

---

### 6. GET /api/admin/llm-usage

**Purpose:** LLM usage analytics by user and model
**Auth:** Admin only
**Method:** GET

**Query Params:**
- `from` (optional): YYYY-MM-DD format (default: 30 days ago)
- `to` (optional): YYYY-MM-DD format (default: today)
- `model` (optional): Filter by specific model (e.g., "gpt-4o", "sonnet-4.5")

**Response (200 OK):**
```json
{
  "success": true,
  "totals": {
    "requests": 8421,
    "users": 137
  },
  "by_user": [
    {
      "user_id": "user_1761610047445_18c191940e560615",
      "email": "test@example.com",
      "model": "gpt-4o",
      "count": 120,
      "last_used_at": "2025-10-28T12:34:56.789Z"
    },
    {
      "user_id": "user_1761610047445_18c191940e560615",
      "email": "test@example.com",
      "model": "sonnet-4.5",
      "count": 45,
      "last_used_at": "2025-10-27T08:12:34.567Z"
    }
  ],
  "sparkline": {
    "dates": ["2025-09-29", "2025-09-30", "2025-10-01", "...", "2025-10-28"],
    "values": [14, 27, 33, 42, 51, "...", 92]
  }
}
```

**Field Definitions:**
- `totals.requests`: Total LLM requests in date range
- `totals.users`: Distinct users who made requests
- `by_user[]`: Per-user, per-model breakdown
- `sparkline.dates[]`: Array of dates (YYYY-MM-DD)
- `sparkline.values[]`: Array of request counts per date

---

### 7. GET /api/admin/users/active

**Purpose:** Recently active users list
**Auth:** Admin only
**Method:** GET

**Query Params:**
- `limit` (optional): Max results (default: 50, max: 200)

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "user_id": "user_1761610047445_18c191940e560615",
      "email": "test@example.com",
      "plan": "trial",
      "status": "active",
      "last_seen_at": "2025-10-28T12:34:56.789Z",
      "titles_generated_today": 12,
      "models_used": [
        {"model": "gpt-4o", "count": 8},
        {"model": "sonnet-4.5", "count": 4}
      ],
      "has_grant": true
    }
  ]
}
```

---

### 8. GET /api/health

**Purpose:** System health check (public endpoint, no auth)
**Method:** GET

**Response (200 OK):**
```json
{
  "ok": true
}
```

---

## DATABASE SCHEMAS

### entitlements

```sql
CREATE TABLE IF NOT EXISTS entitlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL,
  source TEXT NOT NULL,
  granted_by TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at TEXT DEFAULT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_active ON entitlements(user_id, revoked_at);
```

### llm_usage

```sql
CREATE TABLE IF NOT EXISTS llm_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  model TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  last_used_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_llm_usage_user_model ON llm_usage(user_id, model);
```

### request_metrics

```sql
CREATE TABLE IF NOT EXISTS request_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  status_code INTEGER NOT NULL,
  route TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reqmetrics_ts ON request_metrics(ts);
```

### daily_usage (optional, for aggregated rollups)

```sql
CREATE TABLE IF NOT EXISTS daily_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  model TEXT NOT NULL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  UNIQUE(date, model)
);
```

---

## MIDDLEWARE LOGIC

### Entitlements Resolution

On every authenticated request, resolve `req.user.effectivePlan`:

```javascript
function resolveEntitlement(userId) {
  const grant = db.prepare(`
    SELECT * FROM entitlements
    WHERE user_id = ? AND revoked_at IS NULL
    LIMIT 1
  `).get(userId);

  if (grant) {
    return {
      plan: 'PRO_LIFETIME',
      source: grant.source,
      grantId: grant.id
    };
  }

  // Fallback to user's normal plan
  const user = db.prepare(`SELECT plan FROM users WHERE id = ?`).get(userId);
  return {
    plan: user.plan.toUpperCase(),
    source: 'billing'
  };
}
```

This runs on EVERY request (or cached per-session).

---

## ERROR RESPONSES

All error responses follow this shape:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

**HTTP Status Codes:**
- `200` Success
- `400` Bad Request (validation failed)
- `401` Unauthorized (missing/invalid token)
- `403` Forbidden (not admin)
- `404` Not Found (resource doesn't exist)
- `409` Conflict (duplicate resource)
- `500` Internal Server Error

---

## FEATURE FLAGS

All SSE/realtime logic respects:
```
REALTIME_MODE=sse|ws|polling
```

All gamification effects respect:
```
GAMIFICATION=on|off
```

---

**STATUS:** LOCKED — Ready for backend implementation
**NEXT PHASE:** Backend (Phase 3)
