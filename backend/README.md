# Synapse Backend API

FastAPI backend for the Synapse AI Platform with PostgreSQL database integration.

## Features

- **Agents**: AI agent management with configuration, tools, and behavior settings
- **Tools**: Function/API tools that can be assigned to agents
- **API Keys**: API key management for different providers (OpenAI, Azure, etc.)
- **Custom GPTs**: Custom GPT applications with appearance and behavior settings
- **CRUD Operations**: Full Create, Read, Update, Delete operations for all entities
- **PostgreSQL Integration**: Robust database storage with SQLAlchemy ORM
 - **Users & Auth**: JWT-based authentication, per-user data scoping (agents, tools, API keys, custom GPTs, messages)

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Environment

Copy the example environment file and configure your database:

```bash
cp env.example .env
```

Edit `.env` with your PostgreSQL connection details:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/synapse_db
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
```

### 3. Initialize Database

```bash
python init_db.py
```

### 4. Start the Server

```bash
python start.py
```

The API will be available at `http://localhost:8000`

### Auth Flow

1. Register a user

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Me","email":"me@example.com","password":"secret","display_image":"/me.png"}'
```

2. Login to get a token

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"secret"}'
```

3. Use the token

```bash
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/agents
```

## API Documentation

Once the server is running, you can access:

- **Interactive API Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

## API Endpoints
### Auth
- `POST /api/v1/auth/register` - Create a new user
- `POST /api/v1/auth/login` - Login and receive JWT

### Agents
- `GET /api/v1/agents/` - List your agents
- `POST /api/v1/agents/` - Create new agent
- `GET /api/v1/agents/{agent_id}` - Get agent by ID
- `PUT /api/v1/agents/{agent_id}` - Update agent
- `DELETE /api/v1/agents/{agent_id}` - Delete agent

### Tools
- `GET /api/v1/tools/` - List your tools
- `POST /api/v1/tools/` - Create new tool
- `GET /api/v1/tools/{tool_id}` - Get tool by ID
- `PUT /api/v1/tools/{tool_id}` - Update tool
- `DELETE /api/v1/tools/{tool_id}` - Delete tool
- `POST /api/v1/tools/{tool_id}/assign/{agent_id}` - Assign tool to agent
- `DELETE /api/v1/tools/{tool_id}/unassign/{agent_id}` - Unassign tool from agent

### API Keys
- `GET /api/v1/api-keys/` - List your API keys
- `POST /api/v1/api-keys/` - Create new API key
- `GET /api/v1/api-keys/{api_key_id}` - Get API key by ID
- `PUT /api/v1/api-keys/{api_key_id}` - Update API key
- `DELETE /api/v1/api-keys/{api_key_id}` - Delete API key

### Custom GPTs
- `GET /api/v1/custom-gpts/` - List your custom GPTs
- `POST /api/v1/custom-gpts/` - Create new custom GPT
- `GET /api/v1/custom-gpts/{custom_gpt_id}` - Get custom GPT by ID
- `PUT /api/v1/custom-gpts/{custom_gpt_id}` - Update custom GPT
- `DELETE /api/v1/custom-gpts/{custom_gpt_id}` - Delete custom GPT

## Database Schema

The application uses the following main entities:

- **agents**: AI agents with configuration and behavior settings
- **tools**: Function/API tools with schemas and assignments
- **api_keys**: API keys for different providers
- **custom_gpts**: Custom GPT applications with themes and settings
- **agent_tool_association**: Many-to-many relationship between agents and tools
- **users**: Registered users with name, email, password hash, display image
- All above entities include `user_id` referencing `users.id` (except associations)

## Testing

### Run API Tests

```bash
python test_api.py
```

This will test all CRUD operations and verify the API is working correctly.

### Using Docker

#### Quick Start with Docker Compose

```bash
docker-compose up -d
```

This will start both PostgreSQL and the API server.

#### Manual Docker Build

```bash
# Build the image
docker build -t synapse-api .

# Run with PostgreSQL
docker run -p 8000:8000 --env-file .env synapse-api
```

## Development

### Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       └── api.py
│   ├── crud/
│   ├── models/
│   ├── schemas/
│   ├── config.py
│   ├── database.py
│   └── main.py
├── requirements.txt
├── init_db.py
├── start.py
├── test_api.py
├── seed_data.py
├── migrate.py
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Adding New Features

1. Create model in `app/models/`
2. Create schema in `app/schemas/`
3. Create CRUD operations in `app/crud/`
4. Create API endpoints in `app/api/v1/endpoints/`
5. Add routes to `app/api/v1/api.py`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Secret key for the application
- `ENVIRONMENT`: Environment (development/production)

## Notes / Migrations

- New tables/columns introduced: `users` and `user_id` on agents/tools/api_keys/custom_gpts/messages.
- If you had pre-existing data, recreate tables or run a migration.

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:3001`
- `http://127.0.0.1:3001`

You can modify the `ALLOWED_ORIGINS` in `app/config.py` to add more origins.
