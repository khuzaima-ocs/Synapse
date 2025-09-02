"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ChevronDown, 
  ChevronRight,
  Copy,
  Eye,
} from "lucide-react"
import { validateSchemaJson, EXAMPLE_SCHEMAS, type ValidationResult } from "@/lib/schema-validation"
import type { FunctionSchema, FunctionParameter } from "@/lib/types"

interface FunctionSchemaEditorProps {
  value: FunctionSchema | null
  onChange: (schema: FunctionSchema | null) => void
  className?: string
}

export function FunctionSchemaEditor({ value, onChange, className }: FunctionSchemaEditorProps) {
  const [mode, setMode] = useState<"visual" | "json">("visual")
  const [jsonValue, setJsonValue] = useState("")
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [expandedParams, setExpandedParams] = useState<Record<string, boolean>>({})
  
  // Initialize form state
  const [functionName, setFunctionName] = useState("")
  const [functionDescription, setFunctionDescription] = useState("")
  const [parameters, setParameters] = useState<Record<string, FunctionParameter & { isRequired: boolean }>>({})

  // Sync with parent value
  useEffect(() => {
    if (value) {
      setFunctionName(value.function.name)
      setFunctionDescription(value.function.description)
      
      const paramObj: Record<string, FunctionParameter & { isRequired: boolean }> = {}
      const props = value.function.parameters.properties
      const required = value.function.parameters.required || []
      
      Object.entries(props).forEach(([key, param]) => {
        paramObj[key] = {
          ...param,
          isRequired: required.includes(key)
        }
      })
      
      setParameters(paramObj)
      setJsonValue(JSON.stringify(value, null, 2))
    }
  }, [value])

  const buildSchema = (): FunctionSchema => {
    const properties: Record<string, FunctionParameter> = {}
    const required: string[] = []

    Object.entries(parameters).forEach(([key, param]) => {
      const { isRequired, ...cleanParam } = param
      properties[key] = cleanParam
      if (isRequired) {
        required.push(key)
      }
    })

    return {
      type: "function",
      function: {
        name: functionName,
        description: functionDescription,
        parameters: {
          type: "object",
          properties,
          required,
        },
      },
    }
  }

  const handleVisualChange = () => {
    if (!functionName.trim() || !functionDescription.trim()) {
      return
    }
    
    const schema = buildSchema()
    const validation = validateSchemaJson(JSON.stringify(schema))
    setValidation(validation)
    
    if (validation.isValid) {
      onChange(schema)
      setJsonValue(JSON.stringify(schema, null, 2))
    }
  }

  const handleJsonChange = (newJson: string) => {
    setJsonValue(newJson)
    
    if (!newJson.trim()) {
      setValidation(null)
      onChange(null)
      return
    }

    const validation = validateSchemaJson(newJson)
    setValidation(validation)
    
    if (validation.isValid) {
      try {
        const parsed = JSON.parse(newJson)
        onChange(parsed)
        
        // Update visual form
        setFunctionName(parsed.function.name)
        setFunctionDescription(parsed.function.description)
        
        const paramObj: Record<string, FunctionParameter & { isRequired: boolean }> = {}
        const props = parsed.function.parameters.properties
        const required = parsed.function.parameters.required || []
        
        Object.entries(props).forEach(([key, param]: [string, any]) => {
          paramObj[key] = {
            ...param,
            isRequired: required.includes(key)
          }
        })
        
        setParameters(paramObj)
      } catch (error) {
        // JSON parsing error handled by validation
      }
    } else {
      onChange(null)
    }
  }

  const addParameter = () => {
    const paramKey = `param_${Date.now()}`
    setParameters(prev => ({
      ...prev,
      [paramKey]: {
        type: "string",
        description: "",
        isRequired: false,
      }
    }))
    setExpandedParams(prev => ({ ...prev, [paramKey]: true }))
  }

  const updateParameter = (key: string, field: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }))
    
    // Trigger update
    setTimeout(handleVisualChange, 0)
  }

  const deleteParameter = (key: string) => {
    setParameters(prev => {
      const newParams = { ...prev }
      delete newParams[key]
      return newParams
    })
    
    setExpandedParams(prev => {
      const newExpanded = { ...prev }
      delete newExpanded[key]
      return newExpanded
    })
    
    setTimeout(handleVisualChange, 0)
  }

  const renameParameter = (oldKey: string, newKey: string) => {
    if (oldKey === newKey || !newKey.trim() || parameters[newKey]) {
      return
    }
    
    setParameters(prev => {
      const newParams: Record<string, FunctionParameter & { isRequired: boolean }> = {}
      Object.entries(prev).forEach(([key, value]) => {
        newParams[key === oldKey ? newKey : key] = value
      })
      return newParams
    })
    
    setExpandedParams(prev => {
      const newExpanded = { ...prev }
      if (prev[oldKey]) {
        newExpanded[newKey] = true
        delete newExpanded[oldKey]
      }
      return newExpanded
    })
    
    setTimeout(handleVisualChange, 0)
  }

  const loadExample = (exampleKey: keyof typeof EXAMPLE_SCHEMAS) => {
    const example = EXAMPLE_SCHEMAS[exampleKey]
    setJsonValue(JSON.stringify(example, null, 2))
    handleJsonChange(JSON.stringify(example, null, 2))
    setMode("json")
  }

  useEffect(() => {
    handleVisualChange()
  }, [functionName, functionDescription])

  return (
    <div className={className}>
      <Tabs value={mode} onValueChange={(v) => setMode(v as "visual" | "json")}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="visual">Visual Editor</TabsTrigger>
            <TabsTrigger value="json">JSON Editor</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Select onValueChange={loadExample}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Load example" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web_search">Web Search</SelectItem>
                <SelectItem value="send_email">Send Email</SelectItem>
                <SelectItem value="database_query">Database Query</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Function Information</CardTitle>
              <CardDescription>Basic details about your function</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="function-name">Function Name</Label>
                <Input
                  id="function-name"
                  value={functionName}
                  onChange={(e) => setFunctionName(e.target.value)}
                  placeholder="e.g., search_web, send_email"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Must be a valid identifier (letters, numbers, underscores)
                </p>
              </div>
              
              <div>
                <Label htmlFor="function-description">Description</Label>
                <Textarea
                  id="function-description"
                  value={functionDescription}
                  onChange={(e) => setFunctionDescription(e.target.value)}
                  placeholder="Describe what this function does..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Parameters
                <Button onClick={addParameter} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parameter
                </Button>
              </CardTitle>
              <CardDescription>Define the parameters your function accepts</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {Object.entries(parameters).map(([key, param]) => (
                    <Collapsible
                      key={key}
                      open={expandedParams[key]}
                      onOpenChange={(open) => 
                        setExpandedParams(prev => ({ ...prev, [key]: open }))
                      }
                    >
                      <div className="border rounded-lg p-4 space-y-3">
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-2">
                              {expandedParams[key] ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <Input
                                value={key}
                                onChange={(e) => renameParameter(key, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-40 h-7 text-sm font-medium"
                              />
                              <Badge variant={param.isRequired ? "default" : "secondary"}>
                                {param.type}
                              </Badge>
                              {param.isRequired && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteParameter(key)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Type</Label>
                              <Select
                                value={param.type}
                                onValueChange={(value) => updateParameter(key, "type", value)}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="number">Number</SelectItem>
                                  <SelectItem value="integer">Integer</SelectItem>
                                  <SelectItem value="boolean">Boolean</SelectItem>
                                  <SelectItem value="array">Array</SelectItem>
                                  <SelectItem value="object">Object</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={param.isRequired}
                                onCheckedChange={(checked) => 
                                  updateParameter(key, "isRequired", checked)
                                }
                              />
                              <Label className="text-xs">Required</Label>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-xs">Description</Label>
                            <Input
                              value={param.description || ""}
                              onChange={(e) => updateParameter(key, "description", e.target.value)}
                              placeholder="Describe this parameter..."
                              className="h-8 mt-1"
                            />
                          </div>
                          
                          {param.type === "string" && (
                            <div>
                              <Label className="text-xs">Enum Values (optional)</Label>
                              <Input
                                value={param.enum?.join(", ") || ""}
                                onChange={(e) => {
                                  const enumValues = e.target.value
                                    .split(",")
                                    .map(v => v.trim())
                                    .filter(Boolean)
                                  updateParameter(key, "enum", enumValues.length > 0 ? enumValues : undefined)
                                }}
                                placeholder="option1, option2, option3"
                                className="h-8 mt-1"
                              />
                            </div>
                          )}
                          
                          <div>
                            <Label className="text-xs">Default Value (optional)</Label>
                            <Input
                              value={param.default || ""}
                              onChange={(e) => updateParameter(key, "default", e.target.value || undefined)}
                              placeholder="Default value..."
                              className="h-8 mt-1"
                            />
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                  
                  {Object.keys(parameters).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No parameters defined yet.</p>
                      <p className="text-sm">Click "Add Parameter" to get started.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Function Schema JSON</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard?.writeText(jsonValue)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
            <Textarea
              value={jsonValue}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="font-mono text-sm min-h-[400px]"
              placeholder="Enter your OpenAI function schema JSON here..."
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Validation Results */}
      {validation && (
        <div className="mt-4 space-y-2">
          {validation.isValid ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Schema is valid and ready to use!
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Schema validation failed:</p>
                  <ul className="text-sm space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {validation.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Recommendations:</p>
                  <ul className="text-sm space-y-1">
                    {validation.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}
