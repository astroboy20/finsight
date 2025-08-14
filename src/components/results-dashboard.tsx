"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  Trash2,
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  Share,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisData } from "@/app/view-analysis/[slug]/page";
import { toast } from "sonner";

interface ResultsDashboardProps {
  statementId: string;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString();
const formatCurrency = (amount: number) =>
  `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const chartConfig = {
  income: { color: "#34D399" },
  expenses: { color: "#EF4444" },
  netFlow: { color: "#60A5FA" },
};

export default function ResultsDashboard({
  statementId,
}: ResultsDashboardProps) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAnalysisData = async (
    statementId: string
  ): Promise<AnalysisData> => {
    const response = await fetch(
      `https://fin-trackerr-9c402fb58590.herokuapp.com/v1/statements/${statementId}/analysis`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch analysis: ${response.status} - ${response.statusText}`
      );
    }

    const apiData = await response.json();

    return {
      statementId: apiData.data.statement?.id || statementId,
      fileName: apiData.data.statement?.fileName || "Unknown File",
      uploadDate: new Date().toISOString(),
      statementPeriod: {
        start:
          apiData.data.statement?.statementPeriod?.startDate ||
          apiData.data.analysis?.summary?.statementPeriod?.startDate ||
          "2024-01-01",
        end:
          apiData.data.statement?.statementPeriod?.endDate ||
          apiData.data.analysis?.summary?.statementPeriod?.endDate ||
          "2024-01-31",
      },
      processingTime: Math.round(
        (apiData.data.statement?.processingTime || 0) / 1000
      ),
      summary: {
        totalIncome:
          apiData.data.summary?.totalIncome ||
          apiData.data.analysis?.summary?.totalIncome ||
          0,
        totalExpenses:
          apiData.data.summary?.totalExpenses ||
          apiData.data.analysis?.summary?.totalExpenses ||
          0,
        netFlow:
          apiData.data.summary?.netCashFlow ||
          apiData.data.analysis?.summary?.netCashFlow ||
          0,
        transactionCount:
          apiData.data.summary?.totalTransactions ||
          apiData.data.analysis?.summary?.totalTransactions ||
          0,
        averageTransaction: apiData.data.summary?.averageTransactionAmount || 0,
      },
      categoryBreakdown:
        apiData.data.analysis?.categories?.map((cat: any) => ({
          category: cat.name,
          amount: cat.amount,
          percentage: cat.percentage,
        })) || [],
      monthlyTrends:
        apiData.data.analysis?.monthlyBreakdown?.map((month: any) => ({
          month: new Date(month.month + "-01").toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
          income: month.income,
          expenses: month.expenses,
          netFlow: month.netFlow,
        })) || [],
      topMerchants:
        apiData.data.analysis?.topMerchants?.map((merchant: any) => ({
          merchant: merchant.name,
          amount: merchant.amount,
          transactions: merchant.transactionCount,
        })) || [],
      insights:
        apiData.data.analysis?.insights?.map(
          (insight: string, index: number) => ({
            type: "neutral" as const,
            title: `Financial Insight`,
            description: insight,
          })
        ) || [],
      recurringTransactions:
        apiData.data.analysis?.patterns?.recurringPayments?.map(
          (payment: any) => ({
            merchant: payment.merchant,
            amount: payment.amount,
            frequency: payment.frequency,
            nextExpected: payment.lastDate,
          })
        ) || [],
      unusualTransactions:
        apiData.data.analysis?.patterns?.unusualTransactions?.map(
          (transaction: any) => ({
            id: `unusual_${Math.random()}`,
            reason: transaction.reason,
            amount: transaction.amount,
            description: transaction.description,
            date: transaction.date,
          })
        ) || [],
      transactions: [], // Transactions would need separate endpoint
    };
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(8, 145, 178);
      doc.text("FinSight Analysis Report", 20, 30);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`File: ${analysis?.fileName}`, 20, 50);
      doc.text(
        `Period: ${formatDate(
          analysis?.statementPeriod.start || ""
        )} to ${formatDate(analysis?.statementPeriod.end || "")}`,
        20,
        60
      );
      doc.text(`Processing Time: ${analysis?.processingTime}s`, 20, 70);

      doc.setFontSize(16);
      doc.setTextColor(8, 145, 178);
      doc.text("Financial Summary", 20, 90);

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Total Income: ${formatCurrency(analysis?.summary.totalIncome || 0)}`,
        20,
        105
      );
      doc.text(
        `Total Expenses: ${formatCurrency(
          analysis?.summary.totalExpenses || 0
        )}`,
        20,
        115
      );
      doc.text(
        `Net Flow: ${formatCurrency(analysis?.summary.netFlow || 0)}`,
        20,
        125
      );
      doc.text(
        `Total Transactions: ${analysis?.summary.transactionCount || 0}`,
        20,
        135
      );

      if (analysis?.insights.length) {
        doc.setFontSize(16);
        doc.setTextColor(8, 145, 178);
        doc.text("AI Insights", 20, 155);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        let yPos = 170;
        analysis.insights.slice(0, 5).forEach((insight, index) => {
          const lines = doc.splitTextToSize(`• ${insight.description}`, 170);
          doc.text(lines, 20, yPos);
          yPos += lines.length * 5 + 5;
        });
      }

      if (analysis?.topMerchants.length) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(8, 145, 178);
        doc.text("Top Merchants", 20, 30);

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        let yPos = 45;
        analysis.topMerchants.slice(0, 10).forEach((merchant) => {
          doc.text(
            `${merchant.merchant}: ${formatCurrency(merchant.amount)} (${
              merchant.transactions
            } transactions)`,
            20,
            yPos
          );
          yPos += 10;
        });
      }

      doc.save(`finsight-report-${analysis?.fileName || "analysis"}.pdf`);

      toast("Export Successful", {
        description: "PDF report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast("Export Failed", {
        description: "Failed to generate PDF report. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      const csvRows = [];

      csvRows.push(["FinSight Analysis Report"]);
      csvRows.push([`File: ${analysis?.fileName}`]);
      csvRows.push([
        `Period: ${formatDate(
          analysis?.statementPeriod.start || ""
        )} to ${formatDate(analysis?.statementPeriod.end || "")}`,
      ]);
      csvRows.push([""]);

      csvRows.push(["FINANCIAL SUMMARY"]);
      csvRows.push(["Metric", "Amount"]);
      csvRows.push([
        "Total Income",
        formatCurrency(analysis?.summary.totalIncome || 0),
      ]);
      csvRows.push([
        "Total Expenses",
        formatCurrency(analysis?.summary.totalExpenses || 0),
      ]);
      csvRows.push([
        "Net Flow",
        formatCurrency(analysis?.summary.netFlow || 0),
      ]);
      csvRows.push([
        "Total Transactions",
        analysis?.summary.transactionCount?.toString() || "0",
      ]);
      csvRows.push([""]);

      csvRows.push(["SPENDING BY CATEGORY"]);
      csvRows.push(["Category", "Amount", "Percentage"]);
      analysis?.categoryBreakdown.forEach((cat) => {
        csvRows.push([
          cat.category,
          formatCurrency(cat.amount),
          `${cat.percentage.toFixed(1)}%`,
        ]);
      });
      csvRows.push([""]);

      csvRows.push(["TOP MERCHANTS"]);
      csvRows.push(["Merchant", "Amount", "Transactions"]);
      analysis?.topMerchants.forEach((merchant) => {
        csvRows.push([
          merchant.merchant,
          formatCurrency(merchant.amount),
          merchant.transactions.toString(),
        ]);
      });

      const csvContent = csvRows
        .map((row) =>
          row
            .map((field) => `"${field.toString().replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `finsight-data-${analysis?.fileName || "analysis"}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast("Export Successful", {
        description: "CSV data has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast("Export Failed", {
        description: "Failed to generate CSV file. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setIsLoading(true);
        const analysisData = await fetchAnalysisData(statementId);
        setAnalysis(analysisData);
      } catch (err) {
        console.error("Failed to load analysis:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load analysis"
        );
        setAnalysis(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysis();
  }, [statementId]);

  const handleBack = () => {
    router.push("/");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `https://fin-trackerr-9c402fb58590.herokuapp.com/v1/statements/${statementId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      toast("Analysis Deleted", {
        description: "Your financial analysis has been successfully deleted.",
      });

      setShowDeleteDialog(false);
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Failed to delete statement:", error);
      toast("Delete Failed", {
        description: "Failed to delete the analysis. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const lineChartData = analysis?.monthlyTrends || [];

  const pieChartData =
    analysis?.categoryBreakdown.map((cat, index) => ({
      name: cat.category,
      value: cat.amount,
      percentage: cat.percentage,
      fill: `hsl(${(index * 45) % 360}, 65%, 55%)`,
    })) || [];

  const barChartData =
    analysis?.topMerchants.slice(0, 5).map((merchant) => ({
      merchant:
        merchant.merchant.length > 12
          ? merchant.merchant.substring(0, 12) + "..."
          : merchant.merchant,
      fullName: merchant.merchant,
      amount: merchant.amount,
      transactions: merchant.transactions,
    })) || [];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    if (percent < 0.08) return null;

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-slate-800">{data.fullName}</p>
          <p className="text-sm text-slate-600">
            Amount: {formatCurrency(data.amount)}
          </p>
          <p className="text-sm text-slate-600">
            Transactions: {data.transactions}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">
            {error || "Failed to load analysis"}
          </p>
          <Button onClick={handleBack} variant="outline">
            Back to Upload
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
      <header className="border-b border-cyan-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-cyan-800 hover:bg-cyan-50"
              >
                <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Upload</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 sm:w-8 h-6 sm:h-8 bg-cyan-800 rounded-lg flex items-center justify-center">
                  <FileText className="w-3 sm:w-5 h-3 sm:h-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-cyan-800 font-sans">
                  FinSight
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-200 text-cyan-800 hover:bg-cyan-50 bg-transparent hidden sm:flex"
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export"}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={exportToPDF}
                    disabled={isExporting}
                  >
                    <FileText className="h-4 w-4" />
                    Export as PDF Report
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={exportToCSV}
                    disabled={isExporting}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export Data (CSV)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-200 text-cyan-800 hover:bg-cyan-50 bg-transparent sm:hidden"
                    disabled={isExporting}
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={exportToPDF}
                    disabled={isExporting}
                  >
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={exportToCSV}
                    disabled={isExporting}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {isDeleting ? "Deleting..." : "Delete"}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Analysis</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this financial analysis?
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                      disabled={isDeleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 font-sans">
            {analysis.fileName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-slate-600">
            <span>Uploaded: {formatDate(analysis.uploadDate)}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              Period: {formatDate(analysis.statementPeriod.start)} to{" "}
              {formatDate(analysis.statementPeriod.end)}
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Processed in {analysis.processingTime}s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Income
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {formatCurrency(analysis.summary.totalIncome)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Expenses
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {formatCurrency(analysis.summary.totalExpenses)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Net Flow</p>
                  <p
                    className={`text-xl sm:text-2xl font-bold ${
                      analysis.summary.netFlow >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(analysis.summary.netFlow)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Transactions
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">
                    {analysis.summary.transactionCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100 flex flex-col min-h-[420px]">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center">
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => [
                            formatCurrency(Number(value)),
                            name,
                          ]}
                        />
                      }
                    />
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      innerRadius={window.innerWidth < 640 ? 30 : 40}
                      outerRadius={window.innerWidth < 640 ? 70 : 90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      height={40}
                      wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                      formatter={(value) => (
                        <span style={{ fontSize: "11px", fontWeight: "400" }}>
                          {value}
                        </span>
                      )}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100 flex flex-col min-h-[420px]">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
                Top Merchants
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center">
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{
                      top: 20,
                      right: window.innerWidth < 640 ? 5 : 15,
                      left: window.innerWidth < 640 ? 5 : 15,
                      bottom: window.innerWidth < 640 ? 60 : 80,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="merchant"
                      stroke="#64748b"
                      fontSize={window.innerWidth < 640 ? 9 : 11}
                      angle={-45}
                      textAnchor="end"
                      height={window.innerWidth < 640 ? 60 : 80}
                      interval={0}
                      tick={{ fontSize: window.innerWidth < 640 ? 9 : 11 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={window.innerWidth < 640 ? 9 : 11}
                      tickFormatter={(value) =>
                        window.innerWidth < 640
                          ? `₦${(value / 1000).toFixed(0)}k`
                          : formatCurrency(value)
                      }
                      width={window.innerWidth < 640 ? 50 : 80}
                    />
                    <ChartTooltip content={<CustomBarTooltip />} />
                    <Bar
                      dataKey="amount"
                      fill="#0891b2"
                      radius={[4, 4, 0, 0]}
                      name="Total Spending"
                    ></Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {lineChartData.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-cyan-100 flex flex-col min-h-[420px]">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
                  Monthly Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex items-center">
                <ChartContainer
                  config={chartConfig}
                  className="h-[320px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={lineChartData}
                      margin={{
                        top: 20,
                        right: window.innerWidth < 640 ? 5 : 15,
                        left: window.innerWidth < 640 ? 5 : 15,
                        bottom: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="month"
                        stroke="#64748b"
                        fontSize={window.innerWidth < 640 ? 10 : 12}
                        angle={window.innerWidth < 640 ? -45 : 0}
                        textAnchor={window.innerWidth < 640 ? "end" : "middle"}
                        height={window.innerWidth < 640 ? 60 : 30}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={window.innerWidth < 640 ? 9 : 11}
                        tickFormatter={(value) =>
                          window.innerWidth < 640
                            ? `₦${(value / 1000).toFixed(0)}k`
                            : formatCurrency(value)
                        }
                        width={window.innerWidth < 640 ? 50 : 80}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) => [
                              formatCurrency(Number(value)),
                              name,
                            ]}
                          />
                        }
                      />
                      <Legend
                        verticalAlign="top"
                        height={40}
                        iconType="rect"
                        wrapperStyle={{ paddingBottom: "15px" }}
                        formatter={(value) => (
                          <span
                            style={{
                              fontSize:
                                window.innerWidth < 640 ? "11px" : "12px",
                              fontWeight: "400",
                            }}
                          >
                            {value === "income"
                              ? "Income"
                              : value === "expenses"
                              ? "Expenses"
                              : "Net Flow"}
                          </span>
                        )}
                      />
                      <Bar
                        dataKey="income"
                        fill="#34D399"
                        name="Income"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="expenses"
                        fill="#EF4444"
                        name="Expenses"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="netFlow"
                        fill="#60A5FA"
                        name="Net Flow"
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {analysis.insights.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100 mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-slate-50 border-l-4 border-cyan-500"
                >
                  <p className="text-sm text-slate-700">
                    {insight.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {analysis.recurringTransactions.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100 mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
                Recurring Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recurringTransactions
                  .slice(0, 5)
                  .map((transaction, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {transaction.merchant}
                        </p>
                        <p className="text-sm text-slate-600">
                          {transaction.frequency}
                        </p>
                      </div>
                      <p className="font-bold text-slate-800">
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {analysis.unusualTransactions.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-cyan-100">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 font-sans">
                Unusual Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.unusualTransactions
                  .slice(0, 5)
                  .map((transaction, index) => (
                    <div
                      key={index}
                      className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium text-slate-800">
                              {formatCurrency(transaction.amount)}
                            </p>
                            {transaction.date && (
                              <p className="text-sm text-slate-500">
                                {formatDate(transaction.date)}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-orange-700 font-medium">
                            {transaction.reason}
                          </p>
                          <p className="text-xs text-slate-600 mt-1">
                            {transaction.description.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
