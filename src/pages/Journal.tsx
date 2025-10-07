import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function Journal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) loadEntries();
  }, [user]);

  const loadEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load entries");
    } else {
      setEntries(data || []);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("journal_entries").insert({
      user_id: user?.id,
      title,
      content,
      tags: [],
    });

    if (error) {
      toast.error("Failed to create entry");
    } else {
      toast.success("Entry created!");
      setTitle("");
      setContent("");
      loadEntries();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("journal_entries").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete entry");
    } else {
      toast.success("Entry deleted");
      loadEntries();
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content || "");
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    setLoading(true);
    const { error } = await supabase
      .from("journal_entries")
      .update({ title, content })
      .eq("id", editingId);

    if (error) {
      toast.error("Failed to update entry");
    } else {
      toast.success("Entry updated!");
      setEditingId(null);
      setTitle("");
      setContent("");
      loadEntries();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Journal</h1>
          <p className="text-muted-foreground">Write and reflect on your thoughts</p>
        </div>
      </div>

      <Card className="bg-card border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-foreground">
            {editingId ? "Edit Entry" : "New Entry"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {editingId ? "Update your journal entry" : "Start writing your thoughts"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Entry title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background border-input text-foreground"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] bg-background border-input text-foreground"
          />
          <div className="flex gap-2">
            {editingId ? (
              <>
                <Button onClick={handleUpdate} disabled={loading} className="bg-primary hover:bg-primary/90">
                  Update Entry
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingId(null);
                    setTitle("");
                    setContent("");
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleCreate} disabled={loading} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Entry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.length === 0 ? (
          <Card className="col-span-full bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              No entries yet. Start journaling above!
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => (
            <Card
              key={entry.id}
              className="group hover:shadow-elegant transition-all duration-300 bg-card border-border hover:border-primary/50"
            >
              <CardHeader>
                <CardTitle className="text-foreground flex items-start justify-between">
                  {entry.title}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(entry)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                      className="h-8 w-8 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  {new Date(entry.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 line-clamp-3">
                  {entry.content || "No content"}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
