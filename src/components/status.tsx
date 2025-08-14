import { FileText } from "lucide-react";
import React from "react";
import { Card, CardContent } from "./ui/card";

const Status = () => {
  return (
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
          <h3 className="font-semibold text-slate-800 mb-2 font-sans text-sm sm:text-base">
            Spending Trends
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Visualize your spending patterns over time
          </p>
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
  );
};

export default Status;
