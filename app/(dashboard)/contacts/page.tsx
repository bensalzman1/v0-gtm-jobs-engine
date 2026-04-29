import { createClient } from "@/lib/supabase/server"
import { ContactsTable } from "@/components/contacts/contacts-table"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import Link from "next/link"

interface SearchParams {
  page?: string
  search?: string
  persona?: string
  sort?: string
  order?: string
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const page = parseInt(params.page ?? "1")
  const pageSize = 25
  const search = params.search ?? ""
  const persona = params.persona ?? ""
  const sortField = params.sort ?? "full_name"
  const sortOrder = params.order === "desc" ? false : true

  const supabase = await createClient()

  // Build query with account join
  let query = supabase
    .from("contacts")
    .select("*, accounts(company_name)", { count: "exact" })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,job_title.ilike.%${search}%`)
  }

  if (persona) {
    query = query.eq("persona", persona)
  }

  query = query
    .order(sortField, { ascending: sortOrder })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const { data: contacts, count, error } = await query

  // Get unique personas for filter
  const { data: personas } = await supabase
    .from("contacts")
    .select("persona")
    .not("persona", "is", null)
    .limit(100)

  const uniquePersonas = [...new Set(personas?.map(p => p.persona).filter(Boolean))]

  if (error) {
    console.error("Error fetching contacts:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Contacts</h1>
          <p className="text-muted-foreground">
            {count?.toLocaleString() ?? 0} contacts in your database
          </p>
        </div>
        <Button asChild>
          <Link href="/upload?type=contacts">
            <Upload className="mr-2 h-4 w-4" />
            Upload CSV
          </Link>
        </Button>
      </div>

      <ContactsTable
        contacts={contacts ?? []}
        totalCount={count ?? 0}
        page={page}
        pageSize={pageSize}
        personas={uniquePersonas}
        currentSearch={search}
        currentPersona={persona}
        currentSort={sortField}
        currentOrder={sortOrder ? "asc" : "desc"}
      />
    </div>
  )
}
