"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, ExternalLink } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EmbedModalProps {
  isOpen: boolean
  onClose: () => void
  gptId: string
  gptName: string
}

export function EmbedModal({ isOpen, onClose, gptId, gptName }: EmbedModalProps) {
  const [copied, setCopied] = useState(false)
  const [width, setWidth] = useState("800")
  const [height, setHeight] = useState("800")
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/custom-gpt/${gptId}` : `http://localhost:3000/custom-gpt/${gptId}`
  const embedUrl = theme === 'dark' ? `${baseUrl}?theme=dark` : baseUrl
  const embedCode = `<iframe src="${embedUrl}" width="${width}" height="${height}" allow="clipboard-read; clipboard-write"></iframe>`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Embed code has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the code manually.",
        variant: "destructive",
      })
    }
  }

  const handlePreview = () => {
    window.open(embedUrl, '_blank')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed {gptName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview Section */}
       

          {/* Size Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input
                id="width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="800"
              />
            </div>
          </div>

          {/* Theme Configuration */}
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Light (Default)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={theme === 'dark'}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  className="w-4 h-4"
                />
                <span className="text-sm">Dark</span>
              </label>
            </div>
          </div>

          {/* Embed Code */}
          <div className="space-y-2">
            <Label>Embed Code</Label>
            <div className="relative">
              <textarea
                value={embedCode}
                readOnly
                className="w-full h-32 p-3 border rounded-lg bg-muted/20 font-mono text-sm resize-none"
                style={{ fontFamily: 'monospace' }}
              />
              <Button
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleCopy}
                disabled={copied}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Copy this code and paste it into your website or application to embed your Custom GPT.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleCopy} disabled={copied}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
