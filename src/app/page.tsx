"use client"

import type React from "react"
import { useState } from "react"
import { Upload, FileText, AlertCircle, Clock, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import ResultsDashboard from "@/components/results-dashboard"

type ProcessingStatus = "idle" | "uploading" | "processing" | "completed" | "error"
type ViewState = "upload" | "results"

interface ProcessingState {
  status: ProcessingStatus
  progress: number
  message: string
  estimatedTime?: number
  statementId?: string
}

export default function HomePage() {
  const [viewState, setViewState] = useState<ViewState>("upload")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: "idle",
    progress: 0,
    message: "",
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelection(files[0])
    }
  }

  const handleFileSelection = (file: File) => {
    setError(null)
    setProcessingState({ status: "idle", progress: 0, message: "" })

    // Validate file type
    const allowedTypes = [".pdf", ".csv", ".xlsx", ".xls"]
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

    if (!allowedTypes.includes(fileExtension)) {
      setError("Please upload a PDF, CSV, or Excel file.")
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.")
      return
    }

    setSelectedFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      // Start uploading
      setProcessingState({
        status: "uploading",
        progress: 0,
        message: "Uploading your bank statement...",
        estimatedTime: 30,
      })

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setProcessingState((prev) => ({
          ...prev,
          progress: i,
          message: i === 100 ? "Upload complete! Starting analysis..." : "Uploading your bank statement...",
        }))
      }

      // Start processing
      const mockStatementId = "stmt_" + Date.now()
      setProcessingState({
        status: "processing",
        progress: 0,
        message: "Your statements are being analyzed. Please hold on for insights.",
        estimatedTime: 120,
        statementId: mockStatementId,
      })

      // Start polling for status
      pollProcessingStatus(mockStatementId)
    } catch (err) {
      setProcessingState({
        status: "error",
        progress: 0,
        message: "Failed to upload file. Please try again.",
      })
    }
  }

  const pollProcessingStatus = async (statementId: string) => {
    const startTime = Date.now()
    const maxDuration = 120000 // 2 minutes max

    const poll = async () => {
      try {
        // Simulate API call to check status
        // In real implementation: const response = await fetch(`/api/v1/statements/${statementId}/status`)

        const elapsed = Date.now() - startTime
        const progress = Math.min((elapsed / maxDuration) * 100, 95)

        if (elapsed < maxDuration) {
          const remainingTime = Math.ceil((maxDuration - elapsed) / 1000)

          setProcessingState((prev) => ({
            ...prev,
            progress,
            estimatedTime: remainingTime,
            message:
              progress < 30
                ? "Extracting transaction data..."
                : progress < 60
                  ? "Categorizing transactions with AI..."
                  : progress < 90
                    ? "Generating insights and trends..."
                    : "Finalizing your analysis...",
          }))

          // Continue polling
          setTimeout(poll, 2500)
        } else {
          // Processing complete
          setProcessingState({
            status: "completed",
            progress: 100,
            message: "Analysis complete! Your financial insights are ready.",
            statementId,
          })
        }
      } catch (err) {
        setProcessingState({
          status: "error",
          progress: 0,
          message: "Processing failed. Please try uploading again.",
        })
      }
    }

    poll()
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setError(null)
    setProcessingState({ status: "idle", progress: 0, message: "" })
    setViewState("upload")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const handleViewResults = () => {
    setViewState("results")
  }

  const handleDeleteStatement = () => {
    // TODO: Implement actual delete API call
    console.log("Deleting statement:", processingState.statementId)
    resetUpload()
  }

  const mockAnalysis = {
    statementId: processingState.statementId || "stmt_demo",
    fileName: selectedFile?.name || "bank_statement_march_2024.pdf",
    uploadDate: new Date().toISOString(),
    statementPeriod: { start: "2024-03-01", end: "2024-03-31" },
    processingTime: 45,
    summary: {
      totalIncome: 5420.5,
      totalExpenses: 4180.25,
      netFlow: 1240.25,
      transactionCount: 127,
      averageTransaction: 42.68,
    },
    categoryBreakdown: [
      { category: "Food & Dining", amount: 1250.3, percentage: 29.9 },
      { category: "Transportation", amount: 890.45, percentage: 21.3 },
      { category: "Shopping", amount: 675.2, percentage: 16.1 },
      { category: "Utilities", amount: 420.8, percentage: 10.1 },
      { category: "Entertainment", amount: 315.6, percentage: 7.5 },
      { category: "Healthcare", amount: 280.9, percentage: 6.7 },
      { category: "Other", amount: 347.0, percentage: 8.4 },
    ],
    monthlyTrends: [
      { month: "Jan", income: 5200, expenses: 4100 },
      { month: "Feb", income: 5350, expenses: 3950 },
      { month: "Mar", income: 5420, expenses: 4180 },
    ],
    topMerchants: [
      { merchant: "Whole Foods Market", amount: 485.6, transactions: 12 },
      { merchant: "Shell Gas Station", amount: 320.4, transactions: 8 },
      { merchant: "Amazon", amount: 275.8, transactions: 15 },
      { merchant: "Starbucks", amount: 156.9, transactions: 18 },
      { merchant: "Netflix", amount: 15.99, transactions: 1 },
    ],
    insights: [
      {
        type: "positive" as const,
        title: "Strong Savings Rate",
        description: "You saved 22.9% of your income this month, which is above the recommended 20%.",
      },
      {
        type: "negative" as const,
        title: "High Food Spending",
        description: "Food & dining represents 29.9% of expenses. Consider meal planning to reduce costs.",
      },
      {
        type: "neutral" as const,
        title: "Consistent Income",
        description: "Your income has been stable over the past 3 months with slight growth.",
      },
    ],
    recurringTransactions: [
      { merchant: "Netflix", amount: 15.99, frequency: "Monthly", nextExpected: "2024-04-15" },
      { merchant: "Spotify", amount: 9.99, frequency: "Monthly", nextExpected: "2024-04-10" },
      { merchant: "City Electric", amount: 120.5, frequency: "Monthly", nextExpected: "2024-04-27" },
      { merchant: "Rent Payment", amount: 1200.0, frequency: "Monthly", nextExpected: "2024-04-01" },
    ],
    unusualTransactions: [
      { id: "unusual_1", reason: "Amount 3x higher than usual", amount: 450.0, description: "Large grocery purchase" },
      { id: "unusual_2", reason: "New merchant category", amount: 89.99, description: "Electronics store purchase" },
      { id: "unusual_3", reason: "Weekend ATM withdrawal", amount: 200.0, description: "Cash withdrawal at 2 AM" },
    ],
    transactions: [
      {
        id: "1",
        date: "2024-03-31",
        description: "Salary Deposit",
        amount: 5420.5,
        category: "Income",
        merchant: "Employer Inc",
        type: "credit" as const,
      },
      {
        id: "2",
        date: "2024-03-30",
        description: "Whole Foods Market",
        amount: -85.4,
        category: "Food & Dining",
        merchant: "Whole Foods Market",
        type: "debit" as const,
      },
      {
        id: "3",
        date: "2024-03-29",
        description: "Shell Gas Station",
        amount: -45.2,
        category: "Transportation",
        merchant: "Shell Gas Station",
        type: "debit" as const,
      },
      {
        id: "4",
        date: "2024-03-28",
        description: "Amazon Purchase",
        amount: -125.99,
        category: "Shopping",
        merchant: "Amazon",
        type: "debit" as const,
      },
      {
        id: "5",
        date: "2024-03-27",
        description: "Electric Bill",
        amount: -120.5,
        category: "Utilities",
        merchant: "City Electric",
        type: "debit" as const,
        isRecurring: true,
      },
      {
        id: "6",
        date: "2024-03-26",
        description: "Large Grocery Purchase",
        amount: -450.0,
        category: "Food & Dining",
        merchant: "Whole Foods Market",
        type: "debit" as const,
        isUnusual: true,
        unusualReason: "Amount 3x higher than usual",
      },
      {
        id: "7",
        date: "2024-03-25",
        description: "Netflix Subscription",
        amount: -15.99,
        category: "Entertainment",
        merchant: "Netflix",
        type: "debit" as const,
        isRecurring: true,
      },
    ],
  }

  const renderProcessingStatus = () => {
    if (processingState.status === "idle") return null

    return (
      <Card className="mt-6 border-cyan-200 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex items-center gap-3">
              {processingState.status === "uploading" && <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />}
              {processingState.status === "processing" && <Clock className="w-5 h-5 text-violet-600" />}
              {processingState.status === "completed" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {processingState.status === "error" && <AlertCircle className="w-5 h-5 text-red-600" />}

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 font-sans">
                  {processingState.status === "uploading" && "Uploading File"}
                  {processingState.status === "processing" && "Analyzing Statement"}
                  {processingState.status === "completed" && "Analysis Complete"}
                  {processingState.status === "error" && "Processing Error"}
                </h3>
                <p className="text-sm text-slate-600">{processingState.message}</p>
              </div>

              {processingState.estimatedTime && processingState.status !== "completed" && (
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    ~{formatTime(processingState.estimatedTime)} remaining
                  </p>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {(processingState.status === "uploading" || processingState.status === "processing") && (
              <div className="space-y-2">
                <Progress value={processingState.progress} className="h-2" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{Math.round(processingState.progress)}% complete</span>
                  {selectedFile && <span>{selectedFile.name}</span>}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {processingState.status === "completed" && (
                <Button className="bg-cyan-800 hover:bg-cyan-700 text-white" onClick={handleViewResults}>
                  View Results
                </Button>
              )}

              {(processingState.status === "error" || processingState.status === "completed") && (
                <Button
                  variant="outline"
                  onClick={resetUpload}
                  className="border-cyan-200 text-cyan-800 hover:bg-cyan-50 bg-transparent"
                >
                  Upload Another Statement
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (viewState === "results") {
    return <ResultsDashboard analysis={mockAnalysis} onBack={resetUpload} onDelete={handleDeleteStatement} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
      {/* Header */}
      <header className="border-b border-cyan-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-800 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-cyan-800 font-sans">FinSight</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 font-sans">
              Financial Insights at a Glance
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-sans max-w-2xl mx-auto">
              Upload your bank statements securely to begin your financial analysis.
            </p>
          </div>

          {/* Upload Card - Hide when processing */}
          {processingState.status === "idle" && (
            <Card className="border-2 border-dashed border-cyan-200 bg-white/60 backdrop-blur-sm mb-6">
              <CardContent className="p-4 sm:p-8">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 sm:p-12 text-center transition-all duration-200 ${
                    dragActive ? "border-cyan-400 bg-cyan-50" : "border-cyan-200 hover:border-cyan-300 hover:bg-cyan-25"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,.csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-cyan-100 rounded-full flex items-center justify-center">
                      <Upload className="w-6 sm:w-8 h-6 sm:h-8 text-cyan-600" />
                    </div>

                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-base sm:text-lg font-semibold text-slate-800 font-sans break-all">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-base sm:text-lg font-semibold text-slate-800 font-sans">
                          Drop your bank statement here
                        </p>
                        <p className="text-sm sm:text-base text-slate-500">or click to browse files</p>
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-slate-400">Supports PDF, CSV, Excel files up to 10MB</p>
                  </div>
                </div>

                {error && (
                  <Alert className="mt-4 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {selectedFile && !error && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      onClick={handleUpload}
                      className="bg-cyan-800 hover:bg-cyan-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold transition-all duration-200 hover:shadow-lg"
                    >
                      Analyze Statement
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Processing Status Display */}
          {renderProcessingStatus()}

          {/* Features Preview - Hide during processing */}
          {processingState.status === "idle" && (
            <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-white/60 backdrop-blur-sm border-cyan-100">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 font-sans text-sm sm:text-base">
                    Smart Categorization
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    AI-powered transaction categorization for better insights
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-cyan-100">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 font-sans text-sm sm:text-base">Spending Trends</h3>
                  <p className="text-xs sm:text-sm text-slate-600">Visualize your spending patterns over time</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-cyan-100 sm:col-span-2 lg:col-span-1">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <FileText className="w-5 sm:w-6 h-5 sm:h-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2 font-sans text-sm sm:text-base">
                    Financial Insights
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Get personalized recommendations to optimize your finances
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
