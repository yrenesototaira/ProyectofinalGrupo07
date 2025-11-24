import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ReservationPdfData {
  id: number;
  code: string;
  holderName: string;
  holderEmail?: string;
  holderPhone?: string;
  reservationDate: string;
  reservationTime: string;
  peopleCount: number;
  tableId?: number;
  observation?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  totalAmount?: number;
  qrCodeUrl?: string;
  orderItems?: OrderItem[];
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  /**
   * Genera un PDF de la reserva con formato profesional
   */
  async generateReservationPDF(data: ReservationPdfData): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Header con logo y título
    pdf.setFillColor(245, 158, 11); // Orange
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(26);
    pdf.setFont('helvetica', 'bold');
    pdf.text('MARAKOS GRILL', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Confirmacion de Reserva', pageWidth / 2, 26, { align: 'center' });

    yPosition = 45;

    // QR Code en la parte superior derecha
    if (data.qrCodeUrl) {
      try {
        const qrSize = 50;
        const qrX = pageWidth - margin - qrSize;
        const qrY = yPosition;

        // Fondo blanco para el QR
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 20, 2, 2, 'F');

        // Borde naranja
        pdf.setDrawColor(245, 158, 11);
        pdf.setLineWidth(1);
        pdf.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 20, 2, 2);

        pdf.addImage(data.qrCodeUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text('Escanea al llegar', qrX + (qrSize / 2), qrY + qrSize + 6, { align: 'center' });

      } catch (error) {
        console.error('Error adding QR code to PDF:', error);
      }
    }

    // Código de reserva destacado (sin superponer al QR)
    const codeBoxWidth = pageWidth - margin - 75; // Dejar espacio para el QR
    pdf.setFillColor(51, 65, 85); // Slate-700
    pdf.roundedRect(margin, yPosition, codeBoxWidth, 14, 3, 3, 'F');
    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Codigo de Reserva: ${data.code}`, margin + 5, yPosition + 9);

    yPosition += 24;

    // Información del cliente
    pdf.setTextColor(51, 65, 85);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATOS DEL CLIENTE', margin, yPosition);
    yPosition += 2;
    
    // Línea decorativa
    pdf.setDrawColor(245, 158, 11);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, margin + 50, yPosition);
    yPosition += 6;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nombre:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.holderName, margin + 25, yPosition);
    yPosition += 6;

    if (data.holderEmail) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Email:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.holderEmail, margin + 25, yPosition);
      yPosition += 6;
    }

    if (data.holderPhone) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Telefono:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.holderPhone, margin + 25, yPosition);
      yPosition += 6;
    }

    yPosition += 5;

    // Detalles de la reserva
    pdf.setTextColor(51, 65, 85);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DETALLES DE LA RESERVA', margin, yPosition);
    yPosition += 2;
    
    // Línea decorativa
    pdf.setDrawColor(245, 158, 11);
    pdf.line(margin, yPosition, margin + 65, yPosition);
    yPosition += 6;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fecha:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.reservationDate, margin + 25, yPosition);
    yPosition += 6;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Hora:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.reservationTime, margin + 25, yPosition);
    yPosition += 6;
    
    pdf.setFont('helvetica', 'bold');
    pdf.text('Comensales:', margin, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${data.peopleCount} personas`, margin + 25, yPosition);
    yPosition += 6;

    if (data.tableId) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Mesa:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`#${data.tableId}`, margin + 25, yPosition);
      yPosition += 6;
    }

    if (data.observation) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Observaciones:', margin, yPosition);
      yPosition += 5;
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(data.observation, pageWidth - margin - 30);
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * 5;
    }

    yPosition += 5;

    // Detalle de productos si hay pre-orden
    if (data.orderItems && data.orderItems.length > 0) {
      pdf.setTextColor(51, 65, 85);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DETALLE DE PRE-ORDEN', margin, yPosition);
      yPosition += 2;
      
      // Línea decorativa
      pdf.setDrawColor(245, 158, 11);
      pdf.line(margin, yPosition, margin + 55, yPosition);
      yPosition += 6;

      // Tabla de productos con columnas definidas
      pdf.setFontSize(9);
      pdf.setTextColor(71, 85, 105);
      
      // Definir posiciones de columnas
      const col1X = margin;
      const col2X = margin + 80;
      const col3X = margin + 115;
      const col4X = pageWidth - margin;
      
      // Headers
      pdf.setFont('helvetica', 'bold');
      pdf.text('Producto', col1X, yPosition);
      pdf.text('Cant.', col2X, yPosition, { align: 'center' });
      pdf.text('P. Unit.', col3X, yPosition, { align: 'right' });
      pdf.text('Subtotal', col4X, yPosition, { align: 'right' });
      yPosition += 1;
      
      // Línea debajo de headers
      pdf.setDrawColor(224, 224, 224);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 4;

      // Items
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(85, 85, 85);
      
      for (const item of data.orderItems) {
        // Verificar espacio disponible
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        // Nombre del producto (truncado si es muy largo)
        const productName = item.productName.length > 40 ? 
                           item.productName.substring(0, 37) + '...' : 
                           item.productName;
        pdf.text(productName, col1X, yPosition);
        pdf.text(item.quantity.toString(), col2X, yPosition, { align: 'center' });
        pdf.text(`S/ ${item.unitPrice.toFixed(2)}`, col3X, yPosition, { align: 'right' });
        pdf.text(`S/ ${item.subtotal.toFixed(2)}`, col4X, yPosition, { align: 'right' });
        yPosition += 5;
      }

      // Línea antes del total
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(224, 224, 224);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 2;

      yPosition += 8;
    }

    // Información de pago
    const isPresentialPayment = data.paymentMethod === 'Presencial' || data.paymentStatus === 'PENDIENTE';
    
    if (data.totalAmount && data.totalAmount > 0) {
      pdf.setTextColor(51, 65, 85);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('INFORMACION DE PAGO', margin, yPosition);
      yPosition += 2;
      
      // Línea decorativa
      pdf.setDrawColor(245, 158, 11);
      pdf.line(margin, yPosition, margin + 55, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      
      if (isPresentialPayment) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Estado:', margin, yPosition);
        pdf.setTextColor(234, 88, 12); // Orange-600
        pdf.text('Pendiente de Pago Presencial', margin + 25, yPosition);
        yPosition += 6;
        
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Monto a Pagar:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`S/ ${data.totalAmount.toFixed(2)}`, margin + 30, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Metodo:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.paymentMethod || 'Presencial', margin + 25, yPosition);
        yPosition += 10;

        // Advertencia de 24 horas
        pdf.setFillColor(254, 226, 226); // Red-100
        pdf.roundedRect(margin, yPosition, pageWidth - (margin * 2), 18, 3, 3, 'F');
        pdf.setTextColor(153, 27, 27); // Red-900
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const warningText = 'IMPORTANTE: Si no pagas en 24 horas, tu reserva se cancelara automaticamente';
        pdf.text(warningText, pageWidth / 2, yPosition + 9, { align: 'center', maxWidth: pageWidth - margin * 2 - 10 });
        
        yPosition += 23;
      } else {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Estado:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.paymentStatus || 'Completado', margin + 25, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Monto:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`S/ ${data.totalAmount.toFixed(2)}`, margin + 25, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Metodo:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.paymentMethod || 'Digital', margin + 25, yPosition);
        yPosition += 10;
      }
    }

    // Footer
    const footerY = pageHeight - 35;
    pdf.setDrawColor(203, 213, 225);
    pdf.setLineWidth(0.5);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('UBICACION', margin, footerY + 8);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Miguel Grau 795, Chiclayo - Pimentel', margin, footerY + 13);
    pdf.text('Telefono: 961 845 986', margin, footerY + 18);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('HORARIOS DE ATENCION', pageWidth / 2 + 10, footerY + 8, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text('Lunes a Domingo: 12:00 PM - 11:00 PM', pageWidth / 2 + 10, footerY + 13, { align: 'center' });

    // Descargar PDF
    const fileName = `reserva-${data.code}-${data.holderName.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
  }

  /**
   * Genera PDF desde un elemento HTML (alternativa)
   */
  async generatePDFFromElement(element: HTMLElement, fileName: string): Promise<void> {
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  }
}
