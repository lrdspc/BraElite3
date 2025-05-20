"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocument = generateDocument;
var docx_1 = require("docx");
function generateDocument(formData) {
    return __awaiter(this, void 0, void 0, function () {
        var data, doc, buffer;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    data = {
                        client: {
                            name: formData.clientName,
                            email: '',
                            phone: '',
                            address: formData.address,
                        },
                        product: {
                            model: formData.roofModel,
                            installationDate: formData.installationDate,
                        },
                        analysis: {
                            nonConformities: formData.nonConformities
                                .filter(function (nc) { return nc.selected; })
                                .map(function (nc) { return "".concat(nc.name, ": ").concat(nc.description, " - ").concat(nc.severity === 'high' ? 'Alta' : nc.severity === 'medium' ? 'Média' : 'Baixa'); }),
                            notes: ((_a = formData.nonConformities.find(function (nc) { return nc.selected; })) === null || _a === void 0 ? void 0 : _a.notes) || '',
                        },
                        conclusion: {
                            recommendations: formData.recommendations.join('\n'),
                            status: formData.conclusion === 'approved' ? 'Aprovado' : formData.conclusion === 'rejected' ? 'Reprovado' : 'Pendente',
                        },
                    };
                    doc = new docx_1.Document({
                        creator: "BraElite3",
                        title: "Relatório de Vistoria Técnica",
                        description: "Relatório gerado automaticamente após vistoria técnica",
                        sections: [{
                                properties: {},
                                children: [
                                    new docx_1.Paragraph({
                                        text: "RELATÓRIO DE VISTORIA TÉCNICA",
                                        heading: docx_1.HeadingLevel.TITLE,
                                        alignment: docx_1.AlignmentType.CENTER,
                                    }),
                                    new docx_1.Paragraph({
                                        text: "1. DADOS DO CLIENTE",
                                        heading: docx_1.HeadingLevel.HEADING_1,
                                    }),
                                    new docx_1.Paragraph({
                                        text: "Nome: ".concat(data.client.name, "\nTipo: ").concat(formData.clientType === 'company' ? 'Empresa' : 'Residencial', "\nEndere\u00E7o: ").concat(data.client.address, "\n").concat(formData.clientType === 'company' ? 'CNPJ' : 'CPF', ": ").concat(formData.document),
                                        spacing: { after: 100 },
                                    }),
                                    new docx_1.Paragraph({
                                        text: "2. DADOS DO PRODUTO",
                                        heading: docx_1.HeadingLevel.HEADING_1,
                                    }),
                                    new docx_1.Paragraph({
                                        text: "Modelo: ".concat(data.product.model, "\nData de Instala\u00E7\u00E3o: ").concat(data.product.installationDate, "\n\u00C1rea: ").concat(formData.area, " m\u00B2\nQuantidade: ").concat(formData.quantity, " unidades"),
                                        spacing: { after: 100 },
                                    }),
                                    new docx_1.Paragraph({
                                        text: "3. ANÁLISE",
                                        heading: docx_1.HeadingLevel.HEADING_1,
                                    }),
                                    new docx_1.Paragraph({
                                        text: "Não conformidades identificadas:",
                                        spacing: { after: 100 },
                                    }),
                                    new docx_1.Table({
                                        rows: __spreadArray([
                                            new docx_1.TableRow({
                                                children: [
                                                    new docx_1.TableCell({
                                                        children: [new docx_1.Paragraph("Não Conformidade")],
                                                        width: { size: 50, type: docx_1.WidthType.PERCENTAGE },
                                                    }),
                                                    new docx_1.TableCell({
                                                        children: [new docx_1.Paragraph("Observações")],
                                                        width: { size: 50, type: docx_1.WidthType.PERCENTAGE },
                                                    }),
                                                ],
                                            })
                                        ], data.analysis.nonConformities.map(function (nc) {
                                            return new docx_1.TableRow({
                                                children: [
                                                    new docx_1.TableCell({
                                                        children: [new docx_1.Paragraph(nc)],
                                                        width: { size: 50, type: docx_1.WidthType.PERCENTAGE },
                                                    }),
                                                    new docx_1.TableCell({
                                                        children: [new docx_1.Paragraph(data.analysis.notes)],
                                                        width: { size: 50, type: docx_1.WidthType.PERCENTAGE },
                                                    }),
                                                ],
                                            });
                                        }), true),
                                    }),
                                    new docx_1.Paragraph({
                                        text: "4. CONCLUSÃO",
                                        heading: docx_1.HeadingLevel.HEADING_1,
                                    }),
                                    new docx_1.Paragraph({
                                        text: data.conclusion.recommendations,
                                        spacing: { after: 100 },
                                    }),
                                    new docx_1.Paragraph({
                                        text: "Status: ".concat(data.conclusion.status),
                                        alignment: docx_1.AlignmentType.RIGHT,
                                    }),
                                ],
                            }],
                    });
                    if (formData.signature) {
                        doc.sections[0].children.push(new docx_1.Paragraph({
                            text: "Assinatura:",
                            alignment: docx_1.AlignmentType.CENTER,
                        }), new docx_1.Paragraph({
                            text: formData.inspectorName,
                            alignment: docx_1.AlignmentType.CENTER,
                        }), new docx_1.Paragraph({
                            text: new Date().toLocaleDateString('pt-BR'),
                            alignment: docx_1.AlignmentType.CENTER,
                        }));
                    }
                    return [4 /*yield*/, docx_1.Packer.toBuffer(doc)];
                case 1:
                    buffer = _b.sent();
                    return [2 /*return*/, buffer];
            }
        });
    });
}
;
