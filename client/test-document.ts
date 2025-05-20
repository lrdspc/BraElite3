import { Document, Paragraph, TextRun, Packer } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

interface FormData {
  clientName: string;
  clientType: 'company' | 'residential';
  address: string;
  document: string;
  roofModel: string;
  installationDate: string;
  area: string;
  quantity: string;
  nonConformities: Array<{
    name: string;
    description: string;
    severity: string;
    notes: string;
    selected: boolean;
  }>;
  conclusion: string;
  recommendations: string[];
  signature: boolean;
  inspectorName: string;
}

// Função de geração de documento simplificada
async function generateDocument(formData: FormData): Promise<Buffer> {
  try {
    // @ts-ignore - Ignorando erros de tipo para o docx
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'RELATÓRIO DE VISTORIA TÉCNICA',
                  bold: true,
                  size: 28,
                }),
              ],
              alignment: 'center',
              // @ts-ignore - Ignorando erros de tipo para o docx
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '1. DADOS DO CLIENTE',
                  bold: true,
                  size: 22,
                }),
              ],
              // @ts-ignore - Ignorando erros de tipo para o docx
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Nome: ${formData.clientName}`,
                  size: 22,
                }),
                new TextRun({
                  text: `\nTipo: ${formData.clientType === 'company' ? 'Empresa' : 'Residencial'}`,
                  size: 22,
                }),
                new TextRun({
                  text: `\nEndereço: ${formData.address}`,
                  size: 22,
                }),
                new TextRun({
                  text: `\n${formData.clientType === 'company' ? 'CNPJ' : 'CPF'}: ${formData.document}`,
                  size: 22,
                }),
              ],
              spacing: { after: 200 },
            }),
          ],
        },
      ],
    });


    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error('Erro na geração do documento:', error);
    throw error;
  }
}

// Dados de exemplo para teste
const testData: FormData = {
  clientName: 'João da Silva',
  clientType: 'residential',
  address: 'Rua Exemplo, 123 - São Paulo/SP',
  document: '123.456.789-00',
  roofModel: 'Telha Colonial',
  installationDate: '01/01/2023',
  area: '150',
  quantity: '200',
  nonConformities: [
    {
      name: 'Falha na vedação',
      description: 'Vedação inadequada nas telhas',
      severity: 'high',
      notes: 'Necessário refazer a vedação',
      selected: true
    },
    {
      name: 'Telhas danificadas',
      description: '5 telhas com trincas',
      severity: 'medium',
      notes: 'Substituir telhas danificadas',
      selected: true
    }
  ],
  conclusion: 'approved',
  recommendations: [
    'Refazer a vedação conforme especificações do fabricante',
    'Substituir as telhas danificadas',
    'Verificar a estrutura de suporte'
  ],
  signature: true,
  inspectorName: 'Carlos Eduardo'
};

// Executar o teste
async function testDocumentGeneration() {
  try {
    console.log('Iniciando geração do documento de teste...');
    
    // Verificar se o diretório existe
    const outputDir = path.join(__dirname, 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, 'test-document.docx');
    
    console.log('Chamando generateDocument...');
    const buffer = await generateDocument(testData);
    
    console.log('Salvando arquivo...');
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`✅ Documento gerado com sucesso em: ${outputPath}`);
    console.log(`✅ Tamanho do arquivo: ${(buffer.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Erro ao gerar o documento:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Executar o teste
console.log('Iniciando teste...');
testDocumentGeneration()
  .then(() => console.log('Teste concluído'))
  .catch(err => console.error('Erro no teste:', err));
