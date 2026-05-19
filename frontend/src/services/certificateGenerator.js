import { jsPDF } from "jspdf";

/**
 * Servicio Maestro de Generación de Certificados - Plataforma MEH
 * 
 * @param {Object} data - Datos del certificado
 * @param {string} data.fullName - Nombre completo del estudiante/speaker
 * @param {string} data.eventName - Nombre del curso o evento (título del cert)
 * @param {string} data.date - Fecha de emisión
 * @param {string} data.code - Código de verificación único
 * @param {string} data.templateUrl - URL de la imagen de fondo (opcional)
 * @param {Array<string>} data.signatureUrls - Array de URLs de las firmas
 */
export const generateCertificatePDF = async (data) => {
  const { fullName, eventName, date, code, templateUrl, signatureUrls = [] } = data;

  // 1. Crear instancia de jsPDF (Paisaje/A4)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4"
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // 2. Cargar imagen de fondo (Template)
  if (templateUrl) {
    try {
        const img = await loadImage(templateUrl);
        doc.addImage(img, 'JPEG', 0, 0, width, height);
    } catch (e) {
        console.warn("No se pudo cargar el template, usando diseño base.");
        drawBaseTemplate(doc, width, height);
    }
  } else {
    drawBaseTemplate(doc, width, height);
  }

  // 3. Imprimir Texto Personalizado
  doc.setTextColor(20, 20, 20);
  
  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.text("CERTIFICADO DE LOGRO", width / 2, 100, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Se otorga el presente reconocimiento a:", width / 2, 140, { align: "center" });

  // Nombre del Estudiante/Speaker
  doc.setTextColor(127, 19, 236); // Morado MEH
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.text(fullName.toUpperCase(), width / 2, 180, { align: "center" });

  // Cuerpo
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(`Por su destacada participación en el programa:`, width / 2, 220, { align: "center" });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(eventName, width / 2, 250, { align: "center" });

  // Fecha
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Emitido el: ${new Date(date).toLocaleDateString()}`, width / 2, 280, { align: "center" });

  // 4. Firmas
  if (signatureUrls && signatureUrls.length > 0) {
    const numSignatures = signatureUrls.length;
    // Ancho total reservado para firmas
    const padding = 100;
    const availableWidth = width - (padding * 2);
    const spacing = availableWidth / numSignatures;

    for (let i = 0; i < numSignatures; i++) {
        try {
            const sigImg = await loadImage(signatureUrls[i]);
            // Calculamos posición X para centrar cada firma en su cuadrante
            const xPos = padding + (spacing * i) + (spacing / 2) - 30; // 30 es la mitad del ancho de la firma
            doc.addImage(sigImg, 'PNG', xPos, 320, 60, 40);

            // Línea para la firma
            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(1);
            doc.line(xPos - 10, 365, xPos + 70, 365);
        } catch (e) {
            console.warn(`No se pudo cargar la firma ${i+1}`);
        }
    }
  }

  // 5. Código de Validación, URL y QR
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const validationUrl = `${window.location.origin}/verificar/${code}`;
  
  doc.text(`Código de Verificación: ${code}`, 40, height - 50);
  doc.text(`Validar en: ${validationUrl}`, 40, height - 35);
  doc.text("Este documento cuenta con validez digital verificable en nuestro portal oficial.", 40, height - 20);

  // Guardar Archivo
  const fileName = `Certificado_${fullName.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
  
  return true;
};

// Utilidad para cargar imágenes asíncronamente
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

// Diseño base si falla el template
const drawBaseTemplate = (doc, width, height) => {
    doc.setFillColor(245, 245, 250);
    doc.rect(0, 0, width, height, 'F');
    doc.setDrawColor(127, 19, 236);
    doc.setLineWidth(10);
    doc.rect(20, 20, width - 40, height - 40);
    doc.setDrawColor(0, 120, 212);
    doc.setLineWidth(2);
    doc.rect(25, 25, width - 50, height - 50);
};
