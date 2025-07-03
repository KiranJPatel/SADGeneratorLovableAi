import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateUploadProps {
  onTemplateUpload: (template: string) => void;
}

const defaultTemplate = `# System Architecture: {{ system_name }}

## Overview
{{ overview }}

## System Requirements
{{ requirements }}

## Architecture Components

### Frontend
{{ frontend_details }}

### Backend Services
{{ backend_details }}

### Database Layer
{{ database_details }}

### External Integrations
{{ integrations }}

## Technology Stack
{{ tech_stack }}

## Security Considerations
{{ security }}

## Scalability & Performance
{{ scalability }}

## Deployment Strategy
{{ deployment }}

## Monitoring & Logging
{{ monitoring }}`;

export function TemplateUpload({ onTemplateUpload }: TemplateUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templateContent, setTemplateContent] = useState(defaultTemplate);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/markdown', 'text/plain', 'application/json'];
    const fileExtension = file.name.toLowerCase();
    
    if (!validTypes.includes(file.type) && !fileExtension.endsWith('.md') && !fileExtension.endsWith('.txt') && !fileExtension.endsWith('.json')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a Markdown (.md), text (.txt), or JSON file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTemplateContent(content);
      setUploadedFile(file);
    };
    reader.readAsText(file);
  };

  const handleApplyTemplate = () => {
    if (!templateContent.trim()) {
      toast({
        title: "Empty Template",
        description: "Please provide template content.",
        variant: "destructive",
      });
      return;
    }

    onTemplateUpload(templateContent);
    setIsDialogOpen(false);
    
    toast({
      title: "Template Applied",
      description: uploadedFile ? `Using template from ${uploadedFile.name}` : "Using custom template",
    });
  };

  const extractPlaceholders = (template: string) => {
    const regex = /\{\{\s*([^}]+)\s*\}\}/g;
    const placeholders = new Set<string>();
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      placeholders.add(match[1].trim());
    }
    
    return Array.from(placeholders);
  };

  const placeholders = extractPlaceholders(templateContent);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4" />
          Upload Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Custom Template</span>
          </DialogTitle>
          <DialogDescription>
            Upload a custom template or edit the default one. Use {`{{ placeholder }}`} syntax for dynamic content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0"
            >
              <Upload className="h-4 w-4" />
              Choose File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.txt,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            {uploadedFile && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>{uploadedFile.name}</span>
              </Badge>
            )}
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Templates support placeholder syntax like <code>{`{{ system_name }}`}</code>. 
              The AI will fill these placeholders based on your prompt.
            </AlertDescription>
          </Alert>

          <div>
            <label className="text-sm font-medium">Template Content</label>
            <Textarea
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              placeholder="Enter your template content with placeholders..."
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {placeholders.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Detected Placeholders</CardTitle>
                <CardDescription className="text-xs">
                  These will be replaced by AI-generated content
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {placeholders.map((placeholder) => (
                    <Badge key={placeholder} variant="outline" className="text-xs font-mono">
                      {`{{ ${placeholder} }}`}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTemplate}>
              Apply Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}