"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"
import { Account } from "@/lib/types/database"
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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, ExternalLink } from "lucide-react"

interface AccountsTableProps {
  accounts: Account[]
  totalCount: number
  page: number
  pageSize: number
  industries: string[]
  currentSearch: string
  currentIndustry: string
  currentSort: string
  currentOrder: string
}

export function AccountsTable({
  accounts,
  totalCount,
  page,
  pageSize,
  industries,
  currentSearch,
  currentIndustry,
  currentSort,
  currentOrder,
}: AccountsTableProps) {
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
      router.push(`/accounts?${params.toString()}`)
    })
  }

  const handleSearch = () => {
    updateParams({ search, page: "1" })
  }

  const handleSort = (field: string) => {
    const newOrder = currentSort === field && currentOrder === "asc" ? "desc" : "asc"
    updateParams({ sort: field, order: newOrder })
  }

  const formatRevenue = (revenue: number | null) => {
    if (!revenue) return "-"
    if (revenue >= 1000000) return `$${(revenue / 1000000).toFixed(1)}B`
    if (revenue >= 1000) return `$${(revenue / 1000).toFixed(1)}M`
    return `$${revenue}K`
  }

  const formatEmployees = (employees: number | null) => {
    if (!employees) return "-"
    if (employees >= 1000) return `${(employees / 1000).toFixed(1)}K`
    return employees.toString()
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-emerald-500">A</Badge>
    if (score >= 60) return <Badge className="bg-blue-500">B</Badge>
    if (score >= 40) return <Badge className="bg-amber-500">C</Badge>
    if (score > 0) return <Badge className="bg-gray-500">D</Badge>
    return <Badge variant="outline">-</Badge>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
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
          value={currentIndustry || "all"}
          onValueChange={(value) => updateParams({ industry: value === "all" ? "" : value, page: "1" })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
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
                  onClick={() => handleSort("company_name")}
                  className="flex items-center gap-1 p-0 font-medium hover:bg-transparent"
                >
                  Company
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("revenue_thousands")}
                  className="flex items-center gap-1 p-0 font-medium hover:bg-transparent"
                >
                  Revenue
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("employees")}
                  className="flex items-center gap-1 p-0 font-medium hover:bg-transparent"
                >
                  Employees
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("icp_score")}
                  className="flex items-center gap-1 p-0 font-medium hover:bg-transparent"
                >
                  ICP Score
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <p className="text-muted-foreground">No accounts found</p>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{account.company_name}</p>
                        {account.website && (
                          <a
                            href={account.website.startsWith("http") ? account.website : `https://${account.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {account.website.replace(/^https?:\/\//, "")}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{account.primary_industry || "-"}</span>
                  </TableCell>
                  <TableCell>{formatRevenue(account.revenue_thousands)}</TableCell>
                  <TableCell>{formatEmployees(account.employees)}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {[account.city, account.state, account.country]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </span>
                  </TableCell>
                  <TableCell>{getScoreBadge(account.icp_score)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount.toLocaleString()} accounts
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
