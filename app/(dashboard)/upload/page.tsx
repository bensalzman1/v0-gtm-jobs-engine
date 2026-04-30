"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Users, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

type UploadType = "accounts" | "contacts"

function UploadContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultType = searchParams.get("type") === "contacts" ? "contacts" : "accounts"
  
  const [uploadType, setUploadType] = useState<UploadType>(defaultType)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", uploadType)

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message, count: data.count })
        setFile(null)
        // Reset file input
        const input = document.getElementById("csv-upload") as HTMLInputElement
        if (input) input.value = ""
      } else {
        setResult({ success: false, message: data.error || "Upload failed" })
      }
    } catch {
      setResult({ success: false, message: "An error occurred during upload" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload CSV</h1>
        <p className="text-muted-foreground">
          Import ZoomInfo account and contact data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <button
          onClick={() => setUploadType("accounts")}
          className={`rounded-lg border-2 p-6 text-left transition-colors ${
            uploadType === "accounts"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              uploadType === "accounts" ? "bg-primary" : "bg-muted"
            }`}>
              <Building2 className={`h-6 w-6 ${
                uploadType === "accounts" ? "text-primary-foreground" : "text-muted-foreground"
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Accounts</h3>
              <p className="text-sm text-muted-foreground">Company firmographic data</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setUploadType("contacts")}
          className={`rounded-lg border-2 p-6 text-left transition-colors ${
            uploadType === "contacts"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              uploadType === "contacts" ? "bg-primary" : "bg-muted"
            }`}>
              <Users className={`h-6 w-6 ${
                uploadType === "contacts" ? "text-primary-foreground" : "text-muted-foreground"
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Contacts</h3>
              <p className="text-sm text-muted-foreground">Individual contact data</p>
            </div>
          </div>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload {uploadType === "accounts" ? "Accounts" : "Contacts"} CSV
          </CardTitle>
          <CardDescription>
            {uploadType === "accounts"
              ? "Expected columns: ZoomInfo Company ID, Company Name, Website, Primary Industry, Revenue (in 000s), Employees, City, State, Country"
              : "Expected columns: ZoomInfo Contact ID, First Name, Last Name, Job Title, Management Level, Job Function, Department, Email, Company Name"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <input
              id="csv-upload"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
            >
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium text-foreground">
                {file ? file.name : "Drop your CSV file here or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground">CSV files only, max 50MB</p>
              <Button variant="outline" className="pointer-events-none mt-4">
                Select File
              </Button>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          )}

          {result && (
            <div className={`flex items-start gap-3 rounded-lg p-4 ${
              result.success
                ? "bg-emerald-50 dark:bg-emerald-950"
                : "bg-red-50 dark:bg-red-950"
            }`}>
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <div>
                <p className={`font-medium ${
                  result.success
                    ? "text-emerald-800 dark:text-emerald-200"
                    : "text-red-800 dark:text-red-200"
                }`}>
                  {result.success ? "Upload Successful" : "Upload Failed"}
                </p>
                <p className={`text-sm ${
                  result.success
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-red-700 dark:text-red-300"
                }`}>
                  {result.message}
                </p>
                {result.success && (
                  <Button
                    variant="link"
                    className="mt-2 h-auto p-0"
                    onClick={() => router.push(`/${uploadType}`)}
                  >
                    View {uploadType} &rarr;
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload CSV</h1>
          <p className="text-muted-foreground">Import ZoomInfo account and contact data</p>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <UploadContent />
    </Suspense>
  )
}
