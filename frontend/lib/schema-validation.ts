import { z } from "zod"
import type { FunctionSchema } from "@/lib/types"

// Zod schema for validating OpenAI function schemas
const functionParameterSchema = z.object({
  type: z.enum(["string", "number", "integer", "boolean", "array", "object"]),
  description: z.string().optional(),
  enum: z.array(z.string()).optional(),
  default: z.any().optional(),
  items: z.object({
    type: z.enum(["string", "number", "integer", "boolean", "object"]),
  }).optional(),
  properties: z.record(z.any()).optional(),
  required: z.array(z.string()).optional(),
})

const functionSchemaValidator = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string()
      .min(1, "Function name is required")
      .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, "Function name must be a valid identifier"),
    description: z.string()
      .min(1, "Function description is required")
      .max(1000, "Description must be less than 1000 characters"),
    parameters: z.object({
      type: z.literal("object"),
      properties: z.record(functionParameterSchema),
      required: z.array(z.string()).default([]),
    }),
  }),
})

// Validator for tools array format (multiple function schemas)
const toolsArrayValidator = z.object({
  tools: z.array(functionSchemaValidator).min(1, "At least one tool is required"),
})

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Helper function to validate just the parameter properties (not the entire schema)
function validateParameterProperties(properties: Record<string, any>): { errors: string[], warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  
  for (const [propName, propSchema] of Object.entries(properties)) {
    try {
      // This is the key: we only validate individual parameter properties here
      functionParameterSchema.parse(propSchema)
      
      const prop = propSchema as any
      
      // Check for common issues
      if (prop.type === "array" && !prop.items) {
        warnings.push(`Property "${propName}" is an array but missing "items" specification`)
      }
      
      if (!prop.description) {
        warnings.push(`Property "${propName}" is missing a description`)
      }
      
      // Validate enum values
      if (prop.enum && (!Array.isArray(prop.enum) || prop.enum.length === 0)) {
        errors.push(`Property "${propName}" enum must be a non-empty array`)
      }
    } catch (paramError) {
      if (paramError instanceof z.ZodError) {
        errors.push(`Property "${propName}": ${paramError.issues.map(issue => issue.message).join(', ')}`)
      } else {
        errors.push(`Property "${propName}": Invalid parameter schema`)
      }
    }
  }
  
  return { errors, warnings }
}

export function validateFunctionSchema(schema: any): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
  }

  try {
    // Check if this is a tools array format or single function schema
    if (schema.tools && Array.isArray(schema.tools)) {
      // Handle tools array format
      const validatedToolsSchema = toolsArrayValidator.parse(schema)
      
      // Validate each tool in the array
      for (let i = 0; i < validatedToolsSchema.tools.length; i++) {
        const tool = validatedToolsSchema.tools[i]
        const toolResult = validateSingleFunctionSchema(tool)
        
        // Add tool index to error messages
        if (toolResult.errors.length > 0) {
          result.errors.push(...toolResult.errors.map(error => `Tool ${i + 1}: ${error}`))
        }
        if (toolResult.warnings.length > 0) {
          result.warnings.push(...toolResult.warnings.map(warning => `Tool ${i + 1}: ${warning}`))
        }
      }
    } else {
      // Handle single function schema
      const singleResult = validateSingleFunctionSchema(schema)
      result.errors.push(...singleResult.errors)
      result.warnings.push(...singleResult.warnings)
    }
    
    result.isValid = result.errors.length === 0
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.errors = error.issues.map(issue => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
        return `${path}${issue.message}`
      })
    } else {
      result.errors.push(`Invalid JSON schema format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return result
}

// Helper function to validate a single function schema
function validateSingleFunctionSchema(schema: any): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
  }

  try {
    // Step 1: Validate the top-level structure (this handles type: "function")
    const validatedSchema = functionSchemaValidator.parse(schema)
    
    // Step 2: Additional custom validations
    const func = validatedSchema.function
    
    // Step 3: Validate parameter properties (this handles individual parameter types)
    if (func.parameters?.properties) {
      const paramValidation = validateParameterProperties(func.parameters.properties)
      result.errors.push(...paramValidation.errors)
      result.warnings.push(...paramValidation.warnings)
    }
    
    // Step 4: Check required fields exist in properties
    if (func.parameters?.required) {
      for (const requiredField of func.parameters.required) {
        if (!func.parameters.properties?.[requiredField]) {
          result.errors.push(`Required field "${requiredField}" not found in properties`)
        }
      }
    }
    
    result.isValid = result.errors.length === 0
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      result.errors = error.issues.map(issue => {
        const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
        return `${path}${issue.message}`
      })
    } else {
      result.errors.push(`Invalid JSON schema format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
  
  return result
}

export function validateSchemaJson(jsonString: string): ValidationResult {
  try {
    const parsed = JSON.parse(jsonString)
    return validateFunctionSchema(parsed)
  } catch (error) {
    return {
      isValid: false,
      errors: ["Invalid JSON format"],
      warnings: [],
    }
  }
}

// Test function to verify validation works correctly
export function testValidation(): void {
  console.log("Testing schema validation...")
  
  // Test each example schema
  for (const [name, schema] of Object.entries(EXAMPLE_SCHEMAS)) {
    const result = validateFunctionSchema(schema)
    console.log(`\n${name}:`, {
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings
    })
  }
  
  // Test tools array format
  console.log("\nTesting tools array format...")
  const toolsArraySchema = {
    tools: [
      EXAMPLE_SCHEMAS.web_search,
      EXAMPLE_SCHEMAS.send_email
    ]
  }
  const toolsResult = validateFunctionSchema(toolsArraySchema)
  console.log("Tools array:", {
    isValid: toolsResult.isValid,
    errors: toolsResult.errors,
    warnings: toolsResult.warnings
  })
}

// Example schemas for the user
export const EXAMPLE_SCHEMAS = {
  web_search: {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Search the web for information on a given topic",
      parameters: {
        type: "object" as const,
        properties: {
          query: {
            type: "string" as const,
            description: "The search query to execute",
          },
          max_results: {
            type: "integer" as const,
            description: "Maximum number of results to return",
            default: 5,
          },
        },
        required: ["query"],
      },
    },
  },
  send_email: {
    type: "function" as const,
    function: {
      name: "send_email",
      description: "Send an email to a recipient",
      parameters: {
        type: "object" as const,
        properties: {
          to: {
            type: "string" as const,
            description: "Email address of the recipient",
          },
          subject: {
            type: "string" as const,
            description: "Subject line of the email",
          },
          body: {
            type: "string" as const,
            description: "Body content of the email",
          },
          priority: {
            type: "string" as const,
            description: "Email priority level",
            enum: ["low", "normal", "high"],
            default: "normal",
          },
        },
        required: ["to", "subject", "body"],
      },
    },
  },
  database_query: {
    type: "function" as const,
    function: {
      name: "database_query",
      description: "Execute a database query and return results",
      parameters: {
        type: "object" as const,
        properties: {
          table: {
            type: "string" as const,
            description: "Name of the database table to query",
          },
          columns: {
            type: "array" as const,
            description: "List of columns to select",
            items: {
              type: "string" as const,
            },
          },
          where_clause: {
            type: "string" as const,
            description: "SQL WHERE clause for filtering",
          },
          limit: {
            type: "integer" as const,
            description: "Maximum number of rows to return",
            default: 100,
          },
        },
        required: ["table"],
      },
    },
  },
}
