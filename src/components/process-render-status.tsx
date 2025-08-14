
import { Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

interface RenderStatusProps {
  processingState: {
    status: "idle" | "uploading" | "processing" | "completed" | "failed";
    message: string;
    estimatedTime?: number;
    progress: number;
  };
  handleViewResults: () => void;
  resetUpload: () => void;
  selectedFile: File | null;
}
const RenderProcessingStatus = ({
  processingState,
  handleViewResults,
  resetUpload,
  selectedFile,
}: RenderStatusProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (processingState.status === "idle") return null;

  return (
    <Card className="mt-6 border-cyan-200 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Status Header */}
          <div className="flex items-center gap-3">
            {processingState.status === "uploading" && (
              <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
            )}
            {processingState.status === "processing" && (
              <Clock className="w-5 h-5 text-violet-600" />
            )}
            {processingState.status === "completed" && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            {processingState.status === "failed" && (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 font-sans">
                {processingState.status === "uploading" && "Uploading File"}
                {processingState.status === "processing" &&
                  "Analyzing Statement"}
                {processingState.status === "completed" && "Analysis Complete"}
                {processingState.status === "failed" && "Processing Error"}
              </h3>
              <p className="text-sm text-slate-600">
                {processingState.message}
              </p>
            </div>

            {processingState.estimatedTime &&
              processingState.status !== "completed" && (
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    ~{formatTime(processingState.estimatedTime)} remaining
                  </p>
                </div>
              )}
          </div>

          {/* Progress Bar */}
          {(processingState.status === "uploading" ||
            processingState.status === "processing") && (
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
              <Button
                className="bg-cyan-800 hover:bg-cyan-700 text-white"
                onClick={handleViewResults}
              >
                View Results
              </Button>
            )}

            {(processingState.status === "failed" ||
              processingState.status === "completed") && (
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
  );
};

export default RenderProcessingStatus;
