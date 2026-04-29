"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Contact } from "@/lib/types/database"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Mail } from "lucide-react"

interface ContactWithAccount extends Contact {
  accounts?: { company_name: string } | null
}

interface ContactsTableProps {
  contacts: ContactWithAccount[]
  totalCount: number
  page: number
  pageSize: number
  personas: string[]
  currentSearch: string
  currentPersona: string
  currentSort: string
  currentOrder: string
}

export function ContactsTable({
  contacts,
  totalCount,
  page,
  pageSize,
  personas,
  currentSearch,
  currentPersona,
  currentSort,
  currentOrder,
}: ContactsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)

  const totalPages = Math.ceil(totalCount / pageSize)

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    startTransition(() => {
      router.push(`/contacts?${params.toString()}`)
    })
  }

  const handleSearch = () => {
    updateParams({ search, page: "1" })
  }

  const handleSort = (field: string) => {
    const newOrder = currentSort === field && currentOrder === "asc" ? "desc" : "asc"
    updateParams({ sort: field, order: newOrder })
  }

  const getPersonaBadge = (persona: string | null) => {
    if (!persona) return <Badge variant="outline">Unassigned</Badge>
    
    const colors: Record<string, string> = {
      "Technical Decision Maker": "bg-blue-500",
      "Business Champion": "bg-emerald-500",
      "End User": "bg-amber-500",
      "Executive Sponsor": "bg-purple-500",
      "Influencer": "bg-rose-500",
    }
    
    return (
      <Badge className={colors[persona] || "bg-gray-500"}>
        {persona}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary" disabled={isPending}>
            Search
          </Button>
        </div>

        <Select
          value={currentPersona || "all"}
          onValueChange={(value) => updateParams({ persona: value === "all" ? "" : value, page: "1" })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by persona" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Personas</SelectItem>
            {personas.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("full_name")}
                  className="flex items-center gap-1 p-0 font-medium hover:bg-transparent"
                >
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("job_title")}
                  className="flex items-center gap-1 p-0 font-medium hover:bg-transparent"
                >
                  Title
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Persona</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-muted-foreground">No contacts found</p>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <p className="font-medium">
                      {contact.full_name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{contact.job_title || "-"}</p>
                      {contact.management_level && (
                        <p className="text-xs text-muted-foreground">{contact.management_level}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{contact.accounts?.company_name || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{contact.department || contact.job_function || "-"}</span>
                  </TableCell>
                  <TableCell>
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{getPersonaBadge(contact.persona)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount.toLocaleString()} contacts
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: String(page - 1) })}
            disabled={page <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: String(page + 1) })}
            disabled={page >= totalPages || isPending}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
