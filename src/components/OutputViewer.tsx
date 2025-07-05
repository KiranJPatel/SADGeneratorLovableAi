import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Share, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import mermaid from 'mermaid';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OutputViewerProps {
  result: {
    document: string;
    diagram: string;
  };
}

export function OutputViewer({ result }: OutputViewerProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (result.diagram && mermaidRef.current) {
      mermaid.initialize({ 
        startOnLoad: true,
        theme: 'dark',
        themeVariables: {
          primaryColor: 'hsl(217, 91%, 60%)',
          primaryTextColor: 'hsl(220, 9%, 97%)',
          primaryBorderColor: 'hsl(217, 91%, 60%)',
          lineColor: 'hsl(220, 13%, 20%)',
          secondaryColor: 'hsl(220, 13%, 15%)',
          tertiaryColor: 'hsl(220, 13%, 18%)',
          background: 'hsl(220, 13%, 9%)',
          mainBkg: 'hsl(220, 13%, 11%)',
          secondBkg: 'hsl(220, 13%, 15%)',
          tertiaryBkg: 'hsl(220, 13%, 18%)',
        }
      });

      const renderDiagram = async () => {
        try {
          mermaidRef.current!.innerHTML = '';
          const { svg } = await mermaid.render('mermaid-diagram', result.diagram);
          mermaidRef.current!.innerHTML = svg;
        } catch (error) {
          console.error('Mermaid render error:', error);
          mermaidRef.current!.innerHTML = `
            <div class="p-4 text-center text-muted-foreground">
              <p>Error rendering diagram</p>
              <p class="text-sm">Please check the Mermaid syntax</p>
            </div>
          `;
        }
      };

      renderDiagram();
    }
  }, [result.diagram]);

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedStates({ ...copiedStates, [type]: true });
      
      toast({
        title: "Copied!",
        description: `${type} content copied to clipboard.`,
      });

      setTimeout(() => {
        setCopiedStates({ ...copiedStates, [type]: false });
      }, 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: `${filename} has been downloaded.`,
    });
  };

  const handleDownloadDOCX = async () => {
    try {
      // Convert markdown to plain text for DOCX
      const plainText = result.document
        .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
        .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
        .replace(/^-\s+/gm, '• '); // Convert list items

      const doc = new Document({
        sections: [{
          properties: {},
          children: plainText.split('\n').filter(line => line.trim()).map(line => 
            new Paragraph({
              children: [new TextRun(line)],
            })
          ),
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'architecture.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "DOCX Downloaded",
        description: "Architecture document exported as Word document successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export document as DOCX.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF();
      
      // Convert markdown to plain text and add to PDF
      const plainText = result.document
        .replace(/^#{1,6}\s+/gm, '') // Remove markdown headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
        .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
        .replace(/^-\s+/gm, '• '); // Convert list items

      const lines = pdf.splitTextToSize(plainText, 180);
      pdf.text(lines, 15, 20);

      // If there's a diagram, try to add it
      if (mermaidRef.current && mermaidRef.current.querySelector('svg')) {
        try {
          const canvas = await html2canvas(mermaidRef.current);
          const imgData = canvas.toDataURL('image/png');
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, 10, 190, 100);
        } catch (diagramError) {
          console.error('Error adding diagram to PDF:', diagramError);
        }
      }

      pdf.save('architecture.pdf');

      toast({
        title: "PDF Downloaded",
        description: "Architecture document exported as PDF successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export document as PDF.",
        variant: "destructive",
      });
    }
  };

  const renderMarkdown = (markdown: string) => {
    // Simple markdown rendering - in production, use a proper markdown parser
    return markdown
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-foreground">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mt-5 mb-3 text-foreground">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium mt-4 mb-2 text-foreground">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="mb-2 text-muted-foreground leading-relaxed">{line}</p>;
      });
  };

  return (
    <Tabs defaultValue="document" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="document" className="text-xs">
            <FileText className="h-4 w-4 mr-1" />
            Document
          </TabsTrigger>
          <TabsTrigger value="diagram" className="text-xs">
            <Share className="h-4 w-4 mr-1" />
            Diagram
          </TabsTrigger>
          <TabsTrigger value="raw" className="text-xs">
            <Copy className="h-4 w-4 mr-1" />
            Raw Code
          </TabsTrigger>
        </TabsList>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDownloadText(result.document, 'architecture.txt')}
          >
            <Download className="h-4 w-4" />
            Download Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadDOCX}
          >
            <Download className="h-4 w-4" />
            Export DOCX
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <TabsContent value="document" className="mt-0">
        <Card className="material-card">
          <CardContent className="p-6">
            <div className="prose prose-invert max-w-none">
              {renderMarkdown(result.document)}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="diagram" className="mt-0">
        <Card className="material-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-xs">
                Mermaid Diagram
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(result.diagram, 'Diagram')}
              >
                {copiedStates['Diagram'] ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy
              </Button>
            </div>
            <div 
              ref={mermaidRef}
              className="bg-muted/30 rounded-lg p-4 overflow-x-auto min-h-[300px] flex items-center justify-center"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="raw" className="mt-0">
        <Card className="material-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="text-xs">
                Mermaid Source Code
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(result.diagram, 'Raw Code')}
              >
                {copiedStates['Raw Code'] ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy
              </Button>
            </div>
            <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-sm font-mono text-muted-foreground">
              <code>{result.diagram}</code>
            </pre>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}