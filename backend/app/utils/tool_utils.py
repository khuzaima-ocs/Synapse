import requests


def snake_to_pascal_case(snake_str):
    """Convert snake_case to PascalCase"""
    # Split by underscore and capitalize each word
    components = snake_str.split('_')
    return ''.join(word.capitalize() for word in components)


def call_external_tool(base_url: str, tool_name: str, tool_args: dict, secret_code: str | None = None):
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
        # Prepare headers, optionally include Authorization Bearer
        headers = {}
        if secret_code:
            headers["Authorization"] = f"Bearer {secret_code}"
        
        # Make POST request with tool arguments
        response = requests.post(url, json=tool_args, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Return the JSON response
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to call external tool {tool_name} at {url}: {str(e)}")
