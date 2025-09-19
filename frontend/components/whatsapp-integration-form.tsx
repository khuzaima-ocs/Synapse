"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { WhatsAppIntegration, Agent, WhatsAppIntegrationCreate, WhatsAppIntegrationUpdate } from "@/lib/types"
import { Smartphone, AlertCircle, CheckCircle } from "lucide-react"

interface WhatsAppIntegrationFormProps {
  agents: Agent[]
  integration?: WhatsAppIntegration
  onSubmit: (data: WhatsAppIntegrationCreate | WhatsAppIntegrationUpdate) => void
  onClose: () => void
}

export function WhatsAppIntegrationForm({ 
  agents, 
  integration, 
  onSubmit, 
  onClose 
}: WhatsAppIntegrationFormProps) {
  const [formData, setFormData] = useState({
    agent_id: integration?.agent_id || "",
    provider: integration?.provider || "twilio",
    enabled: integration?.enabled ?? true,
    twilio_auth_token: integration?.twilio_auth_token || "",
    twilio_account_sid: integration?.twilio_account_sid || "",
    twilio_phone_number: integration?.twilio_phone_number || "whatsapp: ",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Only validate agent_id if agents are provided (not when called from agent page)
    if (agents.length > 0 && !formData.agent_id) {
      newErrors.agent_id = "Please select an agent"
    }

    if (formData.provider === "twilio") {
      if (!formData.twilio_auth_token) {
        newErrors.twilio_auth_token = "Twilio Auth Token is required"
      }
      if (!formData.twilio_account_sid) {
        newErrors.twilio_account_sid = "Twilio Account SID is required"
      }
      if (!formData.twilio_phone_number) {
        newErrors.twilio_phone_number = "Twilio Phone Number is required"
      } else if (!formData.twilio_phone_number.startsWith("whatsapp:")) {
        newErrors.twilio_phone_number = "Phone number must start with 'whatsapp:'"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const isEditMode = !!integration

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            {isEditMode ? "Edit WhatsApp Integration" : "Create WhatsApp Integration"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update your WhatsApp integration settings"
              : "Connect an agent to WhatsApp for customer interactions"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Selection - Only show if agents are provided */}
          {agents.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="agent_id">Agent *</Label>
              <Select
                value={formData.agent_id}
                onValueChange={(value) => handleInputChange("agent_id", value)}
                disabled={isEditMode} // Don't allow changing agent in edit mode
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <img 
                          src={agent.avatar} 
                          alt={agent.name}
                          className="w-4 h-4 rounded-full"
                        />
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.agent_id && (
                <p className="text-sm text-destructive">{errors.agent_id}</p>
              )}
            </div>
          )}

          {/* Twilio Configuration */}
          {formData.provider === "twilio" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Twilio Configuration</CardTitle>
                <CardDescription>
                  Configure your Twilio WhatsApp settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auth Token */}
                <div className="space-y-2">
                  <Label htmlFor="twilio_auth_token">Twilio Auth Token *</Label>
                  <Input
                    id="twilio_auth_token"
                    type="password"
                    placeholder="Enter your Twilio Auth Token"
                    value={formData.twilio_auth_token}
                    onChange={(e) => handleInputChange("twilio_auth_token", e.target.value)}
                  />
                  {errors.twilio_auth_token && (
                    <p className="text-sm text-destructive">{errors.twilio_auth_token}</p>
                  )}
                </div>

                {/* Account SID */}
                <div className="space-y-2">
                  <Label htmlFor="twilio_account_sid">Twilio Account SID *</Label>
                  <Input
                    id="twilio_account_sid"
                    placeholder="Enter your Twilio Account SID"
                    value={formData.twilio_account_sid}
                    onChange={(e) => handleInputChange("twilio_account_sid", e.target.value)}
                  />
                  {errors.twilio_account_sid && (
                    <p className="text-sm text-destructive">{errors.twilio_account_sid}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="twilio_phone_number">WhatsApp Phone Number *</Label>
                  <Input
                    id="twilio_phone_number"
                    placeholder="whatsapp:+1234567890"
                    value={formData.twilio_phone_number}
                    onChange={(e) => handleInputChange("twilio_phone_number", e.target.value)}
                  />
                  {errors.twilio_phone_number && (
                    <p className="text-sm text-destructive">{errors.twilio_phone_number}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {isEditMode ? "Update Integration" : "Create Integration"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
