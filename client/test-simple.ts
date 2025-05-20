import { generateDocument } from './src/lib/documentGenerator';
import { Packer } from 'docx';

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
    }
  ],
  conclusion: "approved",
  recommendations: ["Realizar ajustes necessários", "Monitorar por 30 dias"],
  signature: true,
  inspectorName: "João Silva"
};

async function test() {
  try {
    const buffer = await generateDocument(exampleData);
    
    // Salvar o documento
    const fs = require('fs');
    fs.writeFileSync('test-document.docx', buffer);
    console.log('Documento gerado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar documento:', error);
  }
}

test();
