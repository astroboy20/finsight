import ResultsDashboard from "@/components/results-dashboard"

export interface AnalysisData {
  statementId: string
  fileName: string
  uploadDate: string
  statementPeriod: { start: string; end: string }
  processingTime: number
  summary: {
    totalIncome: number
    totalExpenses: number
    netFlow: number
    transactionCount: number
    averageTransaction: number
  }
  categoryBreakdown: Array<{
    category: string
    amount: number
    percentage: number
  }>
  monthlyTrends: Array<{
    month: string
    income: number
    expenses: number
  }>
  topMerchants: Array<{
    merchant: string
    amount: number
    transactions: number
  }>
  insights: Array<{
    type: "positive" | "negative" | "neutral"
    title: string
    description: string
  }>
  recurringTransactions: Array<{
    merchant: string
    amount: number
    frequency: string
    nextExpected: string
  }>
  unusualTransactions: Array<{
    id: string
    reason: string
    amount: number
    description: string
    date:any
  }>
  transactions: Array<{
    id: string
    date: string
    description: string
    amount: number
    category: string
    merchant: string
    type: "credit" | "debit"
    isRecurring?: boolean
    isUnusual?: boolean
    unusualReason?: string
  }>
}

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params

  return (
    <div>
      <ResultsDashboard statementId={slug} />
    </div>
  )
}

export default Page
