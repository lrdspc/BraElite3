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
Object.defineProperty(exports, "__esModule", { value: true });
var documentGenerator_1 = require("./src/lib/documentGenerator");
var exampleData = {
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
function testGenerateDocument() {
    return __awaiter(this, void 0, void 0, function () {
        var buffer, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, documentGenerator_1.generateDocument)(exampleData)];
                case 1:
                    buffer = _a.sent();
                    console.log('Documento gerado com sucesso!');
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Erro ao gerar documento:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
testGenerateDocument();
