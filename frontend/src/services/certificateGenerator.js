import { jsPDF } from "jspdf";

/**
 * Servicio Maestro de Generación de Certificados - Plataforma MEH
 * 
 * @param {Object} data - Datos del certificado
 * @param {string} data.fullName - Nombre completo del estudiante
 * @param {string} data.eventName - Nombre del curso o evento
 * @param {string} data.date - Fecha de emisión
 * @param {string} data.code - Código de verificación único
 * @param {string} data.templateUrl - URL de la imagen de fondo (opcional)
 */
export const generateCertificatePDF = async (data) => {
  const { fullName, eventName, date, code, templateUrl } = data;

  // 1. Crear instancia de jsPDF (Paisaje/A4)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4"
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // 2. Cargar imagen de fondo (Template)
  // Si no hay template, usamos un diseño base por código
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
  doc.setTextColor(20, 20, 20); // Gris muy oscuro
  
  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.text("CERTIFICADO DE LOGRO", width / 2, 100, { align: "center" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Se otorga el presente reconocimiento a:", width / 2, 140, { align: "center" });

  // Nombre del Estudiante
  doc.setTextColor(127, 19, 236); // Morado MEH
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.text(fullName.toUpperCase(), width / 2, 180, { align: "center" });

  // Cuerpo
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(`Por haber completado satisfactoriamente el programa:`, width / 2, 220, { align: "center" });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(eventName, width / 2, 250, { align: "center" });

  // Fecha y Firmas
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Emitido el: ${new Date(date).toLocaleDateString()}`, width / 2, 280, { align: "center" });

  // 4. Código de Validación y URL
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const validationUrl = `${window.location.origin}/verificar-certificado/${code}`;
  doc.text(`Código de Verificación: ${code}`, 40, height - 40);
  doc.text(`Validar en: ${validationUrl}`, 40, height - 25);

  // 5. Marca de Agua / Logo MEH (Simulado)
  doc.setDrawColor(127, 19, 236);
  doc.setLineWidth(2);
  doc.line(width / 2 - 100, 310, width / 2 + 100, 310);

  // Guardar Archivo
  const fileName = `Certificado_MEH_${fullName.replace(/\s+/g, '_')}.pdf`;
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
    // Fondo claro
    doc.setFillColor(245, 245, 250);
    doc.rect(0, 0, width, height, 'F');
    
    // Marco elegante
    doc.setDrawColor(127, 19, 236);
    doc.setLineWidth(10);
    doc.rect(20, 20, width - 40, height - 40);
    
    doc.setDrawColor(0, 120, 212); // Azul Microsoft
    doc.setLineWidth(2);
    doc.rect(25, 25, width - 50, height - 50);
};
