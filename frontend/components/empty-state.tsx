"use client"

import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  children?: ReactNode
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  children 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
      {/* Animated background circles */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping opacity-20">
          <div className="w-24 h-24 bg-primary/20 rounded-full" />
        </div>
        <div className="relative w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Icon className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        
        {/* Floating dots animation */}
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-primary/30 rounded-full animate-bounce delay-100" />
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-primary/40 rounded-full animate-bounce delay-200" />
        <div className="absolute top-4 -left-4 w-2 h-2 bg-primary/20 rounded-full animate-bounce delay-300" />
      </div>

      {/* Animated text content */}
      <div className="space-y-4 max-w-md">
        <h3 className="text-2xl font-semibold text-foreground animate-fade-in-up">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed animate-fade-in-up delay-100">
          {description}
        </p>
      </div>

      {/* Action button */}
      <div className="mt-8 animate-fade-in-up delay-200">
        <Button 
          onClick={onAction}
          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        >
          {actionLabel}
        </Button>
      </div>

      {/* Additional content */}
      {children && (
        <div className="mt-6 animate-fade-in-up delay-300">
          {children}
        </div>
      )}
    </div>
  )
}

// Custom animations - add these to your tailwind.config.js if not already present
// @keyframes fade-in-up {
//   0% {
//     opacity: 0;
//     transform: translateY(20px);
//   }
//   100% {
//     opacity: 1;
//     transform: translateY(0);
//   }
// }
