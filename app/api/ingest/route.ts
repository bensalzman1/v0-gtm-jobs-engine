import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Papa from "papaparse"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!["accounts", "contacts"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const text = await file.text()
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, "_"),
    })

    if (errors.length > 0) {
      console.error("CSV parsing errors:", errors)
    }

    const supabase = await createClient()

    if (type === "accounts") {
      const accounts = (data as Record<string, string>[]).map((row) => ({
        zoominfo_company_id: row.zoominfo_company_id || row.company_id || null,
        company_name: row.company_name || row.company || "Unknown",
        website: row.website || row.company_website || null,
        primary_industry: row.primary_industry || row.industry || null,
        primary_sub_industry: row.primary_sub_industry || row.sub_industry || null,
        revenue_thousands: row.revenue_in_000s || row.revenue_thousands || row.revenue
          ? parseFloat((row.revenue_in_000s || row.revenue_thousands || row.revenue).replace(/[^0-9.-]/g, "")) || null
          : null,
        employees: row.employees || row.employee_count
          ? parseInt((row.employees || row.employee_count).replace(/[^0-9]/g, ""), 10) || null
          : null,
        city: row.city || row.company_city || null,
        state: row.state || row.company_state || null,
        country: row.country || row.company_country || null,
      }))

      // Insert in batches of 500
      const batchSize = 500
      let insertedCount = 0

      for (let i = 0; i < accounts.length; i += batchSize) {
        const batch = accounts.slice(i, i + batchSize)
        const { error } = await supabase.from("accounts").upsert(batch, {
          onConflict: "zoominfo_company_id",
          ignoreDuplicates: false,
        })

        if (error) {
          console.error("Error inserting accounts batch:", error)
          return NextResponse.json(
            { error: `Failed to insert accounts: ${error.message}` },
            { status: 500 }
          )
        }
        insertedCount += batch.length
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${insertedCount} accounts`,
        count: insertedCount,
      })
    } else {
      // Contacts
      // First, we need to look up account IDs by company name
      const companyNames = [...new Set((data as Record<string, string>[]).map(row => 
        row.company_name || row.company || ""
      ).filter(Boolean))]

      // Get existing accounts
      const { data: existingAccounts } = await supabase
        .from("accounts")
        .select("id, company_name")
        .in("company_name", companyNames.slice(0, 1000)) // Limit for query

      const accountMap = new Map(
        existingAccounts?.map(a => [a.company_name.toLowerCase(), a.id]) ?? []
      )

      const contacts = (data as Record<string, string>[]).map((row) => {
        const companyName = row.company_name || row.company || ""
        const accountId = accountMap.get(companyName.toLowerCase()) || null

        return {
          zoominfo_contact_id: row.zoominfo_contact_id || row.contact_id || null,
          account_id: accountId,
          first_name: row.first_name || null,
          last_name: row.last_name || null,
          full_name: row.full_name || `${row.first_name || ""} ${row.last_name || ""}`.trim() || null,
          job_title: row.job_title || row.title || null,
          management_level: row.management_level || null,
          job_function: row.job_function || null,
          department: row.department || null,
          email: row.email || row.email_address || null,
        }
      })

      // Insert in batches
      const batchSize = 500
      let insertedCount = 0

      for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize)
        const { error } = await supabase.from("contacts").upsert(batch, {
          onConflict: "zoominfo_contact_id",
          ignoreDuplicates: false,
        })

        if (error) {
          console.error("Error inserting contacts batch:", error)
          return NextResponse.json(
            { error: `Failed to insert contacts: ${error.message}` },
            { status: 500 }
          )
        }
        insertedCount += batch.length
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${insertedCount} contacts`,
        count: insertedCount,
      })
    }
  } catch (error) {
    console.error("Ingest error:", error)
    return NextResponse.json(
      { error: "An error occurred during import" },
      { status: 500 }
    )
  }
}
