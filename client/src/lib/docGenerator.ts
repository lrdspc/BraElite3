import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, HeadingLevel, ImageRun } from 'docx';

interface ReportData {
  protocolNumber: string;
  clientName: string;
  projectName: string;
  address?: string;
  number?: string;
  city?: string;
  state?: string;
  scheduledDate: string;
  conclusion: 'approved' | 'rejected';
  recommendation?: string;
  roofModel?: string;
  quantity?: number;
  area?: number;
  installationDate?: string;
  technicalAnalysis?: Array<{
    item: string;
    description: string;
  }>;
  recommendations?: string;
  evidences?: Array<{
    url: string;
    description: string;
  }>;
}

export async function generateWordDocument(data: ReportData) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Cabeçalho
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: 'LAUDO TÉCNICO DE VISTORIA',
              bold: true,
              size: 32,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Protocolo: ${data.protocolNumber}`,
              size: 24,
            }),
          ],
        }),

        // Informações do Cliente
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: '1. IDENTIFICAÇÃO',
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Table({
          width: {
            size: 100,
            type: 'pct',
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Cliente:' })],
                  width: {
                    size: 20,
                    type: 'pct',
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ text: data.clientName })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Projeto:' })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: data.projectName })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Endereço:' })],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: [
                        data.address,
                        data.number && `, ${data.number}`,
                        data.city && ` - ${data.city}`,
                        data.state && `, ${data.state}`,
                      ].filter(Boolean).join(''),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        // Detalhes do Produto
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: '2. DETALHES DO PRODUTO',
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Table({
          width: {
            size: 100,
            type: 'pct',
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Modelo:' })],
                  width: {
                    size: 20,
                    type: 'pct',
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ text: data.roofModel || 'Não especificado' })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Quantidade:' })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: `${data.quantity || 'Não especificado'} unidades` })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Área:' })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: `${data.area || 'Não especificado'} m²` })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ text: 'Data de Instalação:' })],
                }),
                new TableCell({
                  children: [new Paragraph({ text: data.installationDate || 'Não especificado' })],
                }),
              ],
            }),
          ],
        }),

        // Análise Técnica
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: '3. ANÁLISE TÉCNICA',
              bold: true,
              size: 28,
            }),
          ],
        }),
        ...(data.technicalAnalysis?.map((analysis, index) => [
          new Paragraph({
            bullet: {
              level: 0,
            },
            children: [
              new TextRun({
                text: `${analysis.item}: `,
                bold: true,
              }),
              new TextRun({
                text: analysis.description,
              }),
            ],
          }),
        ]).flat() || []),

        // Conclusão
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: '4. CONCLUSÃO',
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Status: ',
              bold: true,
            }),
            new TextRun({
              text: data.conclusion === 'approved' ? 'PROCEDENTE' : 'IMPROCEDENTE',
              color: data.conclusion === 'approved' ? '008000' : 'FF0000',
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'Justificativa: ',
              bold: true,
            }),
            new TextRun({
              text: data.recommendation || 'Nenhuma justificativa informada',
            }),
          ],
        }),

        // Recomendações
        ...(data.recommendations ? [
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '5. RECOMENDAÇÕES',
                bold: true,
                size: 28,
              }),
            ],
          }),
          ...data.recommendations.split(',').map(rec => 
            new Paragraph({
              bullet: {
                level: 0,
              },
              children: [
                new TextRun({
                  text: rec.trim(),
                }),
              ],
            })
          ),
        ] : []),

        // Evidências
        ...(data.evidences?.length ? [
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: '6. EVIDÊNCIAS FOTOGRÁFICAS',
                bold: true,
                size: 28,
              }),
            ],
          }),
          ...data.evidences.map((evidence, index) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Imagem ${index + 1}: ${evidence.description}`,
                  bold: true,
                }),
              ],
            }),
            // Aqui você pode adicionar a imagem usando ImageRun
            // Necessário implementar a lógica de carregamento da imagem
          ]).flat(),
        ] : []),

        // Rodapé
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`,
              size: 20,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Para validar este documento, acesse www.brasilit.com.br/validar e informe o código ${data.protocolNumber}`,
              size: 20,
            }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `laudo-tecnico-${data.protocolNumber}.docx`);
}