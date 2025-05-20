import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

export interface FormData {
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
    severity: 'high' | 'medium' | 'low';
    notes: string;
    selected: boolean;
  }>;
  conclusion: 'approved' | 'rejected' | 'pending';
  recommendations: string[];
  signature: boolean;
  inspectorName: string;
}

export async function generateDocument(formData: FormData): Promise<Buffer> {
  try {
    // Cabeçalho do documento
    const elements = [
      // Título principal
      new Paragraph({
        children: [
          new TextRun({
            text: 'RELATÓRIO DE VISTORIA TÉCNICA',
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // Dados do cliente
      new Paragraph({
        children: [
          new TextRun({
            text: '1. DADOS DO CLIENTE',
            bold: true,
            size: 22,
            underline: {},
          }),
        ],
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
        spacing: { after: 300 },
      }),

      // Dados do produto
      new Paragraph({
        children: [
          new TextRun({
            text: '2. DADOS DO PRODUTO',
            bold: true,
            size: 22,
            underline: {},
          }),
        ],
        spacing: { before: 100, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Modelo: ${formData.roofModel}`,
            size: 22,
          }),
          new TextRun({
            text: `\nData de Instalação: ${formData.installationDate}`,
            size: 22,
          }),
          new TextRun({
            text: `\nÁrea: ${formData.area} m²`,
            size: 22,
          }),
          new TextRun({
            text: `\nQuantidade: ${formData.quantity} unidades`,
            size: 22,
          }),
        ],
        spacing: { after: 300 },
      }),

      // Análise
      new Paragraph({
        children: [
          new TextRun({
            text: '3. ANÁLISE',
            bold: true,
            size: 22,
            underline: {},
          }),
        ],
        spacing: { before: 100, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Não conformidades identificadas:',
            bold: true,
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      }),
    ];

    // Adicionar tabela de não conformidades
    const nonConformities = formData.nonConformities.filter(nc => nc.selected);
    if (nonConformities.length > 0) {
      const table = new Table({
        rows: [
          // Cabeçalho da tabela
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Não Conformidade', bold: true, size: 20 })]
                })],
                width: { size: 40, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Gravidade', bold: true, size: 20 })]
                })],
                width: { size: 30, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({
                  children: [new TextRun({ text: 'Observações', bold: true, size: 20 })]
                })],
                width: { size: 30, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
          // Linhas da tabela
          ...nonConformities.map(nc => 
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph(nc.name)],
                  width: { size: 40, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph(nc.severity === 'high' ? 'Alta' : nc.severity === 'medium' ? 'Média' : 'Baixa')],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
                new TableCell({
                  children: [new Paragraph(nc.notes || '')],
                  width: { size: 30, type: WidthType.PERCENTAGE },
                }),
              ],
            })
          ),
        ],
      });
      elements.push(table);
    }

    // Adicionar conclusão
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '4. CONCLUSÃO',
            bold: true,
            size: 22,
            underline: {},
          }),
        ],
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: formData.recommendations.join('\n\n'),
            size: 22,
          }),
        ],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Status: ${formData.conclusion === 'approved' ? 'Aprovado' : formData.conclusion === 'rejected' ? 'Reprovado' : 'Pendente'}`,
            size: 22,
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
      })
    );

    // Adicionar assinatura se necessário
    if (formData.signature) {
      elements.push(
        new Paragraph({ spacing: { after: 200 } }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Assinatura:',
              size: 22,
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: formData.inspectorName,
              size: 22,
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: new Date().toLocaleDateString('pt-BR'),
              size: 22,
              bold: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
        })
      );
    }

    // Criar o documento final
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: elements,
        },
      ],
    });

    // Gerar o buffer do documento
    return await Packer.toBuffer(doc);
  } catch (error) {
    console.error('Erro na geração do documento:', error);
    throw error;
  }
}
