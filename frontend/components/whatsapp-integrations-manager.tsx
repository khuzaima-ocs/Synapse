"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { EmptyState } from "@/components/empty-state"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"
import { WhatsAppIntegrationForm } from "@/components/whatsapp-integration-form"
import { apiClient } from "@/lib/api-client"
import { WhatsAppIntegration } from "@/lib/types"
import { 
  Plus, 
  Smartphone, 
  Settings, 
  Trash2, 
  Copy, 
  ExternalLink,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import { toast } from "sonner"

interface WhatsAppIntegrationsManagerProps {
  agentId: string
}

export function WhatsAppIntegrationsManager({ agentId }: WhatsAppIntegrationsManagerProps) {
  const [integrations, setIntegrations] = useState<WhatsAppIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<WhatsAppIntegration | null>(null)
  const [deletingIntegration, setDeletingIntegration] = useState<WhatsAppIntegration | null>(null)

  const loadIntegrations = async () => {
    try {
      const data = await apiClient.getWhatsAppIntegrationsForAgent(agentId)
      setIntegrations(data)
    } catch (error) {
      console.error("Failed to load integrations:", error)
      toast.error("Failed to load WhatsApp integrations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIntegrations()
  }, [agentId])

  const handleCreateIntegration = async (data: any) => {
    try {
      const newIntegration = await apiClient.createWhatsAppIntegration({
        ...data,
        agent_id: agentId
      })
      setIntegrations(prev => [...prev, newIntegration])
      setShowForm(false)
      toast.success("WhatsApp integration created successfully")
    } catch (error) {
      console.error("Failed to create integration:", error)
      toast.error("Failed to create WhatsApp integration")
    }
  }

  const handleUpdateIntegration = async (id: string, data: any) => {
    try {
      const updatedIntegration = await apiClient.updateWhatsAppIntegration(id, data)
      setIntegrations(prev => prev.map(integration => 
        integration.id === id ? updatedIntegration : integration
      ))
      setEditingIntegration(null)
      toast.success("WhatsApp integration updated successfully")
    } catch (error) {
      console.error("Failed to update integration:", error)
      toast.error("Failed to update WhatsApp integration")
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    try {
      await apiClient.deleteWhatsAppIntegration(id)
      setIntegrations(prev => prev.filter(integration => integration.id !== id))
      setDeletingIntegration(null)
      toast.success("WhatsApp integration deleted successfully")
    } catch (error) {
      console.error("Failed to delete integration:", error)
      toast.error("Failed to delete WhatsApp integration")
    }
  }

  const copyWebhookUrl = (pathToken: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
    const webhookUrl = `${baseUrl}/api/v1/integrations/connectors/whatsapp/twilio/${pathToken}`
    navigator.clipboard.writeText(webhookUrl)
    toast.success("Webhook URL copied to clipboard")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">WhatsApp Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Manage WhatsApp connections for this agent
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Integration
        </Button>
      </div>

      {/* Integrations List */}
      {integrations.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="No WhatsApp integrations"
          description="Create a WhatsApp integration to connect this agent to WhatsApp"
          actionLabel="Add Integration"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => (
            <Card key={integration.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{integration.provider.toUpperCase()} Integration</CardTitle>
                      <CardDescription className="text-sm">
                        Created {new Date(integration.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={integration.enabled ? "default" : "secondary"}>
                    {integration.enabled ? (
                      <><CheckCircle className="w-3 h-3 mr-1" /> Active</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Webhook URL */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Webhook URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 text-xs bg-muted px-2 py-1 rounded truncate">
                      .../twilio/{integration.path_token}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyWebhookUrl(integration.path_token)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Phone Number */}
                {integration.twilio_phone_number && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <p className="text-sm font-mono">{integration.twilio_phone_number}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingIntegration(integration)}
                    className="flex-1 gap-2"
                  >
                    <Settings className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeletingIntegration(integration)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Integration Form Modal */}
      {showForm && (
        <WhatsAppIntegrationForm
          agents={[]} // Not needed since agent is already selected
          onSubmit={handleCreateIntegration}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Edit Integration Modal */}
      {editingIntegration && (
        <WhatsAppIntegrationForm
          agents={[]} // Not needed since agent is already selected
          integration={editingIntegration}
          onSubmit={(data) => handleUpdateIntegration(editingIntegration.id, data)}
          onClose={() => setEditingIntegration(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingIntegration && (
        <DeleteConfirmationModal
          isOpen={!!deletingIntegration}
          onClose={() => setDeletingIntegration(null)}
          onConfirm={() => handleDeleteIntegration(deletingIntegration.id)}
          title="Delete WhatsApp Integration"
          description="Are you sure you want to delete this WhatsApp integration? This action cannot be undone."
          itemName="WhatsApp Integration"
          itemType="agent"
        />
      )}
    </div>
  )
}
