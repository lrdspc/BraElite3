import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, File, FileText, Image } from 'lucide-react';

interface SharedContent {
  title?: string;
  text?: string;
  url?: string;
  files?: FileList;
}

export default function ShareTarget() {
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [location, navigate] = useLocation();

  useEffect(() => {
    async function processShareTarget() {
      setLoading(true);
      
      // Verificar se esta página foi aberta por um share target
      const url = new URL(window.location.href);
      if (url.pathname === '/share-target' && url.searchParams.has('share-target')) {
        try {
          // Para compartilhamentos via GET
          const title = url.searchParams.get('title');
          const text = url.searchParams.get('text');
          const sharedUrl = url.searchParams.get('url');
          // Não há suporte a arquivos via GET, apenas via POST (não implementado aqui)
          setSharedContent({
            title: title || '',
            text: text || '',
            url: sharedUrl || '',
            files: null
          });
        } catch (error) {
          console.error('Erro ao processar compartilhamento:', error);
        }
      } else {
        // Redirecionamento se não vier de um share target
        navigate('/');
      }
      setLoading(false);
    }
    processShareTarget();
  }, [navigate, location]);

  const handleUseContent = () => {
    // Aqui você implementaria a lógica para usar o conteúdo compartilhado
    // Por exemplo, criar uma nova inspeção com as imagens compartilhadas
    
    // Navegar para a página adequada, possivelmente passando os dados
    navigate('/inspection/new', { state: { sharedContent } });
  };
  
  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-4 h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="mr-2" /> 
            Conteúdo Compartilhado
          </CardTitle>
          <CardDescription>
            Recebemos o seguinte conteúdo para usar em uma vistoria:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sharedContent?.title && (
            <div className="border-b pb-2">
              <p className="text-sm text-muted-foreground">Título:</p>
              <p className="font-medium">{sharedContent.title}</p>
            </div>
          )}
          
          {sharedContent?.text && (
            <div className="border-b pb-2">
              <p className="text-sm text-muted-foreground">Texto:</p>
              <p className="font-medium">{sharedContent.text}</p>
            </div>
          )}
          
          {sharedContent?.url && (
            <div className="border-b pb-2">
              <p className="text-sm text-muted-foreground">URL:</p>
              <a href={sharedContent.url} target="_blank" rel="noopener noreferrer" 
                 className="text-primary hover:underline break-all">
                {sharedContent.url}
              </a>
            </div>
          )}
          
          {sharedContent?.files && sharedContent.files.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Arquivos ({sharedContent.files.length}):</p>
              <div className="grid grid-cols-2 gap-2">
                {Array.from(sharedContent.files).map((file, index) => (
                  <div key={index} className="border rounded p-2 flex items-center">
                    {file.type.startsWith('image/') ? (
                      <Image className="h-4 w-4 mr-2" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-xs truncate">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleUseContent}>
              Usar Conteúdo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
