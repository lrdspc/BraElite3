import { generateDocument } from './src/lib/documentGenerator';
import { Document, Packer } from 'docx';

const exampleData = {
  clientName: "Empresa Teste LTDA",
  clientType: "company",
  address: "Rua das Flores, 123 - Centro",
  document: "12.345.678/0001-90",
  roofModel: "Modelo Solar Max",
  installationDate: "2025-05-20",
  area: "150",
  quantity: "100",
  nonConformities: [
    {
      name: "Alinhamento das telhas",
      description: "Desalinhamento em algumas telhas",
      severity: "medium",
      notes: "Necessário ajuste na instalação",
      selected: true
    },
    {
      name: "Isolamento elétrico",
      description: "Faltando isolamento em alguns pontos",
      severity: "high",
      notes: "Risco de curto-circuito",
      selected: true
    },
    {
      name: "Marcação de identificação",
      description: "Ausência de marcação em algumas telhas",
      severity: "low",
      notes: "Recomendado adicionar marcação",
      selected: true
    }
  ],
  conclusion: "pending",
  recommendations: [
    "Realizar ajuste no alinhamento das telhas",
    "Instalar isolamento elétrico em todos os pontos",
    "Adicionar marcação de identificação em todas as telhas"
  ],
  signature: true,
  inspectorName: "João Silva"
};

async function testGenerateDocument() {
  try {
    const buffer = await generateDocument(exampleData);
    console.log('Documento gerado com sucesso!');
    // Aqui você pode salvar o buffer em um arquivo .docx
    const fs = require('fs');
    fs.writeFileSync('relatorio.docx', buffer);
    console.log('Documento salvo como relatorio.docx');
  } catch (error) {
    console.error('Erro ao gerar documento:', error);
  }
}

testGenerateDocument();
