import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, EyeOff, Key } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Secret {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
}

export default function Secrets() {
  const { user } = useAuth();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [secretKey, setSecretKey] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) loadSecrets();
  }, [user]);

  const loadSecrets = async () => {
    const { data, error } = await supabase
      .from("user_secrets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load secrets");
    } else {
      setSecrets(data || []);
    }
  };

  const handleCreate = async () => {
    if (!secretKey.trim() || !secretValue.trim()) {
      toast.error("Please enter both key and value");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("user_secrets").insert({
      user_id: user?.id,
      key: secretKey,
      value: secretValue,
      description,
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("A secret with this key already exists");
      } else {
        toast.error("Failed to create secret");
      }
    } else {
      toast.success("Secret created!");
      setSecretKey("");
      setSecretValue("");
      setDescription("");
      loadSecrets();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("user_secrets").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete secret");
    } else {
      toast.success("Secret deleted");
      loadSecrets();
    }
  };

  const toggleVisibility = (id: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleSecrets(newVisible);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Key className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Secrets Manager</h1>
          <p className="text-muted-foreground">Securely store your environment variables and API keys</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-foreground">Add New Secret</CardTitle>
          <CardDescription className="text-muted-foreground">
            Store sensitive data securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key" className="text-foreground">Key</Label>
            <Input
              id="key"
              placeholder="API_KEY"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="bg-background border-input text-foreground font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value" className="text-foreground">Value</Label>
            <Input
              id="value"
              type="password"
              placeholder="Your secret value"
              value={secretValue}
              onChange={(e) => setSecretValue(e.target.value)}
              className="bg-background border-input text-foreground font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What is this secret for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-input text-foreground"
            />
          </div>
          <Button onClick={handleCreate} disabled={loading} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Secret
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {secrets.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              No secrets yet. Add your first secret above!
            </CardContent>
          </Card>
        ) : (
          secrets.map((secret) => (
            <Card
              key={secret.id}
              className="group hover:shadow-elegant transition-all duration-300 bg-card border-border hover:border-primary/50"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      <span className="font-mono font-semibold text-foreground">{secret.key}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-secondary px-3 py-1 rounded text-foreground font-mono">
                        {visibleSecrets.has(secret.id) ? secret.value : "•".repeat(20)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleVisibility(secret.id)}
                        className="h-8 w-8"
                      >
                        {visibleSecrets.has(secret.id) ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {secret.description && (
                      <p className="text-sm text-muted-foreground">{secret.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(secret.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(secret.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
