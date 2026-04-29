"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
}

export function PlayStatusBadge({ status, playId }: { status: string; playId: string }) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(status)

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/plays/${playId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setCurrentStatus(newStatus)
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge 
          className={`cursor-pointer ${statusColors[currentStatus] || statusColors.draft}`}
        >
          {currentStatus}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
          Draft
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("active")}>
          Active
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("paused")}>
          Paused
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
          Completed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
