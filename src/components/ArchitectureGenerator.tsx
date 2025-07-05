import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, Plus, Download, FileText, Zap, Code2, RefreshCw } from "lucide-react";
import { ExamplePrompts } from "./ExamplePrompts";
import { TemplateUpload } from "./TemplateUpload";
import { OutputViewer } from "./OutputViewer";
import { PlantUMLEditor } from "./PlantUMLEditor";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-architecture.jpg";

interface GenerationResult {
  document: string;
  diagram: string;
}

export function ArchitectureGenerator() {
  const [prompt, setPrompt] = useState("");
  const [template, setTemplate] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing Prompt",
        description: "Please enter a prompt to generate architecture.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Mock API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: GenerationResult = {
        document: `# System Architecture: ${prompt.split(' ').slice(0, 3).join(' ')}\n\n## Overview\nThis document describes the architecture for ${prompt}.\n\n## Components\n- Frontend Application\n- Backend API\n- Database Layer\n- Authentication Service\n\n## Technology Stack\n- Frontend: React, TypeScript\n- Backend: Node.js, Express\n- Database: PostgreSQL\n- Cache: Redis\n\n## Deployment\nThe system will be deployed using Docker containers orchestrated by Kubernetes.`,
        diagram: `graph TB
    A[User Interface] --> B[API Gateway]
    B --> C[Authentication Service]
    B --> D[Core Application Service]
    D --> E[Database]
    D --> F[Cache Layer]
    G[Load Balancer] --> A
    H[CDN] --> A
    
    subgraph "Frontend"
        A
        H
    end
    
    subgraph "Backend Services"
        B
        C
        D
    end
    
    subgraph "Data Layer"
        E
        F
    end`
      };

      setResult(mockResult);
      toast({
        title: "Architecture Generated!",
        description: "Your system architecture has been successfully generated.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate architecture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleSelect = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const handleTemplateUpload = (uploadedTemplate: string) => {
    setTemplate(uploadedTemplate);
    toast({
      title: "Template Uploaded",
      description: "Custom template has been applied.",
    });
  };

  const handleReset = () => {
    setTemplate(null);
    setResult(null);
    toast({
      title: "Template Reset",
      description: "Using default system template.",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-lg p-12 mb-8">
          <div 
            className="absolute inset-0 opacity-5 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
          <div className="relative z-10 text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 rounded-xl bg-primary text-primary-foreground shadow-md">
                <Zap className="h-10 w-10" />
              </div>
              <h1 className="text-5xl font-bold text-foreground">
                AI Architecture Generator
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your ideas into comprehensive system architecture documents and visual diagrams. 
              Powered by AI to help you design, document, and visualize complex systems effortlessly.
            </p>
            <div className="flex items-center justify-center space-x-4 pt-4">
              <Badge variant="secondary" className="px-4 py-2">
                ⚡ AI-Powered
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                📊 Visual Diagrams
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                📝 Documentation
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="ai-generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai-generator">AI Architecture Generator</TabsTrigger>
            <TabsTrigger value="plantuml-editor">PlantUML Editor</TabsTrigger>
          </TabsList>
          
          <TabsContent value="ai-generator" className="space-y-6">
            {/* Control Panel */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span>Generation Controls</span>
                    </CardTitle>
                    <CardDescription>
                      Manage examples, templates, and generation settings
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <TemplateUpload onTemplateUpload={handleTemplateUpload} />
                    {template && (
                      <Button variant="outline" size="sm" onClick={handleReset}>
                        <RefreshCw className="h-4 w-4" />
                        Reset Template
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {template && (
                  <div className="p-3 bg-accent rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Custom Template Active</span>
                      <Badge variant="secondary">Custom</Badge>
                    </div>
                  </div>
                )}
                
                <ExamplePrompts onExampleSelect={handleExampleSelect} />
              </CardContent>
            </Card>

            {/* Main Generator */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Prompt Input</span>
                  </CardTitle>
                  <CardDescription>
                    Describe your system architecture requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe your system architecture... e.g., 'E-commerce platform with microservices, real-time notifications, and machine learning recommendations'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[200px] resize-none bg-muted/30 border-border/50 focus:border-primary/50 transition-all"
                  />
                  <Button 
                    onClick={handleGenerate} 
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating Architecture...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate Architecture
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Output Panel */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Generated Output</span>
                  </CardTitle>
                  <CardDescription>
                    Architecture documentation and diagrams
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <OutputViewer result={result} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                      <Zap className="h-16 w-16 text-muted-foreground/50" />
                      <div>
                        <p className="text-lg font-medium text-muted-foreground">
                          No output generated yet
                        </p>
                        <p className="text-sm text-muted-foreground/70">
                          Enter a prompt and click generate to see results
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="plantuml-editor">
            <PlantUMLEditor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}