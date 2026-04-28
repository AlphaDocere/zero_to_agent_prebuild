'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

interface CsvUploaderProps {
  onUploadComplete?: (count: number) => void
}

export function CsvUploader({ onUploadComplete }: CsvUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setResult({ success: true, message: data.message })
        onUploadComplete?.(data.count)
      } else {
        setResult({ success: false, message: data.error || 'Upload failed' })
      }
    } catch {
      setResult({ success: false, message: 'Failed to upload file' })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Participants</CardTitle>
        <CardDescription>
          Upload a CSV file from Luma to import participant data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Spinner className="mr-2" />
              Uploading...
            </>
          ) : (
            'Select CSV File'
          )}
        </Button>

        {result && (
          <div
            className={`p-3 rounded-md text-sm ${
              result.success
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Expected CSV columns:</p>
          <p>name, first_name, last_name, email, phone_number, and Luma registration questions</p>
        </div>
      </CardContent>
    </Card>
  )
}
