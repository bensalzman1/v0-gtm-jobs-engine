import { createClient } from "@/lib/supabase/server"
import { AccountsTable } from "@/components/accounts/accounts-table"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"

interface SearchParams {
  page?: string
  search?: string
  industry?: string
  sort?: string
  order?: string
}

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const pageSize = 25
  const search = params.search ?? ""
  const industry = params.industry ?? ""
  const sortField = params.sort ?? "company_name"
  const sortOrder = params.order === "desc" ? false : true

  const supabase = await createClient()

  // Build query
  let query = supabase
    .from("accounts")
    .select("*", { count: "exact" })

  if (search) {
    query = query.ilike("company_name", `%${search}%`)
  }

  if (industry) {
    query = query.eq("primary_industry", industry)
  }

  query = query
    .order(sortField, { ascending: sortOrder })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data: accounts, count, error } = await query

  // Get unique industries for filter
  const { data: industries } = await supabase
    .from("accounts")
    .select("primary_industry")
    .not("primary_industry", "is", null)
    .limit(100)

  const uniqueIndustries = [...new Set(industries?.map(i => i.primary_industry).filter(Boolean))]

  if (error) {
    console.error("Error fetching accounts:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Accounts</h1>
          <p className="text-muted-foreground">
            {count?.toLocaleString() ?? 0} accounts in your database
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Link>
        </Button>
      </div>

      <AccountsTable
        accounts={accounts ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        industries={uniqueIndustries}
        currentSearch={search}
        currentIndustry={industry}
        currentSort={sortField}
        currentOrder={sortOrder ? "asc" : "desc"}
      />
    </div>
  )
}
