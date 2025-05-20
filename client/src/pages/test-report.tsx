import React, { useState } from 'react';
import { generateWordDocument } from '@/lib/docGenerator';

const TestReportPage: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const mockData = {
        protocolNumber: 'VT-2025-001',
        clientName: 'Cliente Teste',
        projectName: 'Projeto Exemplo',
        address: 'Rua das Flores',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
        scheduledDate: '2025-05-19',
        conclusion: 'approved' as const,
        roofModel: 'Modelo Premium',
        quantity: 10,
        area: 150.5,
        installationDate: '2024-12-01',
        technicalAnalysis: [
          {
            item: 'Estrutura',
            description: 'Estrutura em perfeito estado',
          },
          {
            item: 'Vedação',
            description: 'Vedação adequada em todos os pontos',
          },
          {
            item: 'Fixação',
            description: 'Parafusos e fixadores em bom estado',
          },
        ],
        recommendations: 'Manutenção preventiva recomendada a cada 12 meses.',
        evidences: [
          {
            url: 'https://via.placeholder.com/800x600.png?text=Evidencia+1',
            description: 'Vista geral da estrutura',
          },
          {
            url: 'https://via.placeholder.com/800x600.png?text=Evidencia+2',
            description: 'Detalhe da fixação',
          },
        ],
      };

      await generateWordDocument(mockData);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Teste de Geração de Relatório</h1>
      
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="text-muted-foreground mb-4">
          Esta página permite testar a geração de relatórios em formato DOCX.
          O relatório gerado incluirá dados de exemplo com textos, tabelas e imagens.
        </p>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {isGenerating ? 'Gerando relatório...' : 'Gerar Relatório de Teste'}
        </button>
      </div>
    </div>
  );
};

export default TestReportPage;
