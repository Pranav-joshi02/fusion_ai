import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Upload, Send, Mic, Brain, Shield, Radio, Globe, CheckCircle2, ArrowRight, Locate, X, Download, Image } from "lucide-react";
import { useState, useRef } from "react";

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
  const [location, setLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        // Reverse geocode
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          setLocation(data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch {
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const exportImage = (img: { file: File; preview: string }) => {
    const a = document.createElement("a");
    a.href = img.preview;
    a.download = img.file.name;
    a.click();
  };

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

          <div className="space-y-1">
            {pipelineSteps.map((step, i) => {
              const isComplete = i < activeStep;
              const isActive = i === activeStep;

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

              {/* Attached images in result */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Attached Evidence</p>
                  <div className="flex gap-2 flex-wrap">
                    {images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img.preview} alt="evidence" className="h-16 w-16 object-cover rounded-md border border-border" />
                        <button
                          onClick={() => exportImage(img)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center"
                        >
                          <Download className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={() => { setSubmitted(false); setActiveStep(0); setImages([]); }} variant="outline" size="sm" className="mt-4 text-xs">
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

          {/* Location with GPS */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Location</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Enter location or detect via GPS"
                  className="pl-9 bg-secondary/50 border-border text-sm"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 h-10 w-10"
                onClick={handleGetLocation}
                disabled={locating}
              >
                <Locate className={`h-4 w-4 ${locating ? "animate-spin text-primary" : "text-muted-foreground"}`} />
              </Button>
            </div>
            {coords && (
              <p className="text-[10px] font-mono text-primary mt-1.5">
                📍 {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
              </p>
            )}
            {locating && (
              <p className="text-[10px] font-mono text-muted-foreground mt-1.5 animate-pulse">
                Detecting your location...
              </p>
            )}
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

          {/* Image Upload with preview */}
          <div>
            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Attach Images</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 bg-secondary/20 hover:bg-secondary/30 transition-colors cursor-pointer"
            >
              <Upload className="h-5 w-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Drop images or click to upload</p>
              <p className="text-[10px] text-muted-foreground/60">JPG, PNG up to 10MB · Multiple files supported</p>
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.preview} alt={`upload-${i}`} className="h-20 w-20 object-cover rounded-lg border border-border" />
                    <div className="absolute top-0 right-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); exportImage(img); }}
                        className="bg-black/70 rounded-bl-md rounded-tr-lg p-1"
                      >
                        <Download className="h-3 w-3 text-white" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                        className="bg-destructive/80 rounded-bl-md rounded-tr-lg p-1"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                    <p className="text-[9px] font-mono text-muted-foreground mt-0.5 truncate w-20">{img.file.name}</p>
                  </div>
                ))}
              </div>
            )}
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
