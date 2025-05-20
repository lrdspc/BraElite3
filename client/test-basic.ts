import { Document, Packer, Paragraph, HeadingLevel } from 'docx';

const doc = new Document({
  creator: "BraElite3",
  title: "Teste Básico",
  description: "Teste básico de geração de documento",
  sections: [{
    properties: {},
    children: [
      new Paragraph({
        text: "Teste de Documento",
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: "Este é um parágrafo de teste",
      }),
    ],
  }],
});

async function test() {
  try {
    const buffer = await Packer.toBuffer(doc);
    console.log('Documento gerado com sucesso!');
    const fs = require('fs');
    fs.writeFileSync('test.docx', buffer);
    console.log('Documento salvo como test.docx');
  } catch (error) {
    console.error('Erro:', error);
  }
}

test();
