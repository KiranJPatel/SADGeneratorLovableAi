import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Lightbulb, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExamplePrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  tags: string[];
}

interface ExamplePromptsProps {
  onExampleSelect: (prompt: string) => void;
}

const defaultExamples: ExamplePrompt[] = [
  {
    id: '1',
    title: 'E-commerce Platform',
    description: 'Modern e-commerce with microservices',
    prompt: 'E-commerce platform with microservices architecture, user authentication, product catalog, shopping cart, payment processing, order management, inventory tracking, and real-time notifications. Include CDN for static assets and Redis for session management.',
    tags: ['microservices', 'e-commerce', 'scalable']
  },
  {
    id: '2',
    title: 'Chat Application',
    description: 'Real-time messaging platform',
    prompt: 'Real-time chat application supporting multiple channels, direct messages, file sharing, emoji reactions, user presence indicators, message history, and push notifications. Use WebSocket connections and implement horizontal scaling.',
    tags: ['real-time', 'websockets', 'social']
  },
  {
    id: '3',
    title: 'Video Streaming',
    description: 'Netflix-like streaming service',
    prompt: 'Video streaming platform with content management, user subscriptions, recommendation engine using machine learning, video transcoding pipeline, CDN distribution, user analytics, and adaptive bitrate streaming.',
    tags: ['streaming', 'ML', 'media']
  },
  {
    id: '4',
    title: 'IoT Monitoring',
    description: 'Industrial IoT data platform',
    prompt: 'IoT data collection and monitoring system for industrial sensors, real-time data processing, time-series database, alerting system, dashboard for visualization, edge computing capabilities, and device management.',
    tags: ['IoT', 'real-time', 'monitoring']
  }
];

export function ExamplePrompts({ onExampleSelect }: ExamplePromptsProps) {
  const [examples, setExamples] = useState<ExamplePrompt[]>(defaultExamples);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExample, setNewExample] = useState({
    title: '',
    description: '',
    prompt: '',
    tags: ''
  });
  const { toast } = useToast();

  const handleAddExample = () => {
    if (!newExample.title || !newExample.prompt) {
      toast({
        title: "Missing Information",
        description: "Title and prompt are required.",
        variant: "destructive",
      });
      return;
    }

    const example: ExamplePrompt = {
      id: Date.now().toString(),
      title: newExample.title,
      description: newExample.description,
      prompt: newExample.prompt,
      tags: newExample.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setExamples([...examples, example]);
    setNewExample({ title: '', description: '', prompt: '', tags: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Example Added",
      description: "New prompt example has been created.",
    });
  };

  const handleDeleteExample = (id: string) => {
    setExamples(examples.filter(ex => ex.id !== id));
    toast({
      title: "Example Removed",
      description: "Prompt example has been deleted.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Example Prompts</h3>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add Example
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Add New Example</DialogTitle>
              <DialogDescription>
                Create a reusable prompt example for quick access.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newExample.title}
                  onChange={(e) => setNewExample({ ...newExample, title: e.target.value })}
                  placeholder="E.g., Social Media Platform"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newExample.description}
                  onChange={(e) => setNewExample({ ...newExample, description: e.target.value })}
                  placeholder="Brief description of the system"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={newExample.prompt}
                  onChange={(e) => setNewExample({ ...newExample, prompt: e.target.value })}
                  placeholder="Detailed system requirements and architecture description..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newExample.tags}
                  onChange={(e) => setNewExample({ ...newExample, tags: e.target.value })}
                  placeholder="social, real-time, scalable"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExample}>Add Example</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examples.map((example) => (
          <Card 
            key={example.id} 
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-border/50 bg-card/50 backdrop-blur-sm"
            onClick={() => onExampleSelect(example.prompt)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{example.title}</CardTitle>
                  <CardDescription className="text-sm">{example.description}</CardDescription>
                </div>
                {!defaultExamples.find(ex => ex.id === example.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteExample(example.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {example.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}