# Intelligence Query Engine

Queryable Intelligence Engine for demographic profile data built with Node.js, Express, TypeScript, Mongoose, and MongoDB.

## What this API does

This service stores demographic profiles and exposes query endpoints for filtering, sorting, pagination, and basic natural-language search.

It is designed for clients that need to:

- filter profile data by multiple conditions
- sort results by a supported field
- paginate large result sets efficiently
- search using simple English phrases like `young males from nigeria`

## Tech Stack

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- CORS

## Features

### Profile storage

Each profile follows this shape:

- `id` - UUID v7 primary identifier
- `name` - unique full name
- `gender` - `male` or `female`
- `gender_probability` - confidence score
- `age` - exact age
- `age_group` - `child`, `teenager`, `adult`, or `senior`
- `country_id` - 2-letter ISO code
- `country_name` - full country name
- `country_probability` - confidence score
- `created_at` - auto-generated timestamp

### Advanced filtering

`GET /api/profiles`

Supported query parameters:

- `gender`
- `age_group`
- `country_id`
- `min_age`
- `max_age`
- `min_gender_probability`
- `min_country_probability`

Filters can be combined and all provided conditions must match.

Example:

```http
GET /api/profiles?gender=male&country_id=NG&min_age=25
```

### Sorting

Supported query parameters:

- `sort_by` - `age`, `created_at`, or `gender_probability`
- `order` - `asc` or `desc`

Example:

```http
GET /api/profiles?sort_by=age&order=desc
```

### Pagination

Supported query parameters:

- `page` - default `1`
- `limit` - default `10`, maximum `50`

Pagination is returned in the response together with the total number of matching records.

Response format:

```json
{
	"status": "success",
	"page": 1,
	"limit": 10,
	"total": 2026,
	"data": []
}
```

### Natural language search

`GET /api/profiles/search`

This endpoint parses simple English queries and converts them into database filters.

Examples:

- `young males` → `gender=male` + `min_age=16` + `max_age=24`
- `females above 30` → `gender=female` + `min_age=30`
- `people from angola` → `country_id=AO`
- `adult males from kenya` → `gender=male` + `age_group=adult` + `country_id=KE`
- `male and female teenagers above 17` → `age_group=teenager` + `min_age=17`

Rules:

- parsing is rule-based only
- no AI or LLMs are used
- `young` means ages `16` to `24`
- unsupported queries return:

```json
{
	"status": "error",
	"message": "Unable to interpret query"
}
```

### Error handling

All errors use the same response shape:

```json
{
	"status": "error",
	"message": "<error message>"
}
```

Common cases:

- `400` - missing or empty parameter
- `422` - invalid parameter type or invalid query values
- `404` - profile not found
- `500` / `502` - server failure

## API Endpoints

### `GET /`

Returns a simple API welcome message.

### `GET /health`

Returns service health status.

### `GET /api/profiles`

Returns profiles using filtering, sorting, and pagination.

### `GET /api/profiles/search`

Returns profiles by parsing a natural-language query.

## Data Seeding

The project includes a seed script that loads the profile dataset from `seed_profiles.json`.

The seed script is idempotent, so running it again will not create duplicate records.

Run:

```bash
npm run seed
```

## Project Structure

- `src/app.ts` - Express app setup and route mounting
- `src/server.ts` - application bootstrap and MongoDB connection
- `src/config/db.ts` - MongoDB connection logic
- `src/models/profile.model.ts` - profile schema and indexes
- `src/controllers/profile.controller.ts` - filtering, sorting, pagination
- `src/controllers/search.controller.ts` - natural-language search parser
- `src/routes/profile.routes.ts` - profile routes
- `src/script/seed.ts` - database seeding script

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
MONGODB_URL=your_mongodb_connection_string
PORT=3000
```

### 3. Seed the database

```bash
npm run seed
```

### 4. Start the API in development

```bash
npm run dev
```

## Notes

- CORS is enabled for all origins.
- Timestamps are stored as UTC dates in MongoDB and returned as ISO-compatible values.
- IDs are generated as UUID v7 during seeding.
- Filtering happens at the database level, not in memory.

## Example Requests

```http
GET /api/profiles?gender=female&country_id=NG&sort_by=age&order=asc&page=1&limit=10
```

```http
GET /api/profiles/search?q=young males from nigeria&page=1&limit=10
```


