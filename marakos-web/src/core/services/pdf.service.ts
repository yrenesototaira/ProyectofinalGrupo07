import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AdditionalServiceItem {
  serviceName: string;
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
  reservationTime?: string;
  peopleCount: number;
  tableId?: number;
  reservationType?: string;
  observation?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  totalAmount?: number;
  qrCodeUrl?: string;
  orderItems?: OrderItem[];
  // Campos específicos de eventos
  eventType?: string;
  eventShift?: string;
  tableDistribution?: string;
  linenColor?: string;
  additionalServices?: AdditionalServiceItem[];
  isEventAdelanto?: boolean;
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
    const reservationTitle = data.reservationType === 'EVENTO' ? 'Confirmacion de Reserva de Evento' : 'Confirmacion de Reserva de Mesa';
    pdf.text(reservationTitle, pageWidth / 2, 26, { align: 'center' });

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
    
    // Mostrar hora solo si existe (no es evento)
    if (data.reservationTime) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('Hora:', margin, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.reservationTime, margin + 25, yPosition);
      yPosition += 6;
    }
    
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

    // Información específica de eventos
    if (data.reservationType === 'EVENTO') {
      if (data.eventType) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tipo de Evento:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.eventType, margin + 35, yPosition);
        yPosition += 6;
      }

      if (data.eventShift) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Turno:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.eventShift, margin + 35, yPosition);
        yPosition += 6;
      }

      if (data.tableDistribution) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Distribucion de Mesa:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.tableDistribution, margin + 45, yPosition);
        yPosition += 6;
      }

      if (data.linenColor) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Color de Manteleria:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.linenColor, margin + 45, yPosition);
        yPosition += 6;
      }
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

    // Desglose de Costos Completo para Eventos
    if (data.reservationType === 'EVENTO') {
      // Verificar si hay espacio suficiente
      const footerStartY = pageHeight - 25;
      if (yPosition + 80 > footerStartY) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setTextColor(51, 65, 85);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESGLOSE DE COSTOS', margin, yPosition);
      yPosition += 2;
      
      // Línea decorativa
      pdf.setDrawColor(245, 158, 11);
      pdf.line(margin, yPosition, margin + 55, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'normal');

      // Tipo de Evento
      if (data.eventType) {
        pdf.setTextColor(120, 120, 120);
        pdf.text(data.eventType, margin, yPosition);
        pdf.text('Incluido', pageWidth - margin, yPosition, { align: 'right' });
        pdf.setTextColor(71, 85, 105);
        yPosition += 6;
      }

      // Turno
      if (data.eventShift) {
        const shiftMatch = data.eventShift.match(/S\/\s*(\d+)/);
        const shiftPrice = shiftMatch ? parseFloat(shiftMatch[1]) : 0;
        const shiftName = data.eventShift.replace(/\s*\(.*?\)/, '').replace(/S\/.*/, '').trim();
        
        pdf.text(`Turno ${shiftName}`, margin, yPosition);
        pdf.text(`S/ ${shiftPrice.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 6;
      }

      // Distribución de Mesa
      if (data.tableDistribution) {
        const distMatch = data.tableDistribution.match(/S\/\s*(\d+)/);
        const distPrice = distMatch ? parseFloat(distMatch[1]) : 0;
        const distName = data.tableDistribution.replace(/\s*\(.*?\)/, '').replace(/S\/.*/, '').trim();
        
        pdf.text(`Distribución ${distName}`, margin, yPosition);
        if (distPrice === 0) {
          pdf.setTextColor(120, 120, 120);
          pdf.setFontSize(9);
          pdf.text('Sin costo adicional', pageWidth - margin, yPosition, { align: 'right' });
          pdf.setFontSize(10);
          pdf.setTextColor(71, 85, 105);
        } else {
          pdf.text(`S/ ${distPrice.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
        }
        yPosition += 6;
      }

      // Mantelería
      if (data.linenColor) {
        const linenMatch = data.linenColor.match(/S\/\s*(\d+)/);
        const linenPrice = linenMatch ? parseFloat(linenMatch[1]) : 0;
        const linenName = data.linenColor.replace(/\s*\(.*?\)/, '').replace(/S\/.*/, '').trim();
        
        pdf.text(`Mantelería ${linenName}`, margin, yPosition);
        if (linenPrice === 0) {
          pdf.setTextColor(34, 197, 94); // Green-500
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text('FREE', pageWidth - margin, yPosition, { align: 'right' });
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.setTextColor(71, 85, 105);
        } else {
          pdf.text(`S/ ${linenPrice.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
        }
        yPosition += 6;
      }

      // Menú
      if (data.orderItems && data.orderItems.length > 0) {
        yPosition += 3;
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(245, 158, 11);
        pdf.text('Menú:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        yPosition += 6;

        for (const item of data.orderItems) {
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.setFontSize(9);
          pdf.text(`${item.productName} x${item.quantity}`, margin + 5, yPosition);
          pdf.text(`S/ ${item.subtotal.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
          yPosition += 5;
        }
        pdf.setFontSize(10);
        yPosition += 1;
      }

      // Servicios Adicionales
      if (data.additionalServices && data.additionalServices.length > 0) {
        yPosition += 3;
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;
        
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(245, 158, 11);
        pdf.text('Servicios Adicionales:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        yPosition += 6;

        for (const service of data.additionalServices) {
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.setFontSize(9);
          pdf.text(`${service.serviceName}`, margin + 5, yPosition);
          pdf.text(`S/ ${service.subtotal.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
          yPosition += 5;
        }
        pdf.setFontSize(10);
        yPosition += 1;
      }

      // Calcular totales
      let subtotal = 0;
      
      // Sumar turno
      if (data.eventShift) {
        const shiftMatch = data.eventShift.match(/S\/\s*(\d+)/);
        if (shiftMatch) subtotal += parseFloat(shiftMatch[1]);
      }
      
      // Sumar distribución
      if (data.tableDistribution) {
        const distMatch = data.tableDistribution.match(/S\/\s*(\d+)/);
        if (distMatch) subtotal += parseFloat(distMatch[1]);
      }
      
      // Sumar mantelería
      if (data.linenColor) {
        const linenMatch = data.linenColor.match(/S\/\s*(\d+)/);
        if (linenMatch) subtotal += parseFloat(linenMatch[1]);
      }
      
      // Sumar menú
      if (data.orderItems) {
        subtotal += data.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      }
      
      // Sumar servicios adicionales
      if (data.additionalServices) {
        subtotal += data.additionalServices.reduce((sum, service) => sum + service.subtotal, 0);
      }

      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      // Línea divisoria
      yPosition += 3;
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // Subtotal
      pdf.setFont('helvetica', 'normal');
      pdf.text('Subtotal:', margin, yPosition);
      pdf.text(`S/ ${subtotal.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 6;

      // IGV
      pdf.text('IGV (18%):', margin, yPosition);
      pdf.text(`S/ ${igv.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 6;

      // Línea divisoria
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 6;

      // Total
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(245, 158, 11);
      pdf.text('Total:', margin, yPosition);
      pdf.text(`S/ ${total.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
      
      yPosition += 10;
      
    } else {
      // Para reservas de MESA - mostrar solo pre-orden si existe
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

        // Calcular totales con IGV
        const subtotal = data.orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const igv = subtotal * 0.18;
        const total = subtotal + igv;

        yPosition += 6;

        // Subtotal
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(71, 85, 105);
        pdf.text('Subtotal:', margin, yPosition);
        pdf.text(`S/ ${subtotal.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 6;

        // IGV
        pdf.text('IGV (18%):', margin, yPosition);
        pdf.text(`S/ ${igv.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 6;

        // Línea divisoria
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 6;

        // Total
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(245, 158, 11);
        pdf.text('Total:', margin, yPosition);
        pdf.text(`S/ ${total.toFixed(2)}`, pageWidth - margin, yPosition, { align: 'right' });

        yPosition += 8;
      }
    }

    // Información de pago
    const isPresentialPayment = data.paymentMethod === 'Presencial' || data.paymentStatus === 'PENDIENTE';
    
    if (data.totalAmount && data.totalAmount > 0) {
      // Verificar si hay espacio suficiente para la sección de pago (mínimo 60mm)
      const footerStartY = pageHeight - 25;
      const requiredSpace = isPresentialPayment ? 50 : 60; // Más espacio si hay disclaimer
      
      if (yPosition + requiredSpace > footerStartY) {
        // Agregar nueva página
        pdf.addPage();
        yPosition = 20;
      }
      
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
        
        // Para eventos, mostrar importe total y adelanto del 50%
        if (data.isEventAdelanto) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Importe Total:', margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          const montoTotal = data.totalAmount * 2; // El adelanto es 50%, el total es el doble
          pdf.text(`S/ ${montoTotal.toFixed(2)}`, margin + 30, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'bold');
          pdf.text('Adelanto a Pagar (50%):', margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`S/ ${data.totalAmount.toFixed(2)}`, margin + 50, yPosition);
          yPosition += 6;
        } else {
          // Para mesas, mostrar el monto completo
          pdf.setFont('helvetica', 'bold');
          pdf.text('Monto a Pagar:', margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`S/ ${data.totalAmount.toFixed(2)}`, margin + 30, yPosition);
          yPosition += 6;
        }
        
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
        
        // Disclaimer adicional para eventos sobre el saldo restante
        if (data.isEventAdelanto) {
          pdf.setFillColor(219, 234, 254); // Blue-100
          pdf.roundedRect(margin, yPosition, pageWidth - (margin * 2), 18, 3, 3, 'F');
          pdf.setTextColor(30, 64, 175); // Blue-800
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          const saldoText = 'El saldo restante (50%) se paga el dia del evento';
          pdf.text(saldoText, pageWidth / 2, yPosition + 9, { align: 'center', maxWidth: pageWidth - margin * 2 - 10 });
          yPosition += 23;
        }
      } else {
        // Mostrar estado del pago
        const isPagadoParcial = data.paymentStatus === 'PAGADO_PARCIAL';
        pdf.setFont('helvetica', 'bold');
        pdf.text('Estado:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        
        if (isPagadoParcial) {
          pdf.setTextColor(59, 130, 246); // Blue-500
          pdf.text('PAGO PARCIAL (Adelanto 50%)', margin + 25, yPosition);
          pdf.setTextColor(71, 85, 105);
        } else {
          pdf.text(data.paymentStatus || 'PAGADO', margin + 25, yPosition);
        }
        yPosition += 6;
        
        // Mostrar monto total para pagos parciales
        if (isPagadoParcial) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Monto Total:', margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          const montoTotal = data.totalAmount * 2; // El adelanto es 50%, el total es el doble
          pdf.text(`S/ ${montoTotal.toFixed(2)}`, margin + 35, yPosition);
          yPosition += 6;
        }
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(isPagadoParcial ? 'Adelanto Pagado:' : 'Monto:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`S/ ${data.totalAmount.toFixed(2)}`, margin + 35, yPosition);
        yPosition += 6;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('Metodo:', margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.paymentMethod || 'Digital', margin + 25, yPosition);
        yPosition += 10;

        // Disclaimer para eventos con adelanto
        if (isPagadoParcial && data.isEventAdelanto) {
          // Verificar si hay espacio para el disclaimer (25mm)
          const footerStartY = pageHeight - 25;
          if (yPosition + 25 > footerStartY) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFillColor(219, 234, 254); // Blue-100
          pdf.roundedRect(margin, yPosition, pageWidth - (margin * 2), 22, 3, 3, 'F');
          pdf.setTextColor(30, 64, 175); // Blue-800
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          
          const saldoPendiente = data.totalAmount; // El adelanto es el 50%, el saldo es igual
          const disclaimerLine1 = `RECORDATORIO: El saldo restante de S/ ${saldoPendiente.toFixed(2)} debe pagarse`;
          const disclaimerLine2 = 'el mismo dia del evento antes de su inicio.';
          
          pdf.text(disclaimerLine1, pageWidth / 2, yPosition + 8, { align: 'center' });
          pdf.text(disclaimerLine2, pageWidth / 2, yPosition + 15, { align: 'center' });
          
          yPosition += 27;
        }
      }
    }

    // Footer - agregarlo en todas las páginas
    const totalPages = (pdf as any).internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      const footerY = pageHeight - 25;
      
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY, pageWidth - margin, footerY);

      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      pdf.setFont('helvetica', 'bold');
      pdf.text('UBICACION', margin, footerY + 5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text('Miguel Grau 795, Chiclayo - Pimentel', margin, footerY + 9);
      pdf.text('Telefono: 961 845 986', margin, footerY + 13);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.text('HORARIOS DE ATENCION', pageWidth / 2 + 10, footerY + 5, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text('Lunes a Domingo: 08:00 AM - 11:00 PM', pageWidth / 2 + 10, footerY + 9, { align: 'center' });
    }

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
