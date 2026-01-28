import { PDFDocument } from "pdf-lib";

export async function extractPdfFieldsFromUrl(pdfUrl) {
  const res = await fetch(pdfUrl);
  const pdfBytes = await res.arrayBuffer();

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();

  const fields = form.getFields();

  return fields.map((field) => {
    const type = field.constructor.name;

    if (type === "PDFTextField") return { name: field.getName(), type: "text" };
    if (type === "PDFCheckBox") return { name: field.getName(), type: "checkbox" };
    if (type === "PDFRadioGroup") return { name: field.getName(), type: "radio" };

    return { name: field.getName(), type: "unknown" };
  });
}
