"use client"

import React, { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
}

export function KeyboardNavigation() {
  const router = useRouter()
  const { toast } = useToast()
  const shortcutsRef = useRef<HTMLDivElement>(null)

  const shortcuts: KeyboardShortcut[] = [
    {
      key: "h",
      description: "Go to Dashboard",
      action: () => router.push("/dashboard"),
    },
    {
      key: "i",
      description: "Go to Inventory",
      action: () => router.push("/dashboard/inventory"),
    },
    {
      key: "c",
      description: "Go to Customers",
      action: () => router.push("/dashboard/customers"),
    },
    {
      key: "s",
      description: "Go to Suppliers",
      action: () => router.push("/dashboard/suppliers"),
    },
    {
      key: "b",
      description: "Go to Billing",
      action: () => router.push("/dashboard/billing"),
    },
    {
      key: "p",
      description: "Go to Purchase Orders",
      action: () => router.push("/dashboard/purchase-orders"),
    },
    {
      key: "d",
      description: "Go to Deliveries",
      action: () => router.push("/dashboard/deliveries"),
    },
    {
      key: "r",
      description: "Go to Reports",
      action: () => router.push("/dashboard/reports"),
    },
    {
      key: "?",
      description: "Show Keyboard Shortcuts",
      action: () => showShortcuts(),
    },
    {
      key: "Escape",
      description: "Close Modal/Dialog",
      action: () => closeModals(),
    },
    {
      key: "n",
      ctrl: true,
      description: "New Item (context sensitive)",
      action: () => handleNewItem(),
    },
    {
      key: "f",
      ctrl: true,
      description: "Search/Filter",
      action: () => focusSearch(),
    },
    {
      key: "s",
      ctrl: true,
      description: "Save",
      action: () => handleSave(),
    },
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      const pressedKey = event.key.toLowerCase()
      const ctrl = event.ctrlKey || event.metaKey
      const shift = event.shiftKey
      const alt = event.altKey

      // Find matching shortcut
      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === pressedKey &&
          (s.ctrl === undefined || s.ctrl === ctrl) &&
          (s.shift === undefined || s.shift === shift) &&
          (s.alt === undefined || s.alt === alt)
      )

      if (shortcut) {
        event.preventDefault()
        shortcut.action()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])

  const showShortcuts = () => {
    if (shortcutsRef.current) {
      shortcutsRef.current.style.display = "block"
      setTimeout(() => {
        shortcutsRef.current?.focus()
      }, 100)
    }
  }

  const closeModals = () => {
    // Close any open modals, dropdowns, or dialogs
    const modals = document.querySelectorAll("[data-modal]")
    modals.forEach((modal) => {
      const closeButton = modal.querySelector("[data-close]")
      if (closeButton instanceof HTMLElement) {
        closeButton.click()
      }
    })
  }

  const handleNewItem = () => {
    // Context-sensitive new item creation
    const path = window.location.pathname
    if (path.includes("/inventory")) {
      router.push("/dashboard/inventory/add")
    } else if (path.includes("/customers")) {
      router.push("/dashboard/customers/add")
    } else if (path.includes("/suppliers")) {
      router.push("/dashboard/suppliers/add")
    } else if (path.includes("/billing")) {
      router.push("/dashboard/billing/create")
    } else {
      toast({
        title: "New Item",
        description: "Use Ctrl+N on specific pages to create new items",
      })
    }
  }

  const focusSearch = () => {
    const searchInput = document.querySelector(
      'input[type="search"], input[placeholder*="search"], input[placeholder*="Search"]'
    ) as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
      searchInput.select()
    } else {
      toast({
        title: "Search",
        description: "No search field found on this page",
      })
    }
  }

  const handleSave = () => {
    // Find and trigger save buttons
    const saveButtons = document.querySelectorAll(
      'button[type="submit"], button:contains("Save"), button:contains("save")'
    )
    if (saveButtons.length > 0) {
      const firstSaveButton = saveButtons[0] as HTMLButtonElement
      firstSaveButton.click()
    } else {
      toast({
        title: "Save",
        description: "No save action available on this page",
      })
    }
  }

  return (
    <>
      {/* Skip to Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Keyboard Shortcuts Help */}
      <div
        ref={shortcutsRef}
        className="fixed inset-0 bg-background/50 z-50 hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.currentTarget.style.display = "none"
          }
        }}
      >
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
            <button
              onClick={() => {
                if (shortcutsRef.current) {
                  shortcutsRef.current.style.display = "none"
                }
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{shortcut.description}</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded border">
                  {shortcut.ctrl && "Ctrl+"}
                  {shortcut.shift && "Shift+"}
                  {shortcut.alt && "Alt+"}
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>💡 Tip: Press ? anytime to show this help</p>
            <p>💡 Tip: Use Tab to navigate between elements</p>
            <p>💡 Tip: Use Escape to close dialogs and modals</p>
          </div>
        </div>
      </div>
    </>
  )
}

// Focus management hook
export function useFocusManagement() {
  const focusableElements = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')

  const trapFocus = (element: HTMLElement) => {
    const focusableContent = element.querySelectorAll(focusableElements)
    const firstFocusableElement = focusableContent[0] as HTMLElement
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            e.preventDefault()
            lastFocusableElement.focus()
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            e.preventDefault()
            firstFocusableElement.focus()
          }
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    return () => element.removeEventListener('keydown', handleTabKey)
  }

  return { trapFocus }
} 