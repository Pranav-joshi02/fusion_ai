import { MainLayout } from "@/components/layout/MainLayout";
import { AlertTriangle, Bell, CheckCircle, Radio, Phone, Smartphone, Building2, Satellite } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const alerts = [
  { id: 1, title: "Earthquake — Turkey", message: "6.4 magnitude detected near Antalya region. Emergency response activated.", priority: "critical", time: "2 min ago", acknowledged: false },
  { id: 2, title: "Tsunami Warning — New Zealand", message: "7.1 undersea quake detected. Coastal evacuation advisory issued.", priority: "critical", time: "18 min ago", acknowledged: false },
  { id: 3, title: "Flood Alert — Bangladesh", message: "Severe flooding in Sylhet division. 50,000+ displaced.", priority: "high", time: "1 hour ago", acknowledged: true },
  { id: 4, title: "Cyclone Update — Philippines", message: "Category 3 cyclone approaching Visayas. Landfall in 12 hours.", priority: "high", time: "3 hours ago", acknowledged: true },
  { id: 5, title: "Wildfire — California", message: "Containment at 30%. Additional resources deployed.", priority: "moderate", time: "5 hours ago", acknowledged: true },
  { id: 6, title: "AQI Warning — Delhi", message: "AQI exceeds 400. Public health advisory in effect.", priority: "moderate", time: "8 hours ago", acknowledged: true },
];

const priorityStyles: Record<string, string> = {
  critical: "border-l-destructive",
  high: "border-l-warning",
  moderate: "border-l-primary",
};

const telecomPartners = [
  { name: "Cell Broadcast", icon: Radio, desc: "Emergency alerts pushed to all devices in affected area via CBS — no app needed" },
  { name: "Telecom APIs", icon: Phone, desc: "Automated SMS/USSD alerts to registered numbers via Jio, Airtel, BSNL carrier networks" },
  { name: "NDMA Integration", icon: Building2, desc: "Direct link to National Disaster Management Authority for official alert escalation" },
  { name: "Satellite Alerts", icon: Satellite, desc: "Fallback alerts via satellite when ground networks are down in disaster zones" },
];

function AlertCard({ alert }: { alert: typeof alerts[0] }) {
  return (
    <div className={`rounded-lg border border-border border-l-2 ${priorityStyles[alert.priority]} bg-card/50 p-4 hover:bg-card transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {!alert.acknowledged ? (
            <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          ) : (
            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{alert.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground shrink-0 ml-4">{alert.time}</span>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <MainLayout showSidebar={false}>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Alert Center</h1>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Real-time disaster alerts & notifications</p>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono text-primary">2 unread</span>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="bg-secondary/50 mb-4">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="critical" className="text-xs">Critical</TabsTrigger>
            <TabsTrigger value="high" className="text-xs">High</TabsTrigger>
            <TabsTrigger value="moderate" className="text-xs">Moderate</TabsTrigger>
          </TabsList>

          {["all", "critical", "high", "moderate"].map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-2">
              {alerts.filter(a => tab === "all" || a.priority === tab).map(alert => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Telecom Notification Section */}
        <div className="mt-8 rounded-lg border border-border bg-card/50 p-5">
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Telecom & Broadcast Integration</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4 font-mono">
            Critical alerts are automatically pushed to telecom companies for mass notification via cell broadcast, SMS, and satellite fallback.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {telecomPartners.map((partner) => (
              <div key={partner.name} className="rounded-lg border border-border bg-secondary/20 p-4 flex items-start gap-3">
                <div className="rounded-md bg-primary/10 p-2 shrink-0">
                  <partner.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{partner.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{partner.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-md bg-primary/5 border border-primary/20 p-3">
            <p className="text-[11px] text-foreground">
              <span className="font-semibold">How it works:</span> When an alert reaches <span className="text-primary font-mono">CRITICAL</span> severity, 
              sankat.ai automatically triggers telecom APIs to broadcast emergency messages to all mobile devices in the affected region — 
              ensuring people without internet access still receive life-saving warnings within seconds.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
