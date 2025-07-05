import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Copy, Save, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { encode } from 'plantuml-encoder';
import { Document, Packer, Paragraph, ImageRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DEFAULT_PLANTUML = `@startuml
Alice -> Bob: Hello
Bob -> Alice: Hi there!
@enduml`;

interface Diagram {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export function PlantUMLEditor() {
  const [plantUMLCode, setPlantUMLCode] = useState(DEFAULT_PLANTUML);
  const [diagramUrl, setDiagramUrl] = useState('');
  const [savedDiagrams, setSavedDiagrams] = useState<Diagram[]>([]);
  const [currentDiagramName, setCurrentDiagramName] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const { toast } = useToast();

  // Generate diagram URL from PlantUML code
  const generateDiagramUrl = useCallback((code: string) => {
    try {
      const encoded = encode(code);
      return `https://www.plantuml.com/plantuml/svg/${encoded}`;
    } catch (error) {
      console.error('Error encoding PlantUML:', error);
      return '';
    }
  }, []);

  // Update diagram when code changes
  useEffect(() => {
    setIsRendering(true);
    const timer = setTimeout(() => {
      const url = generateDiagramUrl(plantUMLCode);
      setDiagramUrl(url);
      setIsRendering(false);
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [plantUMLCode, generateDiagramUrl]);

  // Load saved diagrams from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('plantuml-diagrams');
    if (saved) {
      setSavedDiagrams(JSON.parse(saved));
    }
  }, []);

  const handleSaveDiagram = () => {
    if (!currentDiagramName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please enter a name for the diagram.",
        variant: "destructive",
      });
      return;
    }

    const newDiagram: Diagram = {
      id: Date.now().toString(),
      name: currentDiagramName,
      content: plantUMLCode,
      createdAt: new Date().toISOString(),
    };

    const updatedDiagrams = [...savedDiagrams, newDiagram];
    setSavedDiagrams(updatedDiagrams);
    localStorage.setItem('plantuml-diagrams', JSON.stringify(updatedDiagrams));
    setCurrentDiagramName('');

    toast({
      title: "Diagram Saved",
      description: `"${newDiagram.name}" has been saved successfully.`,
    });
  };

  const handleLoadDiagram = (diagram: Diagram) => {
    setPlantUMLCode(diagram.content);
    setCurrentDiagramName(diagram.name);
  };

  const handleDeleteDiagram = (id: string) => {
    const updatedDiagrams = savedDiagrams.filter(d => d.id !== id);
    setSavedDiagrams(updatedDiagrams);
    localStorage.setItem('plantuml-diagrams', JSON.stringify(updatedDiagrams));

    toast({
      title: "Diagram Deleted",
      description: "Diagram has been removed.",
    });
  };

  const handleNewDiagram = () => {
    setPlantUMLCode(DEFAULT_PLANTUML);
    setCurrentDiagramName('');
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(plantUMLCode);
      toast({
        title: "Copied!",
        description: "PlantUML code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadText = () => {
    const blob = new Blob([plantUMLCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDiagramName || 'diagram'}.puml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "PlantUML text file downloaded successfully.",
    });
  };

  const handleDownloadPDF = async () => {
    if (!diagramUrl) return;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const pdf = new jsPDF();
        const imgWidth = 190;
        const imgHeight = (img.height * imgWidth) / img.width;
        
        pdf.addImage(img, 'PNG', 10, 10, imgWidth, imgHeight);
        pdf.save(`${currentDiagramName || 'diagram'}.pdf`);

        toast({
          title: "PDF Downloaded",
          description: "Diagram exported as PDF successfully.",
        });
      };
      img.src = diagramUrl;
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export diagram as PDF.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadDOCX = async () => {
    if (!diagramUrl) return;

    try {
      const response = await fetch(diagramUrl);
      const arrayBuffer = await response.arrayBuffer();

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: arrayBuffer,
                  transformation: {
                    width: 600,
                    height: 400,
                  },
                  type: 'png',
                }),
              ],
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentDiagramName || 'diagram'}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "DOCX Downloaded",
        description: "Diagram exported as Word document successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export diagram as DOCX.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>PlantUML Editor Controls</span>
          </CardTitle>
          <CardDescription>
            Manage and export your PlantUML diagrams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleNewDiagram} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              New Diagram
            </Button>
            <Button onClick={handleCopyCode} variant="outline" size="sm">
              <Copy className="h-4 w-4" />
              Copy Code
            </Button>
            <Button onClick={handleDownloadText} variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Download Text
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleDownloadDOCX} variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export DOCX
            </Button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter diagram name to save..."
              value={currentDiagramName}
              onChange={(e) => setCurrentDiagramName(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
            />
            <Button onClick={handleSaveDiagram} variant="default" size="sm">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Diagrams */}
      {savedDiagrams.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Saved Diagrams</CardTitle>
            <CardDescription>
              Load or delete your saved PlantUML diagrams
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedDiagrams.map((diagram) => (
                <div key={diagram.id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium truncate">{diagram.name}</h4>
                    <Button
                      onClick={() => handleDeleteDiagram(diagram.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {new Date(diagram.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={() => handleLoadDiagram(diagram)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Load
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor and Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>PlantUML Code Editor</CardTitle>
            <CardDescription>
              Write your PlantUML diagram code here
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={plantUMLCode}
              onChange={(e) => setPlantUMLCode(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Enter your PlantUML code here..."
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>Live Preview</span>
              {isRendering && (
                <Badge variant="secondary" className="text-xs">
                  Rendering...
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time diagram preview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] flex items-center justify-center border border-border rounded-lg bg-muted/20">
              {diagramUrl ? (
                <img
                  src={diagramUrl}
                  alt="PlantUML Diagram"
                  className="max-w-full max-h-[400px] object-contain"
                  onError={() => {
                    toast({
                      title: "Render Error",
                      description: "Failed to render PlantUML diagram. Check your syntax.",
                      variant: "destructive",
                    });
                  }}
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Diagram will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}