import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code, Play, Sparkles, Save, FileCode } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Project {
  id: string;
  name: string;
  description: string | null;
  language: string;
  files: Array<{ name: string; content: string }>;
  created_at: string;
}

export default function CodeEditor() {
  const { user } = useAuth();
  const [code, setCode] = useState('// Start coding...\nconsole.log("Hello, World!");');
  const [language, setLanguage] = useState("javascript");
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from("code_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load projects");
    } else {
      setProjects((data || []) as unknown as Project[]);
    }
  };

  const handleSave = async () => {
    if (!projectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    const projectData = {
      user_id: user?.id,
      name: projectName,
      language,
      files: [{ name: "main." + (language === "javascript" ? "js" : language === "python" ? "py" : "txt"), content: code }],
    };

    if (currentProject) {
      const { error } = await supabase
        .from("code_projects")
        .update(projectData)
        .eq("id", currentProject.id);

      if (error) {
        toast.error("Failed to update project");
      } else {
        toast.success("Project updated!");
        loadProjects();
      }
    } else {
      const { error } = await supabase.from("code_projects").insert(projectData);

      if (error) {
        toast.error("Failed to save project");
      } else {
        toast.success("Project saved!");
        loadProjects();
      }
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-code", {
        body: { prompt: aiPrompt, language },
      });

      if (error) throw error;

      setCode(data.code);
      toast.success("Code generated!");
      setAiPrompt("");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate code");
    }
    setGenerating(false);
  };

  const loadProject = (project: Project) => {
    setCurrentProject(project);
    setProjectName(project.name);
    setLanguage(project.language);
    if (project.files && project.files.length > 0) {
      setCode(project.files[0].content);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Code className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Code Editor</h1>
          <p className="text-muted-foreground">Write code with AI assistance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects Sidebar */}
        <Card className="lg:col-span-1 bg-card border-border shadow-elegant">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setCurrentProject(null);
                setProjectName("");
                setCode('// Start coding...\nconsole.log("Hello, World!");');
              }}
            >
              New Project
            </Button>
            {projects.map((project) => (
              <Button
                key={project.id}
                variant={currentProject?.id === project.id ? "secondary" : "ghost"}
                className="w-full justify-start truncate"
                onClick={() => loadProject(project)}
              >
                {project.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          {/* AI Assistant */}
          <Card className="bg-card border-border shadow-elegant">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 animate-glow" />
                AI Code Assistant
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Describe what you want to build
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Create a function to calculate fibonacci"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="bg-background border-input text-foreground"
                  onKeyPress={(e) => e.key === "Enter" && handleGenerateWithAI()}
                />
                <Button onClick={handleGenerateWithAI} disabled={generating} className="bg-primary hover:bg-primary/90">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generating ? "Generating..." : "Generate"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Code Editor */}
          <Card className="bg-card border-border shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-foreground">Code Editor</CardTitle>
                  <Input
                    placeholder="Project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-64 bg-background border-input text-foreground"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 rounded-md bg-background border border-input text-foreground"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                  </select>
                  <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-border rounded-lg overflow-hidden">
                <Editor
                  height="600px"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
