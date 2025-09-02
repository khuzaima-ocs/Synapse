"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, Loader2 } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  description: string
  itemName: string
  itemType: "agent" | "tool" | "custom GPT" | "API key"
  isLoading?: boolean
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Error deleting item:", error)
      // Error handling could be improved with toast notifications
    } finally {
      setIsDeleting(false)
    }
  }

  const getItemIcon = () => {
    switch (itemType) {
      case "agent":
        return "🤖"
      case "tool":
        return "🔧"
      case "custom GPT":
        return "🧩"
      case "API key":
        return "🔑"
      default:
        return "📄"
    }
  }

  const getItemColor = () => {
    switch (itemType) {
      case "agent":
        return "text-blue-600"
      case "tool":
        return "text-green-600"
      case "custom GPT":
        return "text-purple-600"
      case "API key":
        return "text-orange-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Item Preview */}
        <div className="my-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getItemIcon()}</div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${getItemColor()}`}>
                {itemName}
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {itemType}
              </div>
            </div>
          </div>
        </div>

        {/* Warning Message */}
        <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-sm text-destructive">
              <strong>This action cannot be undone.</strong> This will permanently delete the {itemType} and remove all associated data.
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={isDeleting}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete {itemType}
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
