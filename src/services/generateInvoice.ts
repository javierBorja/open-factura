import { create } from "xmlbuilder2";
import { Invoice, InvoiceInput } from "../baseData/invoice/invoice";
import { generateAccessKey } from "../utils/utils";

export function generateInvoiceXml(invoice: Invoice) {
  const document = create(invoice);
  const xml = document.end({ prettyPrint: true });
  return xml;
}

function parseEmisionDate(fechaEmision: string): Date {
  const parts = fechaEmision.split(/[/-]/);
  if (parts.length === 3 && parts[0].length <= 2) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(fechaEmision);
}

export function generateInvoice(invoiceData: InvoiceInput) {
  const accessKey = generateAccessKey({
    date: parseEmisionDate(invoiceData.infoFactura.fechaEmision),
    codDoc: invoiceData.infoTributaria.codDoc,
    ruc: invoiceData.infoTributaria.ruc,
    environment: invoiceData.infoTributaria.ambiente,
    establishment: invoiceData.infoTributaria.estab,
    emissionPoint: invoiceData.infoTributaria.ptoEmi,
    sequential: invoiceData.infoTributaria.secuencial,
  });

  const t = invoiceData.infoTributaria;
  const invoice: Invoice = {
    factura: {
      "@xmlns:ds": "http://www.w3.org/2000/09/xmldsig#",
      "@xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "@id": "comprobante",
      "@version": "1.0.0",
      infoTributaria: {
        ambiente: t.ambiente,
        tipoEmision: t.tipoEmision,
        razonSocial: t.razonSocial,
        nombreComercial: t.nombreComercial,
        ruc: t.ruc,
        claveAcceso: accessKey,
        codDoc: t.codDoc,
        estab: t.estab,
        ptoEmi: t.ptoEmi,
        secuencial: t.secuencial,
        dirMatriz: t.dirMatriz,
        ...(t.regimenMicroempresas
          ? { regimenMicroempresas: t.regimenMicroempresas }
          : {}),
        ...(t.agenteRetencion ? { agenteRetencion: t.agenteRetencion } : {}),
        ...(t.contribuyenteRimpe
          ? { contribuyenteRimpe: t.contribuyenteRimpe }
          : {}),
      },
      infoFactura: invoiceData.infoFactura,
      detalles: invoiceData.detalles,
    },
  };

  return { invoice, accessKey };
}
