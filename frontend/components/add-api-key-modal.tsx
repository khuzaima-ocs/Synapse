"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useData } from "@/lib/data-store"
import { Key, Eye, EyeOff, ExternalLink, Shield, CheckCircle, AlertCircle, Cloud } from "lucide-react"

interface AddApiKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddApiKeyModal({ open, onOpenChange }: AddApiKeyModalProps) {
  const [name, setName] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [isAzure, setIsAzure] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const { addApiKey } = useData()

  const isValidApiKey = apiKey.startsWith('sk-') || (isAzure && apiKey.length > 0)
  const isFormValid = name.trim() && apiKey.trim() && isValidApiKey

  const handleSubmit = () => {
    if (!isFormValid) return
    addApiKey({ name: name.trim(), key: apiKey.trim(), provider: isAzure ? "azure-openai" : "openai", isAzure })
    setName("")
    setApiKey("")
    setIsAzure(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0">
        {/* Header with gradient background */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
                <Key className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-foreground mb-1">
                Add API Key
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Securely connect your OpenAI account
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-6 py-6 space-y-6">
          {/* Provider Selection */}
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">API Provider</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="azure-toggle" className={`text-sm transition-colors ${
                  isAzure ? 'text-muted-foreground' : 'text-foreground font-medium'
                }`}>
                  OpenAI
                </Label>
                <Switch 
                  id="azure-toggle" 
                  checked={isAzure} 
                  onCheckedChange={setIsAzure}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Label htmlFor="azure-toggle" className={`text-sm transition-colors ${
                  isAzure ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  Azure
                </Label>
              </div>
            </div>
            
            {/* Provider Info Card */}
            <div className={`p-3 rounded-lg border-2 transition-all ${
              isAzure 
                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isAzure ? 'bg-blue-600' : 'bg-green-600'
                }`}>
                  {isAzure ? <Cloud className="w-4 h-4 text-white" /> : <Key className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">
                    {isAzure ? 'Azure OpenAI Service' : 'OpenAI Platform'}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAzure 
                      ? 'Enterprise-grade AI with enhanced security and compliance'
                      : 'Direct access to OpenAI\'s latest models and features'
                    }
                  </p>
                  <a 
                    href={isAzure 
                      ? 'https://azure.microsoft.com/en-us/products/cognitive-services/openai-service' 
                      : 'https://platform.openai.com/api-keys'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-1 transition-colors"
                  >
                    Get your API key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="key-name" className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Display Name
              </Label>
              <Input 
                id="key-name" 
                placeholder={isAzure ? "My Azure OpenAI Key" : "My OpenAI Key"}
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Choose a memorable name to identify this API key
              </p>
            </div>

            {/* API Key Field */}
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                API Key
              </Label>
              <div className="relative">
                <Input 
                  id="api-key"
                  placeholder={isAzure ? "Enter your Azure OpenAI key..." : "sk-proj-..."}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type={showApiKey ? "text" : "password"}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Validation Feedback */}
              {apiKey && (
                <div className="flex items-center gap-2 text-xs">
                  {isValidApiKey ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span className="text-green-600">Valid API key format</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-500" />
                      <span className="text-red-500">
                        {isAzure ? 'Enter a valid Azure OpenAI key' : 'API key should start with "sk-"'}
                      </span>
                    </>
                  )}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                🔒 Your API key is stored locally and never shared
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/20 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
            Cancel
          </Button>
          <Button
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 gap-2"
            disabled={!isFormValid}
            onClick={handleSubmit}
          >
            <Key className="w-4 h-4" />
            Add API Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
