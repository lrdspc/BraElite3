import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  AlignmentType,
  HeadingLevel,
  ImageRun,
  IRunOptions,
  ITableCellOptions
} from 'docx';

interface ReportData {
  protocolNumber: string;
  clientName: string;
  projectName: string;
  address?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  scheduledDate: string; // Idealmente, formatar como dd/MM/yyyy
  executionDate?: string; // Idealmente, formatar como dd/MM/yyyy
  conclusion: 'approved' | 'rejected' | 'approved_with_reservations';
  reason?: string; // Usado se rejeitado ou aprovado com ressalvas
  recommendation?: string;
  roofModel?: string;
  quantity?: number;
  area?: number;
  installationDate?: string; // Idealmente, formatar como dd/MM/yyyy
  productUsed?: string;
  technicalAnalysis?: Array<{
    item: string;
    description: string;
    conformity: 'conforme' | 'nao_conforme' | 'nao_aplicavel';
    observations?: string;
  }>;
  evidencePhotos?: Array<{
    url: string; // URL da imagem ou base64
    caption?: string;
  }>;
  signatureDataUrl?: string; // Assinatura do técnico em base64
  technicianName?: string;
}

function createStyledCell(text: string = "", isHeader = false, bold = false, fontSize = 20, alignment: AlignmentType = AlignmentType.LEFT): TableCell {
  const cellOptions: ITableCellOptions = {
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
    },
    shading: isHeader ? { fill: "E0E0E0" } : undefined,
    verticalAlign: "center",
    children: [
      new Paragraph({
        alignment: alignment,
        children: [
          new TextRun({
            text: text,
            bold: isHeader || bold,
            size: fontSize, // docx usa half-points, então 20 = 10pt
            font: "Calibri",
          } as IRunOptions),
        ],
      }),
    ],
  };
  return new TableCell(cellOptions);
}

function createTable(rowsData: Array<{cells: Array<{text: string, bold?: boolean, isHeader?: boolean, colSpan?: number, alignment?: AlignmentType}>}>, columnWidths?: number[]) {
  return new Table({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    columnWidths: columnWidths || [],
    rows: rowsData.map(rowData => 
      new TableRow({
        children: rowData.cells.map(cellData => createStyledCell(cellData.text, cellData.isHeader, cellData.bold, undefined, cellData.alignment)),
      })
    ),
  });
}

function createHeaderImage(): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({ text: "BRASILIT VISTORIAS TÉCNICAS", bold: true, size: 28, font: "Calibri" } as IRunOptions),
    ],
    spacing: { after: 200 },
  });
}

function createFooterContent(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Brasilit Saint-Gobain - Laudo Técnico de Vistoria", size: 16, font: "Calibri" } as IRunOptions),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: "Página ", size: 16, font: "Calibri" } as IRunOptions),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Calibri" } as IRunOptions),
          new TextRun({ text: " de ", size: 16, font: "Calibri" } as IRunOptions),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: "Calibri" } as IRunOptions),
        ],
      }),
    ],
  });
}

function addSectionTitle(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 24, // 12pt
        font: "Calibri",
        color: "2F5496", // Um azul corporativo
      } as IRunOptions),
    ],
    border: { bottom: { color: "2F5496", space: 1, style: BorderStyle.SINGLE, size: 6 } }
  });
}

async function getImageDimensions(dataUrl: string): Promise<{width: number, height: number}> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      // Ajustar para caber no documento, mantendo proporção
      const maxWidth = 500; // Largura máxima em pixels para a imagem no documento
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = height * ratio;
      }
      // Limitar a altura também para evitar imagens muito longas
      const maxHeight = 700;
      if (height > maxHeight) {
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }
      resolve({ width, height });
    };
    img.onerror = () => {
      resolve({ width: 200, height: 150 }); // fallback
    };
    img.src = dataUrl;
  });
}

// Helper function to convert Blob to Base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


export async function generateWordDocument(data: ReportData): Promise<Blob> {
  const docChildren: (Paragraph | Table)[] = [];

  docChildren.push(
    createHeaderImage(), // Adiciona a imagem/texto do cabeçalho
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'LAUDO TÉCNICO DE VISTORIA',
          bold: true,
          size: 32, // 16pt
          font: "Calibri",
        } as IRunOptions),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Protocolo: ${data.protocolNumber || 'N/A'}`,
          size: 24, // 12pt
          font: "Calibri",
        } as IRunOptions),
      ],
      spacing: { after: 400 },
    })
  );

  docChildren.push(addSectionTitle('1. IDENTIFICAÇÃO DO CLIENTE E OBRA'));
  docChildren.push(createTable([
    { cells: [{ text: "Cliente:", bold: true }, { text: data.clientName || "" }] },
    { cells: [{ text: "Obra/Projeto:", bold: true }, { text: data.projectName || "" }] },
    { cells: [{ text: "Endereço:", bold: true }, { text: `${data.address || ""}, ${data.number || "S/N"}${data.complement ? " - "+data.complement : ""}` }] },
    { cells: [{ text: "Bairro:", bold: true }, { text: data.neighborhood || "" }] },
    { cells: [{ text: "Cidade/UF:", bold: true }, { text: `${data.city || ""}/${data.state || ""}` }] },
    { cells: [{ text: "CEP:", bold: true }, { text: data.zipCode || "" }] },
  ], [2000, 7500])); // Larguras das colunas em DXA (1/20 de um ponto)

  docChildren.push(addSectionTitle('2. DADOS DA VISTORIA'));
  docChildren.push(createTable([
    { cells: [{ text: "Data Agendada:", bold: true }, { text: data.scheduledDate || "" }] },
    { cells: [{ text: "Data Execução:", bold: true }, { text: data.executionDate || data.scheduledDate || "" }] }, // Fallback para scheduledDate
    { cells: [{ text: "Técnico Responsável:", bold: true }, { text: data.technicianName || "Não informado" }] },
  ], [2000, 7500]));

  docChildren.push(addSectionTitle('3. INFORMAÇÕES DO PRODUTO E INSTALAÇÃO'));
  docChildren.push(createTable([
    { cells: [{ text: "Produto Utilizado:", bold: true }, { text: data.productUsed || "" }] },
    { cells: [{ text: "Modelo da Telha/Produto:", bold: true }, { text: data.roofModel || "" }] },
    { cells: [{ text: "Quantidade:", bold: true }, { text: data.quantity?.toString() || "" }] },
    { cells: [{ text: "Área (m²):", bold: true }, { text: data.area?.toString() || "" }] },
    { cells: [{ text: "Data da Instalação:", bold: true }, { text: data.installationDate || "" }] },
  ], [3000, 6500]));
  
  // Seção de Análise Técnica
  if (data.technicalAnalysis && data.technicalAnalysis.length > 0) {
    docChildren.push(addSectionTitle('4. ANÁLISE TÉCNICA DETALHADA'));
    // Definindo o tipo para as células da análise para corrigir o erro de map
    const analysisTableRows = data.technicalAnalysis.map(item => {
      return new TableRow({
        children: [
          createStyledCell(item.item || "", false, false, 18, AlignmentType.LEFT),
          createStyledCell(item.description || "", false, false, 18, AlignmentType.LEFT),
          createStyledCell(item.conformity ? item.conformity.replace("_", " ").toUpperCase() : "", false, false, 18, AlignmentType.CENTER),
          createStyledCell(item.observations || "", false, false, 18, AlignmentType.LEFT),
        ]
      });
    });

    docChildren.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [2500, 3500, 1500, 2000],
        rows: [
          new TableRow({
            children: [
              createStyledCell("Item Analisado", true, true, undefined, AlignmentType.CENTER),
              createStyledCell("Descrição Esperada", true, true, undefined, AlignmentType.CENTER),
              createStyledCell("Conformidade", true, true, undefined, AlignmentType.CENTER),
              createStyledCell("Observações", true, true, undefined, AlignmentType.CENTER),
            ],
          }),
          ...analysisTableRows, // Usando as linhas processadas
        ],
      })
    );
  }

  // Seção de Evidências Fotográficas
  if (data.evidencePhotos && data.evidencePhotos.length > 0) {
    docChildren.push(addSectionTitle('5. EVIDÊNCIAS FOTOGRÁFICAS'));
    for (const photo of data.evidencePhotos) {
      if (photo.url) {
        try {
          // Se a URL já for base64, use diretamente, senão, busque e converta
          let imageDataUrl = photo.url;
          if (!photo.url.startsWith('data:image')) {
            const imageBlob = await fetch(photo.url).then(res => res.blob());
            imageDataUrl = await blobToBase64(imageBlob);
          }
          
          const dimensions = await getImageDimensions(imageDataUrl);

          docChildren.push(new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imageDataUrl, // Agora é uma string base64
                transformation: {
                  width: dimensions.width,
                  height: dimensions.height,
                },
              }),
            ],
            spacing: { after: 100 },
          }));
          if (photo.caption) {
            docChildren.push(new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: photo.caption, italics: true, size: 18, font: "Calibri" } as IRunOptions)],
              spacing: { after: 200 },
            }));
          }
        } catch (e) {
          console.error("Erro ao carregar imagem para DOCX:", e);
          docChildren.push(new Paragraph({ children: [new TextRun({text: `[Erro ao carregar imagem: ${photo.caption || 'imagem'}]`})]}));
        }
      }
    }
  }
  
  // Seção de Conclusão e Recomendações
  docChildren.push(addSectionTitle('6. CONCLUSÃO E RECOMENDAÇÕES'));
  let conclusionText = "Não definido";
  if (data.conclusion === 'approved') conclusionText = "Aprovado";
  if (data.conclusion === 'rejected') conclusionText = "Reprovado";
  if (data.conclusion === 'approved_with_reservations') conclusionText = "Aprovado com Ressalvas";

  docChildren.push(createTable([
    { cells: [{ text: "Resultado da Vistoria:", bold: true, isHeader: true }, { text: conclusionText, bold: true }] },
  ], [3000, 6500]));

  if (data.reason) {
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: "Justificativa/Motivo:", bold: true, size: 22, font: "Calibri" } as IRunOptions)],
      spacing: { before: 100 }
    }));
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: data.reason, size: 20, font: "Calibri" } as IRunOptions)],
      spacing: { after: 100 }
    }));
  }

  if (data.recommendation) {
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: "Recomendações Técnicas:", bold: true, size: 22, font: "Calibri" } as IRunOptions)],
      spacing: { before: 100 }
    }));
    docChildren.push(new Paragraph({
      children: [new TextRun({ text: data.recommendation, size: 20, font: "Calibri" } as IRunOptions)],
      spacing: { after: 200 }
    }));
  }

  docChildren.push(addSectionTitle('7. ASSINATURA DO TÉCNICO'));
  if (data.signatureDataUrl) {
    try {
      // Assumindo que signatureDataUrl já é uma string base64
      const dimensions = await getImageDimensions(data.signatureDataUrl);
      // Não precisa buscar e converter se já é base64
      // const signatureBlob = await fetch(data.signatureDataUrl).then(res => res.blob());
      // const signatureBase64 = await blobToBase64(signatureBlob); // Não é mais necessário se já for base64

      docChildren.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: data.signatureDataUrl, // Usar diretamente se for base64
            transformation: {
              width: dimensions.width > 200 ? 200 : dimensions.width, // Limitar largura da assinatura
              height: dimensions.height * ( (dimensions.width > 200 ? 200 : dimensions.width) / dimensions.width ), // Manter proporção
            },
          }),
        ],
        spacing: { after: 50 },
      }));
    } catch (e) {
      console.error("Erro ao carregar assinatura para DOCX:", e);
      docChildren.push(new Paragraph({ children: [new TextRun({text: "[Erro ao carregar assinatura]"})]}));
    }
  }
  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "_".repeat(40), size: 20, font: "Calibri" } as IRunOptions)],
  }));
  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: data.technicianName || "Técnico Responsável", bold: true, size: 20, font: "Calibri" } as IRunOptions)],
    spacing: { after: 400 },
  }));

  docChildren.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `Laudo gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, size: 18, font: "Calibri", italics: true } as IRunOptions)],
  }));


  const doc = new Document({
    creator: "Brasilit Vistorias Técnicas",
    title: `Laudo Técnico - ${data.protocolNumber}`,
    description: `Laudo técnico de vistoria para o cliente ${data.clientName}, projeto ${data.projectName}.`,
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            font: "Calibri",
            size: 22, // 11pt (padrão Word)
          },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            font: "Calibri Light",
            size: 32, // 16pt
            bold: true,
            color: "2F5496", // Azul
          },
          paragraph: {
            spacing: { after: 120, before: 240 },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            font: "Calibri Light",
            size: 26, // 13pt
            bold: true,
            color: "2F5496",
          },
          paragraph: {
            spacing: { after: 120, before: 240 },
          },
        },
      ],
    },
    sections: [{
      headers: {
        default: new Header({ children: [createHeaderImage()] }),
      },
      footers: {
        default: createFooterContent(),
      },
      children: docChildren, // Usar o array corrigido aqui
    }],
  });

  return Packer.toBlob(doc);
}