"use client"

import React, { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

interface LiveRegionProps {
  children: React.ReactNode
  role?: "status" | "alert" | "log" | "timer"
  ariaLive?: "polite" | "assertive" | "off"
  className?: string
}

export function LiveRegion({ 
  children, 
  role = "status", 
  ariaLive = "polite",
  className = "" 
}: LiveRegionProps) {
  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`sr-only ${className}`}
      aria-atomic="true"
    >
      {children}
    </div>
  )
}

interface ScreenReaderAnnouncerProps {
  message: string
  priority?: "polite" | "assertive"
  timeout?: number
}

export function ScreenReaderAnnouncer({ 
  message, 
  priority = "polite",
  timeout = 5000 
}: ScreenReaderAnnouncerProps) {
  const [announcements, setAnnouncements] = React.useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (message) {
      setAnnouncements(prev => [...prev, message])
      
      // Clear announcement after timeout
      const timer = setTimeout(() => {
        setAnnouncements(prev => prev.filter(msg => msg !== message))
      }, timeout)

      return () => clearTimeout(timer)
    }
  }, [message, timeout])

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </div>
  )
}

interface SkipLinkProps {
  targetId: string
  children: React.ReactNode
}

export function SkipLink({ targetId, children }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      onClick={(e) => {
        e.preventDefault()
        const target = document.getElementById(targetId)
        if (target) {
          target.focus()
          target.scrollIntoView({ behavior: "smooth" })
        }
      }}
    >
      {children}
    </a>
  )
}

interface ProgressIndicatorProps {
  current: number
  total: number
  label?: string
  ariaLabel?: string
}

export function ProgressIndicator({ 
  current, 
  total, 
  label = "Progress",
  ariaLabel 
}: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100)
  const progressLabel = ariaLabel || `${label}: ${current} of ${total} (${percentage}%)`

  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={progressLabel}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {current} of {total}
        </span>
      </div>
      <div className="w-full bg-secondary rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="sr-only">
        {progressLabel}
      </div>
    </div>
  )
}

interface StatusIndicatorProps {
  status: "success" | "error" | "warning" | "info" | "loading"
  message: string
  showIcon?: boolean
}

export function StatusIndicator({ 
  status, 
  message, 
  showIcon = true 
}: StatusIndicatorProps) {
  const statusConfig = {
    success: {
      icon: "✓",
      role: "status",
      ariaLive: "polite" as const,
      className: "text-status-success",
    },
    error: {
      icon: "✗",
      role: "alert",
      ariaLive: "assertive" as const,
      className: "text-status-error",
    },
    warning: {
      icon: "⚠",
      role: "alert",
      ariaLive: "polite" as const,
      className: "text-status-warning",
    },
    info: {
      icon: "ℹ",
      role: "status",
      ariaLive: "polite" as const,
      className: "text-status-info",
    },
    loading: {
      icon: "⟳",
      role: "status",
      ariaLive: "polite" as const,
      className: "text-muted-foreground",
    },
  }

  const config = statusConfig[status]

  return (
    <div
      role={config.role}
      aria-live={config.ariaLive}
      className={`flex items-center gap-2 ${config.className}`}
    >
      {showIcon && (
        <span className="text-sm" aria-hidden="true">
          {config.icon}
        </span>
      )}
      <span>{message}</span>
    </div>
  )
}

interface TableAccessibilityProps {
  caption?: string
  summary?: string
  children: React.ReactNode
}

export function AccessibleTable({ 
  caption, 
  summary, 
  children 
}: TableAccessibilityProps) {
  return (
    <table
      role="table"
      aria-label={caption}
      aria-describedby={summary ? "table-summary" : undefined}
    >
      {caption && <caption className="sr-only">{caption}</caption>}
      {summary && (
        <div id="table-summary" className="sr-only">
          {summary}
        </div>
      )}
      {children}
    </table>
  )
}

interface FormFieldAccessibilityProps {
  id: string
  label: string
  required?: boolean
  error?: string
  helpText?: string
  children: React.ReactNode
}

export function AccessibleFormField({
  id,
  label,
  required = false,
  error,
  helpText,
  children
}: FormFieldAccessibilityProps) {
  const errorId = `${id}-error`
  const helpId = `${id}-help`

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {React.cloneElement(children as React.ReactElement, {
        id,
        "aria-describedby": [
          error && errorId,
          helpText && helpId,
        ].filter(Boolean).join(" "),
        "aria-invalid": error ? "true" : "false",
        "aria-required": required,
      })}
      
      {error && (
        <div id={errorId} className="text-sm text-red-500" role="alert">
          {error}
        </div>
      )}
      
      {helpText && (
        <div id={helpId} className="text-sm text-muted-foreground">
          {helpText}
        </div>
      )}
    </div>
  )
}

// Screen Reader Support Component
export function ScreenReaderSupport() {
  const announcementsRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={announcementsRef}
      className="sr-only"
      aria-live="polite"
      aria-atomic="true"
    />
  )
}

// Hook for managing focus and announcements
export function useScreenReaderSupport() {
  const { toast } = useToast()
  const announcementsRef = useRef<HTMLDivElement>(null)

  const announce = (message: string, priority: "polite" | "assertive" = "polite") => {
    if (announcementsRef.current) {
      const announcement = document.createElement("div")
      announcement.setAttribute("aria-live", priority)
      announcement.setAttribute("aria-atomic", "true")
      announcement.className = "sr-only"
      announcement.textContent = message
      
      announcementsRef.current.appendChild(announcement)
      
      // Remove after announcement
      setTimeout(() => {
        if (announcement.parentNode) {
          announcement.parentNode.removeChild(announcement)
        }
      }, 1000)
    }
  }

  const announceToast = (title: string, description?: string) => {
    const message = description ? `${title}: ${description}` : title
    announce(message)
    toast({ title, description })
  }

  return { announce, announceToast, announcementsRef }
} 