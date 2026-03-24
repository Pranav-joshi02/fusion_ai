import { MainLayout } from "@/components/layout/MainLayout";
import { FileText, Download, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  { id: 1, title: "Weekly Disaster Summary", period: "Mar 17–24, 2026", status: "Ready", type: "Weekly" },
  { id: 2, title: "Critical Events Analysis", period: "March 2026", status: "Ready", type: "Monthly" },
  { id: 3, title: "AQI Trend Report — South Asia", period: "Q1 2026", status: "Generating", type: "Quarterly" },
  { id: 4, title: "Flood Risk Assessment — SE Asia", period: "Mar 2026", status: "Ready", type: "Ad-hoc" },
  { id: 5, title: "Trust Score Calibration Log", period: "Mar 2026", status: "Ready", type: "System" },
];

export default function ReportsPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Reports</h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Generated analytics & disaster reports</p>
          </div>
          <Button size="sm" className="text-xs">
            Generate Report
          </Button>
        </div>

        <div className="space-y-2">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg border border-border bg-card/50 p-4 flex items-center justify-between hover:bg-card transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-secondary p-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{report.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{report.period}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {report.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {report.status === "Generating" ? (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-warning">
                    <Clock className="h-3 w-3 animate-spin" /> Generating
                  </span>
                ) : (
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
