"use client"
import { useState } from "react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Filter,
  Search,
  Trash2,
  Download,
  AlertTriangle,
  Repeat,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts"

interface ResultsDashboardProps {
  analysis: any
  onBack: () => void
  onDelete: () => void
}

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  merchant: string
  type: string
  amount: number
  isRecurring: boolean
  isUnusual: boolean
}

interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
}

interface Merchant {
  merchant: string
  transactions: number
  amount: number
}

interface AdvancedFilters {
  transactionType: "all" | "debit" | "credit"
  amountRange: { min: number; max: number }
  showRecurring: boolean
  showUnusual: boolean
}

const formatDate = (date: string) => new Date(date).toLocaleDateString()
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`

const chartConfig = {
  income: { color: "#34D399" },
  expenses: { color: "#EF4444" },
  netFlow: { color: "#60A5FA" },
}

export default function ResultsDashboard({ analysis, onBack, onDelete }: ResultsDashboardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [categories, setCategories] = useState(["Category1", "Category2", "Category3"])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    transactionType: "all",
    amountRange: { min: 0, max: 1000 },
    showRecurring: false,
    showUnusual: false,
  })

  const lineChartData = [
    { month: "Jan", income: 2000, expenses: 1500, netFlow: 500 },
    { month: "Feb", income: 2500, expenses: 2000, netFlow: 500 },
    { month: "Mar", income: 3000, expenses: 2500, netFlow: 500 },
  ]

  const pieChartData = [
    { name: "Category1", value: 400, fill: "#34D399" },
    { name: "Category2", value: 300, fill: "#EF4444" },
    { name: "Category3", value: 300, fill: "#60A5FA" },
  ]

  const barChartData = [
    { merchant: "Merchant1", amount: 1000 },
    { merchant: "Merchant2", amount: 800 },
    { merchant: "Merchant3", amount: 600 },
  ]

  const hasActiveFilters = () => {
    return (
      advancedFilters.transactionType !== "all" ||
      advancedFilters.amountRange.min !== 0 ||
      advancedFilters.amountRange.max !== 1000 ||
      advancedFilters.showRecurring ||
      advancedFilters.showUnusual
    )
  }

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      transactionType: "all",
      amountRange: { min: 0, max: 1000 },
      showRecurring: false,
      showUnusual: false,
    })
  }

  const filteredTransactions = analysis.transactions.filter((transaction: Transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter
    const matchesType =
      advancedFilters.transactionType === "all" || transaction.type === advancedFilters.transactionType
    const matchesAmountRange =
      transaction.amount >= advancedFilters.amountRange.min && transaction.amount <= advancedFilters.amountRange.max
    const matchesRecurring = !advancedFilters.showRecurring || transaction.isRecurring
    const matchesUnusual = !advancedFilters.showUnusual || transaction.isUnusual

    return matchesSearch && matchesCategory && matchesType && matchesAmountRange && matchesRecurring && matchesUnusual
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
      {/* Header */}
      <header className="border-b border-cyan-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="text-cyan-800 hover:bg-cyan-50">
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Upload</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-cyan-800 rounded-lg flex items-center justify-center">
                  <FileText className="w-3 sm:w-5 h-3 sm:h-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-cyan-800 font-sans">FinSight</h1>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-200 text-cyan-800 hover:bg-cyan-50 bg-transparent hidden sm:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="mx-4 sm:mx-0">
                  <DialogHeader>
                    <DialogTitle>Delete Statement Analysis</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this analysis? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="w-full sm:w-auto">
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        onDelete()
                        setShowDeleteDialog(false)
                      }}
                      className="w-full sm:w-auto"
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Statement Info Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 font-sans">Financial Analysis</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800 w-fit">
              Analysis Complete
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{analysis.fileName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {formatDate(analysis.statementPeriod.start)} - {formatDate(analysis.statementPeriod.end)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Processed in {analysis.processingTime}s</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 flex-shrink-0" />
              <span>{analysis.summary.transactionCount} transactions</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 text-green-600" />
                <span className="hidden sm:inline">Total Income</span>
                <span className="sm:hidden">Income</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-green-600 font-sans">
                {formatCurrency(analysis.summary.totalIncome)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-2">
                <TrendingDown className="w-3 sm:w-4 h-3 sm:h-4 text-red-600" />
                <span className="hidden sm:inline">Total Expenses</span>
                <span className="sm:hidden">Expenses</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-red-600 font-sans">
                {formatCurrency(analysis.summary.totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-2">
                <DollarSign className="w-3 sm:w-4 h-3 sm:h-4 text-cyan-600" />
                <span className="hidden sm:inline">Net Flow</span>
                <span className="sm:hidden">Net</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div
                className={`text-lg sm:text-2xl font-bold font-sans ${analysis.summary.netFlow >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {analysis.summary.netFlow >= 0 ? "+" : ""}
                {formatCurrency(analysis.summary.netFlow)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 flex items-center gap-2">
                <PieChart className="w-3 sm:w-4 h-3 sm:h-4 text-violet-600" />
                <span className="hidden sm:inline">Avg Transaction</span>
                <span className="sm:hidden">Avg</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg sm:text-2xl font-bold text-slate-800 font-sans">
                {formatCurrency(analysis.summary.averageTransaction)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trends Chart */}
        <Card className="mb-6 sm:mb-8 bg-white/80 backdrop-blur-sm border-cyan-100">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
            Monthly Spending Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value, name) => [formatCurrency(Number(value)), name]} />}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke={chartConfig.income.color}
                  strokeWidth={3}
                  dot={{ fill: chartConfig.income.color, strokeWidth: 2, r: 4 }}
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke={chartConfig.expenses.color}
                  strokeWidth={3}
                  dot={{ fill: chartConfig.expenses.color, strokeWidth: 2, r: 4 }}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="netFlow"
                  stroke={chartConfig.netFlow.color}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: chartConfig.netFlow.color, strokeWidth: 2, r: 3 }}
                  name="Net Flow"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

        {/* Enhanced Insights Panel with Recurring & Unusual Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {analysis.insights.map((insight: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-slate-50">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        insight.type === "positive"
                          ? "bg-green-500"
                          : insight.type === "negative"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <h4 className="font-semibold text-slate-800 font-sans text-sm sm:text-base">{insight.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans flex items-center gap-2">
                <Repeat className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                Recurring Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recurringTransactions?.map((recurring: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-700 truncate">{recurring.merchant}</div>
                      <div className="text-xs text-slate-500">{recurring.frequency}</div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-sm font-semibold text-slate-800">{formatCurrency(recurring.amount)}</div>
                      <div className="text-xs text-slate-500">Next: {formatDate(recurring.nextExpected)}</div>
                    </div>
                  </div>
                )) || <div className="text-center py-4 text-slate-500 text-sm">No recurring transactions detected</div>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans flex items-center gap-2">
                <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 text-orange-600" />
                Unusual Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.unusualTransactions?.map((unusual: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                    <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-700 truncate">{unusual.description}</div>
                      <div className="text-xs text-slate-500 mt-1">{unusual.reason}</div>
                      <div className="text-sm font-semibold text-orange-700 mt-1">{formatCurrency(unusual.amount)}</div>
                    </div>
                  </div>
                )) || <div className="text-center py-4 text-slate-500 text-sm">No unusual transactions detected</div>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] lg:h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent formatter={(value, name) => [formatCurrency(Number(value)), name]} />
                      }
                    />
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>

              {/* Legend */}
              <div className="space-y-2 sm:space-y-3">
                {analysis.categoryBreakdown.map((category: CategoryBreakdown, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: `hsl(${(index * 45) % 360}, 65%, 55%)`,
                        }}
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-xs sm:text-sm font-semibold text-slate-800">
                        {formatCurrency(category.amount)}
                      </div>
                      <div className="text-xs text-slate-500">{category.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">Top Merchants</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[180px] sm:h-[200px] lg:h-[220px] w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="merchant"
                    stroke="#64748b"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={40}
                    interval={0}
                  />
                  <YAxis stroke="#64748b" fontSize={10} tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [
                          name === "amount" ? formatCurrency(Number(value)) : value,
                          name === "amount" ? "Total Spent" : "Transactions",
                        ]}
                      />
                    }
                  />
                  <Bar dataKey="amount" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <div className="space-y-2">
              {analysis.topMerchants.slice(0, 3).map((merchant: Merchant, index: number) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-slate-700 truncate">{merchant.merchant}</div>
                    <div className="text-xs text-slate-500">{merchant.transactions} transactions</div>
                  </div>
                  <div className="font-semibold text-slate-800 ml-2">{formatCurrency(merchant.amount)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Enhanced Transactions Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
                Transaction History
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`${hasActiveFilters() ? "border-violet-300 bg-violet-50 text-violet-700" : "border-slate-200"}`}
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Advanced</span>
                        {hasActiveFilters() && <div className="w-2 h-2 bg-violet-600 rounded-full ml-1 sm:ml-2" />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-slate-800">Advanced Filters</h4>
                          {hasActiveFilters() && (
                            <Button variant="ghost" size="sm" onClick={clearAdvancedFilters}>
                              <X className="w-4 h-4 mr-1" />
                              Clear
                            </Button>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Transaction Type</Label>
                            <Select
                              value={advancedFilters.transactionType}
                              onValueChange={(value: "all" | "debit" | "credit") =>
                                setAdvancedFilters((prev) => ({ ...prev, transactionType: value }))
                              }
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="debit">Expenses Only</SelectItem>
                                <SelectItem value="credit">Income Only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-sm font-medium">Amount Range</Label>
                            <div className="mt-2 px-2">
                              <Slider
                                value={[advancedFilters.amountRange.min, advancedFilters.amountRange.max]}
                                onValueChange={([min, max]) =>
                                  setAdvancedFilters((prev) => ({ ...prev, amountRange: { min, max } }))
                                }
                                max={1000}
                                min={0}
                                step={10}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-slate-500 mt-1">
                                <span>${advancedFilters.amountRange.min}</span>
                                <span>${advancedFilters.amountRange.max}+</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={advancedFilters.showRecurring}
                                onChange={(e) =>
                                  setAdvancedFilters((prev) => ({ ...prev, showRecurring: e.target.checked }))
                                }
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm">Recurring only</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={advancedFilters.showUnusual}
                                onChange={(e) =>
                                  setAdvancedFilters((prev) => ({ ...prev, showUnusual: e.target.checked }))
                                }
                                className="rounded border-slate-300"
                              />
                              <span className="text-sm">Unusual only</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm">
                      Date
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm">
                      Description
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm hidden md:table-cell">
                      Merchant
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm">
                      Amount
                    </th>
                    <th className="text-center py-3 px-2 sm:px-4 font-semibold text-slate-700 text-xs sm:text-sm hidden lg:table-cell">
                      Flags
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction: Transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-800 font-medium">
                        <div className="truncate max-w-[150px] sm:max-w-none">{transaction.description}</div>
                        <div className="sm:hidden text-xs text-slate-500 mt-1">
                          {transaction.category} • {transaction.merchant}
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-slate-600 hidden md:table-cell">
                        <div className="truncate max-w-[120px]">{transaction.merchant}</div>
                      </td>
                      <td
                        className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-right ${
                          transaction.type === "credit" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {transaction.type === "credit" ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {transaction.isRecurring && (
                            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
                              <Repeat className="w-3 h-3 mr-1" />
                              Recurring
                            </Badge>
                          )}
                          {transaction.isUnusual && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 bg-orange-50">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Unusual
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-slate-500">No transactions found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
