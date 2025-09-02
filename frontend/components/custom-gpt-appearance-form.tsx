"use client"

import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Palette } from "lucide-react"

interface CustomGPTAppearanceFormProps {
  formData: {
    themeColor: string
    customBackground?: boolean
    chatPersistence?: string
  }
  onChange: (field: string, value: any) => void
}

export function CustomGPTAppearanceForm({ formData, onChange }: CustomGPTAppearanceFormProps) {
  const colorOptions = [
    "#2065D1", // Blue
    "#7C3AED", // Purple  
    "#059669", // Emerald
    "#DC2626", // Red
    "#EA580C", // Orange
    "#CA8A04", // Yellow
    "#0891B2", // Cyan
    "#BE185D", // Pink
  ]

  return (
    <TooltipProvider>
      <div className="max-w-2xl mx-auto">
        {/* Appearance Card */}
        <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-purple-50/30">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-12 translate-x-12" />
          <CardHeader className="relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Appearance & Theme</CardTitle>
                <p className="text-sm text-muted-foreground">Customize the visual appearance of your Custom GPT</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Theme Color */}
            <div className="space-y-4">
              <Label className="text-sm font-medium flex items-center gap-2">
                Theme Color
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select the primary color for your Custom GPT interface</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <div className="space-y-4">
                {/* Current Color Display */}
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <div
                    className="w-12 h-12 rounded-xl border-2 border-white shadow-sm"
                    style={{ backgroundColor: formData.themeColor }}
                  />
                  <div>
                    <p className="text-sm font-medium">Current Color</p>
                    <p className="text-xs text-muted-foreground font-mono">{formData.themeColor}</p>
                  </div>
                </div>
                
                {/* Color Options */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-3 block">Choose a base color:</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-16 h-16 rounded-xl border-2 shadow-sm hover:scale-110 transition-all duration-200 ${
                          formData.themeColor === color 
                            ? "border-foreground ring-2 ring-offset-2 ring-foreground/20" 
                            : "border-white hover:border-muted-foreground"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => onChange("themeColor", color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Color Info */}
                <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border">
                  <p className="font-medium mb-1">Color Usage:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• User message bubbles</li>
                    <li>• Send button and interactive elements</li>
                    <li>• Avatar backgrounds</li>
                    <li>• Accent colors throughout the interface</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Custom Background Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Custom Background</Label>
                <p className="text-xs text-muted-foreground">Enable custom background styling</p>
              </div>
              <Switch 
                checked={formData.customBackground ?? false} 
                onCheckedChange={(checked) => onChange("customBackground", checked)} 
              />
            </div>

            {/* Chat Persistence */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                Chat Persistence
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>How long should chat history be retained?</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Select 
                value={formData.chatPersistence || "Never Forget"} 
                onValueChange={(value) => onChange("chatPersistence", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select persistence setting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Never Forget">Never Forget</SelectItem>
                  <SelectItem value="1 Day">1 Day</SelectItem>
                  <SelectItem value="1 Week">1 Week</SelectItem>
                  <SelectItem value="1 Month">1 Month</SelectItem>
                  <SelectItem value="Session Only">Session Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
