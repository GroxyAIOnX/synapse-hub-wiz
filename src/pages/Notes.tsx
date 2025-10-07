import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date(),
    };

    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
    toast.success("Note created successfully!");
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    toast.success("Note deleted");
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    setNotes(
      notes.map((note) =>
        note.id === editingId ? { ...note, title, content } : note
      )
    );
    setEditingId(null);
    setTitle("");
    setContent("");
    toast.success("Note updated!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground">Create and manage your notes</p>
        </div>
      </div>

      {/* Create/Edit Note Form */}
      <Card className="bg-card border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="text-foreground">
            {editingId ? "Edit Note" : "Create New Note"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {editingId ? "Update your note" : "Add a new note to your collection"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background border-input text-foreground"
          />
          <Textarea
            placeholder="Note content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] bg-background border-input text-foreground"
          />
          <div className="flex gap-2">
            {editingId ? (
              <>
                <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90">
                  Update Note
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
              <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 ? (
          <Card className="col-span-full bg-card border-border">
            <CardContent className="py-12 text-center text-muted-foreground">
              No notes yet. Create your first note above!
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card
              key={note.id}
              className="group hover:shadow-elegant transition-all duration-300 bg-card border-border hover:border-primary/50"
            >
              <CardHeader>
                <CardTitle className="text-foreground flex items-start justify-between">
                  {note.title}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(note)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(note.id)}
                      className="h-8 w-8 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  {note.createdAt.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/80 line-clamp-3">
                  {note.content || "No content"}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
