# Frontend-Backend Integration Test Guide

## Prerequisites

1. **Backend Server Running**: Make sure the FastAPI backend is running on `http://localhost:8000`
2. **Database Initialized**: Run `python init_db.py` in the backend directory
3. **Sample Data**: Optionally run `python seed_data.py` for test data

## Testing Steps

### 1. Start the Backend
```bash
cd backend
python main.py
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test the Integration

#### A. Check API Connection
- Open browser to `http://localhost:3000`
- Check browser console for any API connection errors
- Verify that data loads from the backend instead of localStorage

#### B. Test CRUD Operations

**Agents:**
1. Click "New Agent" button
2. Fill out agent form and save
3. Verify agent appears in the grid
4. Edit an existing agent
5. Delete an agent

**Tools:**
1. Click "New Tool" button
2. Create a tool with function schema
3. Verify tool appears in the grid
4. Edit tool configuration
5. Delete a tool

**API Keys:**
1. Click to add a new API key
2. Fill out API key form
3. Verify API key is saved
4. Edit API key details
5. Delete an API key

**Custom GPTs:**
1. Click "New Custom GPT" button
2. Configure a custom GPT
3. Verify it appears in the table
4. Edit custom GPT settings
5. Delete a custom GPT

#### C. Test Error Handling
1. Stop the backend server
2. Try to perform operations in the frontend
3. Verify error messages appear
4. Restart backend and test retry functionality

#### D. Test Loading States
1. Check that loading indicators appear during API calls
2. Verify that UI is disabled during operations
3. Test that data refreshes after operations

## Expected Behavior

### ✅ Success Indicators
- Data loads from backend API instead of localStorage
- CRUD operations work seamlessly
- Loading states are shown during API calls
- Error messages appear when backend is unavailable
- Retry functionality works
- Data persists between page refreshes
- All components work with the new API-based data store

### ❌ Failure Indicators
- Data still loads from localStorage
- API calls fail with CORS errors
- No loading states shown
- No error handling for failed requests
- Data doesn't persist between refreshes
- Components crash with undefined data

## Troubleshooting

### CORS Issues
If you see CORS errors, check that:
- Backend is running on `http://localhost:8000`
- Frontend is running on `http://localhost:3000`
- Backend CORS settings include the frontend URL

### API Connection Issues
- Verify backend is running: `curl http://localhost:8000/health`
- Check browser network tab for failed requests
- Verify API URL in frontend config

### Database Issues
- Ensure PostgreSQL is running
- Check database connection in backend logs
- Run `python init_db.py` to create tables

## API Endpoints to Test

Test these endpoints directly to verify backend functionality:

```bash
# Health check
curl http://localhost:8000/health

# Get all agents
curl http://localhost:8000/api/v1/agents/

# Get all tools
curl http://localhost:8000/api/v1/tools/

# Get all API keys
curl http://localhost:8000/api/v1/api-keys/

# Get all custom GPTs
curl http://localhost:8000/api/v1/custom-gpts/
```

## Success Criteria

The integration is successful when:
1. ✅ All data loads from the backend API
2. ✅ CRUD operations work for all entities
3. ✅ Loading and error states are properly handled
4. ✅ Data persists between page refreshes
5. ✅ No localStorage usage for main data
6. ✅ All components work seamlessly with the new API
