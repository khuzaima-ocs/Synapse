"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { HelpCircle, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useData } from "@/lib/api-data-store"
import { useRouter } from "next/navigation"
import { validateSchemaJson, EXAMPLE_SCHEMAS } from "@/lib/schema-validation"
import type { FunctionSchema } from "@/lib/types"

interface ToolConfigFormProps {
  toolId: string
}

export function ToolConfigForm({ toolId }: ToolConfigFormProps) {
  const { tools, updateTool, addTool } = useData()
  const router = useRouter()
  const tool = useMemo(() => tools.find((t) => t.id === toolId), [tools, toolId])
  const [toolName, setToolName] = useState("")
  const [toolDescription, setToolDescription] = useState("")
  const [schema, setSchema] = useState("")
  const [functionSchema, setFunctionSchema] = useState<FunctionSchema | null>(null)
  const [allFunctionSchemas, setAllFunctionSchemas] = useState<FunctionSchema[]>([])
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[]; warnings: string[] } | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!tool) return
    setToolName(tool.name)
    setToolDescription(tool.description)
    setSchema(tool.schema || "")
    setFunctionSchema(tool.functionSchema || null)
    
    // Handle function schemas and function names
    if (tool.functionSchema) {
      setAllFunctionSchemas([tool.functionSchema])
    } else if (tool.functionNames && tool.functionNames.length > 0) {
      // If we have function names but no schema, create placeholder schemas
      const placeholderSchemas = tool.functionNames.map(name => ({
        type: "function" as const,
        function: {
          name,
          description: `Function: ${name}`,
          parameters: {
            type: "object" as const,
            properties: {},
            required: []
          }
        }
      }))
      setAllFunctionSchemas(placeholderSchemas)
    } else {
      setAllFunctionSchemas([])
    }
  }, [tool])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setSchema(content)
      validateAndApplySchema(content)
    }
    reader.readAsText(file)
  }

  const validateAndApplySchema = (schemaContent: string) => {
    const result = validateSchemaJson(schemaContent)
    console.log(result)
    setValidationResult(result)
    
    if (result.isValid) {
      try {
        const parsed = JSON.parse(schemaContent)
        
        // Handle both single function schema and tools array schema
        let functionSchemaToSet = null
        let allSchemas: FunctionSchema[] = []
        
        if (parsed.type === "function" && parsed.function) {
          // Single function schema
          functionSchemaToSet = parsed
          allSchemas = [parsed]
        } else if (parsed.tools && Array.isArray(parsed.tools) && parsed.tools.length > 0) {
          // Tools array schema - extract all valid function schemas
          const validTools = parsed.tools.filter((tool: any) => 
            tool.type === "function" && tool.function
          )
          if (validTools.length > 0) {
            functionSchemaToSet = validTools[0] // Use first for backward compatibility
            allSchemas = validTools
          }
        }

        console.log('functionSchemaToSet:', functionSchemaToSet)
        console.log('allSchemas:', allSchemas)
        
        // Extract function names for debugging
        const functionNames = allSchemas.map(schema => schema.function.name)
        console.log('Extracted function names:', functionNames)
        
        setFunctionSchema(functionSchemaToSet)
        setAllFunctionSchemas(allSchemas)
        
        // Auto-populate name and description from schema
        if (functionSchemaToSet?.function?.name && !toolName) {
          setToolName(functionSchemaToSet.function.name)
        }
        if (functionSchemaToSet?.function?.description && !toolDescription) {
          setToolDescription(functionSchemaToSet.function.description)
        }
      } catch (error) {
        console.error('Error parsing schema:', error)
      }
    }
  }

  const handleApplySchema = () => {
    setIsApplying(true)
    validateAndApplySchema(schema)
    setTimeout(() => setIsApplying(false), 1000)
  }

  const loadExampleSchema = (exampleKey: keyof typeof EXAMPLE_SCHEMAS) => {
    const example = EXAMPLE_SCHEMAS[exampleKey]
    const schemaString = JSON.stringify(example, null, 2)
    setSchema(schemaString)
    validateAndApplySchema(schemaString)
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Configuration */}
      <div className="flex-1 min-w-0 p-6 space-y-6 overflow-auto">
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Basic Info</h2>
            <p className="text-sm text-muted-foreground">Provide a name and description reference.</p>
          </div>

          {/* Tool Image */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Tool Image</Label>
            <div className="flex gap-6">
              <div className="w-32 h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center bg-muted/50">
                <div className="w-16 h-16 bg-foreground rounded-lg flex items-center justify-center">
                  <div className="text-background text-xs font-semibold">API</div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Title
                  </Label>
                  <Input id="title" value={toolName} onChange={(e) => setToolName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={toolDescription}
                    onChange={(e) => setToolDescription(e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Allowed *.jpeg, *.jpg, *.png, *.svg
              <br />
              max size of 3 MB
            </p>
          </div>
        </div>

        {/* OpenAI Function Schema */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">OpenAI Function Schema</h2>
            <p className="text-sm text-muted-foreground">Define your tool's functionality using OpenAI function calling schema.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Function Schema</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Provide your OpenAI function schema to define the tool's functionality</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload JSON
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => loadExampleSchema('web_search')}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Examples
                </Button>
              </div>
            </div>

            {/* Validation Status */}
            {validationResult && (
              <div className="space-y-2">
                {validationResult.isValid ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Schema is valid! {validationResult.warnings.length > 0 && `${validationResult.warnings.length} warning(s) found.`}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Schema validation failed. Please fix the errors below.
                    </AlertDescription>
                  </Alert>
                )}
                
                {validationResult.errors.length > 0 && (
                  <div className="space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                
                {validationResult.warnings.length > 0 && (
                  <div className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <Textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                className="min-h-[300px] font-mono text-sm bg-muted/50"
                placeholder="Enter your OpenAI function schema here..."
              />
            </div>

            {/* Apply Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleApplySchema}
                disabled={!schema.trim() || isApplying}
                className="gap-2"
              >
                {isApplying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Apply Schema
                  </>
                )}
              </Button>
            </div>

            {/* Function Schema Preview */}
            {allFunctionSchemas.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Available Actions</Label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Operation Id / Description</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Method</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Path</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Include</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allFunctionSchemas.map((schema, index) => (
                        <tr key={index} className="border-b last:border-b-0 hover:bg-muted/25">
                          <td className="p-3">
                            <div className="font-medium text-foreground">{schema.function.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {schema.function.description}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                              POST
                            </Badge>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            /{schema.function.name}
                          </td>
                          <td className="p-3">
                            <div className="w-4 h-4 bg-yellow-400 rounded border-2 border-yellow-500"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={() => router.push("/tools")} variant="outline">Cancel</Button>
          <Button
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={() => {
              const functionNames = allFunctionSchemas.map(schema => schema.function.name)
              console.log('Saving tool with function names:', functionNames)
              
              const toolData = {
                name: toolName,
                description: toolDescription,
                schema,
                functionSchema: allFunctionSchemas.length === 1 ? allFunctionSchemas[0] : undefined,
                functionNames: functionNames,
                type: allFunctionSchemas.length > 0 ? "function" as const : "api" as const
              }
              
              console.log('Full tool data being saved:', toolData)
              
              if (tool) {
                updateTool(tool.id, toolData)
              } else {
                addTool(toolData)
              }
              router.push("/tools")
            }}
            disabled={!toolName.trim() || !toolDescription.trim()}
          >
            Save Tool
          </Button>
        </div>
      </div>
    </div>
  )
}
