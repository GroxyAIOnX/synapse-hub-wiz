import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, MessageSquare, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Notes",
      description: "Create and manage your notes",
      icon: FileText,
      action: () => navigate("/notes"),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      title: "AI Chat",
      description: "Chat with AI assistant",
      icon: MessageSquare,
      action: () => navigate("/chat"),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Account",
      description: "Manage your profile",
      icon: User,
      action: () => navigate("/account"),
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 shadow-glow">
        <div className="absolute inset-0 bg-gradient-glow opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-white animate-glow" />
            <h1 className="text-4xl font-bold text-white">Welcome to NexusHub</h1>
          </div>
          <p className="text-white/90 text-lg max-w-2xl">
            Your all-in-one productivity platform. Manage notes, chat with AI, and organize your digital life.
          </p>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="group hover:shadow-elegant transition-all duration-300 cursor-pointer border-border bg-card hover:scale-105"
            onClick={feature.action}
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-foreground">{feature.title}</CardTitle>
              <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                Open {feature.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">0</CardTitle>
            <CardDescription className="text-muted-foreground">Total Notes</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">0</CardTitle>
            <CardDescription className="text-muted-foreground">AI Conversations</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground">Active</CardTitle>
            <CardDescription className="text-muted-foreground">Account Status</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
