import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Upload, Send, Mic, Brain, Shield, Radio, Globe, CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";

const pipelineSteps = [
  {
    icon: Brain,
    title: "AI Relevance Filter",
    description: "Your report is analyzed by our NLP model to verify it describes a real disaster event. Irrelevant or spam submissions are filtered out.",
    status: "Processing...",
  },
  {
    icon: MapPin,
    title: "Geo-Extraction & Classification",
    description: "AI extracts precise location coordinates and classifies the disaster type (flood, earthquake, wildfire, etc.) automatically.",
    status: "Classifying...",
  },
  {
    icon: Shield,
    title: "Trust Score Assignment",
    description: "A confidence score (0-100%) is assigned based on source reliability, cross-verification with satellite/weather data, and historical accuracy.",
    status: "Scoring...",
  },
  {
    icon: Radio,
    title: "Fusion Engine",
    description: "Your report is merged with data from weather APIs, satellite imagery, news feeds, and other user reports to build a complete picture.",
    status: "Fusing data...",
  },
  {
    icon: Globe,
    title: "Live on Globe Dashboard",
    description: "Once verified, the disaster appears as a real-time marker on the global dashboard — visible to authorities, responders, and the public.",
    status: "Publishing...",
  },
];

export default function ReportDisasterPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Simulate pipeline progression
  const handleSubmit = () => {
    setSubmitted(true);
    setActiveStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= pipelineSteps.length) {
        clearInterval(interval);
      }
      setActiveStep(step);
    }, 1500);
  };

  if (submitted) {
    return (
      <MainLayout showSidebar={false}>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-foreground">Report Submitted</h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Here's how your report is being processed by sankat.ai</p>
          </div>

          {/* Pipeline visualization */}
          <div className="space-y-1">
            {pipelineSteps.map((step, i) => {
              const isComplete = i < activeStep;
              const isActive = i === activeStep;
              const isPending = i > activeStep;

              return (
                <div key={i}>
                  <div className={`rounded-lg border p-4 transition-all duration-500 ${
                    isComplete ? "border-primary/30 bg-primary/5" :
                    isActive ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/5" :
                    "border-border bg-card/30 opacity-40"
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`rounded-lg p-2.5 shrink-0 transition-colors ${
                        isComplete ? "bg-primary/20" : isActive ? "bg-primary/15" : "bg-secondary/50"
                      }`}>
                        {isComplete ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <step.icon className={`h-4 w-4 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-foreground">{step.title}</h3>
                          {isActive && (
                            <span className="text-[10px] font-mono text-primary animate-pulse">{step.status}</span>
                          )}
                          {isComplete && (
                            <span className="text-[10px] font-mono text-primary">Complete ✓</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>
                  {i < pipelineSteps.length - 1 && (
                    <div className="flex justify-start ml-7 py-0.5">
                      <ArrowRight className={`h-3 w-3 rotate-90 ${isComplete ? "text-primary/50" : "text-border"}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final output preview */}
          {activeStep >= pipelineSteps.length && (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">Live on Dashboard</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Trust Score", value: "87%" },
                  { label: "Classification", value: "Flood" },
                  { label: "Severity", value: "High" },
                  { label: "Response ETA", value: "~4 min" },
                ].map((item) => (
                  <div key={item.label} className="rounded-md bg-secondary/50 p-2.5">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
              <Button onClick={() => { setSubmitted(false); setActiveStep(0); }} variant="outline" size="sm" className="mt-4 text-xs">
                Submit Another Report
              </Button>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showSidebar={false}>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Report a Disaster</h1>
          <p className="text-xs text-muted-foreground mt-1 font-mono">Submit an incident report — text, image, or voice</p>
        </div>

        <div className="rounded-lg border border-border bg-card/50 p-6 space-y-5">
          {/* Disaster Type */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Disaster Type</label>
            <Select>
              <SelectTrigger className="bg-secondary/50 border-border text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {["Earthquake", "Flood", "Wildfire", "Cyclone / Hurricane", "Tsunami", "Drought", "Volcanic Activity", "Landslide", "Other"].map(t => (
                  <SelectItem key={t} value={t.toLowerCase().replace(/\s/g, "-")}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Enter location or use GPS" className="pl-9 bg-secondary/50 border-border text-sm" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Description</label>
            <Textarea placeholder="Describe what is happening..." className="bg-secondary/50 border-border text-sm min-h-[100px] resize-none" />
          </div>

          {/* Voice Report */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
              Voice Report <span className="text-primary">(quick submit)</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-xs font-medium ${
                  isRecording
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : "bg-secondary/50 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Mic className={`h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
                {isRecording ? "Recording... Tap to stop" : "Tap to record"}
              </button>
              {isRecording && (
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-1 bg-destructive rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 16}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">In a disaster, every second counts. Use voice to report quickly.</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Attach Image</label>
            <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Drop image or click to upload</p>
              <p className="text-[10px] text-muted-foreground/60">JPG, PNG up to 10MB</p>
            </div>
          </div>

          {/* Submit */}
          <Button className="w-full text-sm gap-2" onClick={handleSubmit}>
            <Send className="h-3.5 w-3.5" />
            Submit Report
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            Reports are processed by AI for relevance and assigned a trust score before publication.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
