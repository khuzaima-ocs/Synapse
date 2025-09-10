import json
from types import SimpleNamespace


import requests


def snake_to_pascal_case(snake_str):
    """Convert snake_case to PascalCase"""
    # Split by underscore and capitalize each word
    components = snake_str.split('_')
    return ''.join(word.capitalize() for word in components)


def call_external_tool(base_url: str, tool_name: str, tool_args: dict):
    """Call external tool service via HTTP request"""
    if not base_url:
        raise ValueError("Base URL is not configured for this tool")
    
    # Convert tool name to PascalCase
    endpoint_name = snake_to_pascal_case(tool_name)
    
    # Remove trailing slash from base_url if present
    base_url = base_url.rstrip('/')
    
    # Construct the full URL
    url = f"{base_url}/{endpoint_name}"

    print(f"Calling external tool {url} with arguments {tool_args}")
    
    try:
        # Make POST request with tool arguments
        response = requests.post(url, json=tool_args, timeout=30)
        response.raise_for_status()
        
        # Return the JSON response
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to call external tool {tool_name} at {url}: {str(e)}")


# -------------------------
# Tool definitions (schemas)
# -------------------------
tool_a_schema = {
    "type": "function",
    "function": {
        "name": "tool_a",
        "description": "Multiply two numbers",
        "parameters": {
            "type": "object",
            "properties": {
                "x": {"type": "number", "description": "First number"},
                "y": {"type": "number", "description": "Second number"}
            },
            "required": ["x", "y"]
        }
    }
}

tool_b_schema = {
    "type": "function",
    "function": {
        "name": "tool_b",
        "description": "Convert a number to a string with a prefix",
        "parameters": {
            "type": "object",
            "properties": {
                "number": {"type": "number"},
                "prefix": {"type": "string"}
            },
            "required": ["number", "prefix"]
        }
    }
}

# Fake msg that looks like OpenAI's tool call response
msg = SimpleNamespace(
    role="assistant",
    content=None,
    tool_calls=[
        SimpleNamespace(
            id="call_123",
            type="function",
            function=SimpleNamespace(
                name="tool_a",
                arguments=json.dumps({"x": 5, "y": 3})
            )
        ),
        SimpleNamespace(
            id="call_456",
            type="function",
            function=SimpleNamespace(
                name="tool_b",
                arguments=json.dumps({"number": 15, "prefix": "Value: "})
            )
        )
    ]
)


messages_history = []
tools = [tool_a_schema, tool_b_schema]  # from earlier code
retry_count = {}

for tool_call in msg.tool_calls:
    tool_name = tool_call.function.name
    tool_args = json.loads(tool_call.function.arguments or "{}")
    tool_id = tool_call.id

    print(f"Tool call ({tool_id}): {tool_name}({tool_args})")

    retry_count.setdefault(tool_id, 0)

    try:
        # Get base URL for this tool
        base_url = "http://localhost:8000"
        
        # Call external tool service
        result = call_external_tool(base_url, tool_name, tool_args)

        messages_history.append(msg)
        messages_history.append({
            "role": "tool",
            "tool_call_id": tool_id,
            "content": json.dumps(result)
        })

    except Exception as e:
        print(f"❌ Error running {tool_name}: {e}")
