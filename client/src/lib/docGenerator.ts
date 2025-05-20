import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  WidthType,
  PageOrientation,
  PageNumber,
  Footer,
  Header
} from 'docx';

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
}

function createStyledCell(text: string, isHeader = false) {
  return new TableCell({
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    },
    shading: isHeader ? { fill: "EEEEEE" } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: text,
            bold: isHeader,
            size: 20,
          }),
        ],
      }),
    ],
  });
}

function createTableWithHeader(headers: string[], rows: string[][]) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
    },
    rows: [
      new TableRow({
        children: headers.map(header => createStyledCell(header, true)),
      }),
      ...rows.map(row => 
        new TableRow({
          children: row.map(cell => createStyledCell(cell)),
        })
      ),
    ],
  });
}

function createHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'BRASILIT',
            bold: true,
            size: 24,
          }),
        ],
      }),
    ],
  });
}

function createFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun("Página "),
          new TextRun({
            children: [PageNumber.CURRENT],
          }),
          new TextRun(" de "),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
          }),
        ],
      }),
    ],
  });
}

export async function generateWordDocument(data: ReportData) {
  const sections: Array<Paragraph | Table> = [];

  // Cabeçalho do documento
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
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
    })
  );

  // Seção de Identificação
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: '1. IDENTIFICAÇÃO',
          bold: true,
          size: 28,
        }),
      ],
    })
  );

  // Tabela de identificação
  sections.push(
    createTableWithHeader(
      ['Campo', 'Informação'],
      [
        ['Cliente', data.clientName],
        ['Projeto', data.projectName],
        ['Endereço', `${data.address || ''}, ${data.number || ''}`],
        ['Cidade/Estado', `${data.city || ''} - ${data.state || ''}`],
      ]
    )
  );

  // Seção de Informações do Produto
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400 },
      children: [
        new TextRun({
          text: '2. INFORMAÇÕES DO PRODUTO',
          bold: true,
          size: 28,
        }),
      ],
    })
  );

  // Tabela de informações do produto
  sections.push(
    createTableWithHeader(
      ['Campo', 'Informação'],
      [
        ['Modelo', data.roofModel || 'N/A'],
        ['Quantidade', data.quantity?.toString() || 'N/A'],
        ['Área', data.area ? `${data.area} m²` : 'N/A'],
        ['Data de Instalação', data.installationDate || 'N/A'],
      ]
    )
  );

  // Seção de Análise Técnica
  if (data.technicalAnalysis?.length) {
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: '3. ANÁLISE TÉCNICA',
            bold: true,
            size: 28,
          }),
        ],
      }),
      createTableWithHeader(
        ['Item', 'Descrição'],
        data.technicalAnalysis.map(item => [item.item, item.description])
      )
    );
  }

  // Seção de Conclusão
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400 },
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
          text: data.conclusion === 'approved' ? 'APROVADO' : 'REPROVADO',
          bold: true,
          color: data.conclusion === 'approved' ? '008000' : 'FF0000',
          size: 24,
        }),
      ],
    })
  );

  // Adicionar recomendações se houver
  if (data.recommendations) {
    sections.push(
      new Paragraph({
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: 'Recomendações:',
            bold: true,
            size: 24,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: data.recommendations,
            size: 24,
          }),
        ],
      })
    );
  }

  // Criar o documento
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1400,
            right: 1000,
            bottom: 1400,
            left: 1000,
          },
          size: {
            orientation: PageOrientation.PORTRAIT,
          },
        },
      },
      headers: {
        default: createHeader(),
      },
      footers: {
        default: createFooter(),
      },
      children: sections,
    }],
  });

  // Gerar e salvar o documento
  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `Laudo_${data.protocolNumber}.docx`);
}