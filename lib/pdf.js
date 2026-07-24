import { BHS_LOGO_B64, BHS_LOGO_TYPE, BHS_LOGO_RATIO } from './logo-b64'

export async function generateAssessmentPDF(assessment) {
  // Import jsPDF
  const { jsPDF } = await import('jspdf')

  // Import autoTable — v5 exports a function you call directly, NOT a plugin
  const autoTableModule = await import('jspdf-autotable')
  const autoTable = autoTableModule.default || autoTableModule

  // Reference diagrams (hi-res PNG) — loaded lazily so they don't bloat the app bundle
  const diagrams = await import('./diagrams-b64').catch(() => ({}))

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentW = pageW - margin * 2
  let y = margin

  // ── Brand colours ────────────────────────────────────────────────────────
  const msNavy   = [43, 58, 143]
  const bwGreen  = [61, 181, 74]
  const charcoal = [74, 85, 104]
  const msCyan   = [0, 180, 216]
  const lightBlue= [232, 235, 249]
  const light    = [248, 250, 252]
  const border   = [226, 232, 240]
  const textCol  = [30, 41, 59]
  const muted    = [100, 116, 139]
  const white    = [255, 255, 255]

  // ── HEADER ───────────────────────────────────────────────────────────────
  doc.setFillColor(...white)
  doc.rect(0, 0, pageW, 36, 'F')

  // Logo — drawn at its true aspect ratio (no stretch) and vertically centred in the 36mm header band
  const logoW = 54
  const logoH = logoW / (BHS_LOGO_RATIO || 3.323)
  try {
    doc.addImage(BHS_LOGO_B64, BHS_LOGO_TYPE || 'JPEG', margin, 18 - logoH / 2, logoW, logoH)
  } catch (e) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(15)
    doc.setTextColor(...msNavy)
    doc.text('Bridgeway Healthcare', margin, 20)
  }

  doc.setDrawColor(...border)
  doc.setLineWidth(0.5)
  doc.line(76, 8, 76, 32)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...msNavy)
  doc.text('CLINICAL ASSESSMENT REPORT', pageW - margin, 14, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...muted)
  const ref = `Ref: ${assessment.id ? String(assessment.id).replace('bms_','BMS_').slice(0,12).toUpperCase() : 'DRAFT'}`
  doc.text(ref, pageW - margin, 21, { align: 'right' })
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}`, pageW - margin, 27, { align: 'right' })

  doc.setFillColor(...bwGreen)
  doc.rect(0, 36, pageW, 2.5, 'F')
  doc.setFillColor(...msNavy)
  doc.rect(0, 38.5, pageW, 0.8, 'F')

  y = 46

  // ── Helper: run autoTable and update y ────────────────────────────────────
  const runTable = (opts) => {
    autoTable(doc, opts)
    y = doc.lastAutoTable.finalY + 4
  }

  // ── Patient + Assessor cards ──────────────────────────────────────────────
  const halfW = (contentW - 4) / 2

  // Patient card background
  doc.setFillColor(...lightBlue)
  doc.setDrawColor(...border)
  doc.roundedRect(margin, y, halfW, 54, 2, 2, 'FD')
  doc.setFillColor(...msNavy)
  doc.roundedRect(margin, y, halfW, 7.5, 2, 2, 'F')
  doc.rect(margin, y + 3.5, halfW, 4, 'F')
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('PATIENT DETAILS', margin + 3, y + 5.5)

  autoTable(doc, {
    startY: y + 10,
    margin: { left: margin + 2, right: margin + halfW + 6 },
    body: [
      ['Name',    assessment.patient_name || '—'],
      ['Age',     assessment.patient_age ? `${assessment.patient_age} years` : '—'],
      ['Height',  assessment.patient_height || '—'],
      ['Phone',   assessment.patient_phone || '—'],
      ['Product', assessment.product || '—'],
    ],
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 }, textColor: textCol },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 18, textColor: muted },
      1: { cellWidth: halfW - 24 },
    },
    tableWidth: halfW - 4,
  })

  // Assessor card background
  const ax = margin + halfW + 4
  doc.setFillColor(232, 248, 234)
  doc.setDrawColor(...border)
  doc.roundedRect(ax, y, halfW, 54, 2, 2, 'FD')
  doc.setFillColor(...bwGreen)
  doc.roundedRect(ax, y, halfW, 7.5, 2, 2, 'F')
  doc.rect(ax, y + 3.5, halfW, 4, 'F')
  doc.setTextColor(...white)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.text('ASSESSOR & CLIENT DETAILS', ax + 3, y + 5.5)

  autoTable(doc, {
    startY: y + 10,
    margin: { left: ax + 2, right: margin + 2 },
    body: [
      ['Assessor', assessment.assessor_name || '—'],
      ['Email',    assessment.assessor_email || '—'],
      ['Date',     assessment.assessment_date || '—'],
      ['Client',   assessment.client || '—'],
      ['Status',   assessment.status === 'complete' ? 'Complete' : 'Draft'],
    ],
    theme: 'plain',
    styles: { fontSize: 8, cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 }, textColor: textCol },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 18, textColor: muted },
      1: { cellWidth: halfW - 24 },
    },
    tableWidth: halfW - 4,
  })

  y = doc.lastAutoTable.finalY + 10

  // ── Section heading helper ────────────────────────────────────────────────
  const sectionHead = (label, color) => {
    if (y > pageH - 60) { doc.addPage(); y = margin }
    doc.setFillColor(...color)
    doc.rect(margin, y, contentW, 8, 'F')
    doc.setFillColor(...(color === msNavy ? bwGreen : msNavy))
    doc.rect(margin, y, 3.5, 8, 'F')
    doc.setTextColor(...white)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text(label, margin + 7, y + 5.5)
    y += 11
  }

  // ── Measurement table helper — 3 cols, no Notes ───────────────────────────
  const measureTable = (rows) => {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['#', 'Measurement', 'Value']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: msCyan,
        textColor: white,
        fontSize: 8.5,
        fontStyle: 'bold',
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
        textColor: textCol,
      },
      alternateRowStyles: { fillColor: light },
      columnStyles: {
        0: { cellWidth: 12,              halign: 'center', fontStyle: 'bold', textColor: msNavy },
        1: { cellWidth: contentW * 0.62, fontStyle: 'bold' },
        2: { fontStyle: 'bold', textColor: msNavy, halign: 'right' },
      },
      tableWidth: contentW,
    })
    y = doc.lastAutoTable.finalY + 4
  }

  // ── Reference diagram helper — centred figure placed above its table ───────
  const placeDiagram = (png, ratio) => {
    if (!png) return
    const dH = 78
    const dW = dH * (ratio || 1)
    const dx = margin + (contentW - dW) / 2
    if (y + dH > pageH - 24) { doc.addPage(); y = margin }
    doc.setDrawColor(...border)
    doc.setFillColor(...white)
    doc.roundedRect(dx - 1.5, y - 1.5, dW + 3, dH + 3, 2, 2, 'FD')
    try { doc.addImage(png, 'PNG', dx, y, dW, dH) } catch (e) {}
    y += dH + 5
  }

  // ── Note box helper ────────────────────────────────────────────────────────
  const noteBox = (text, fillRgb) => {
    const lines = doc.splitTextToSize(text, contentW - 14)
    const h = lines.length * 5 + 10
    if (y + h > pageH - 20) { doc.addPage(); y = margin }
    doc.setFillColor(...fillRgb)
    doc.setDrawColor(...border)
    doc.roundedRect(margin, y, contentW, h, 2, 2, 'FD')
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(...muted)
    doc.text('CLINICAL NOTES', margin + 4, y + 5)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...textCol)
    doc.text(lines, margin + 4, y + 10)
    y += h + 6
  }

  // ── Wheelchair section ─────────────────────────────────────────────────────
  if (assessment.wheelchair_data && Object.keys(assessment.wheelchair_data).length > 0) {
    const w = assessment.wheelchair_data
    sectionHead('WHEELCHAIR, SEATING, TOILET, BATH, SCALLOP & BUGGY ASSESSMENT', msNavy)
    placeDiagram(diagrams.WHEELCHAIR_DIAGRAM_PNG, diagrams.WHEELCHAIR_DIAGRAM_RATIO)
    measureTable([
      ['1', 'Back Height',                  w.back_height         ? `${w.back_height} mm`         : '—'],
      ['2', 'Arm Height',                   w.arm_height          ? `${w.arm_height} mm`          : '—'],
      ['3', 'Lower Leg Length',             w.lower_leg_length    ? `${w.lower_leg_length} mm`    : '—'],
      ['4', 'Seat Depth',                   w.seat_depth          ? `${w.seat_depth} mm`          : '—'],
      ['5', 'Chest Width',                  w.chest_width         ? `${w.chest_width} mm`         : '—'],
      ['6', 'Seat Width',                   w.seat_width          ? `${w.seat_width} mm`          : '—'],
      ['7', 'Height — Seat to Top of Head', w.height_seat_to_head ? `${w.height_seat_to_head} mm` : '—'],
      ['8', 'Shoulder Width',               w.shoulder_width      ? `${w.shoulder_width} mm`      : '—'],
    ])
    if (w.notes) noteBox(w.notes, lightBlue)
  }

  // ── Standing section ───────────────────────────────────────────────────────
  if (assessment.standing_data && Object.keys(assessment.standing_data).length > 0) {
    const s = assessment.standing_data
    if (y > pageH - 60) { doc.addPage(); y = margin }
    sectionHead('STANDING, WALKING, WALKER & STANDING FRAME ASSESSMENT', charcoal)
    placeDiagram(diagrams.STANDING_DIAGRAM_PNG, diagrams.STANDING_DIAGRAM_RATIO)
    measureTable([
      ['1',  'Total Height',          s.total_height         ? `${s.total_height} mm`         : '—'],
      ['2',  'Shoulder Height',       s.shoulder_height      ? `${s.shoulder_height} mm`      : '—'],
      ['3',  'Chest / Armpit Height', s.chest_armpit_height  ? `${s.chest_armpit_height} mm`  : '—'],
      ['4',  'Buttock Height',        s.buttock_height       ? `${s.buttock_height} mm`       : '—'],
      ['5',  'Chest Width',           s.chest_width          ? `${s.chest_width} mm`          : '—'],
      ['6',  'Shoulder Width',        s.shoulder_width       ? `${s.shoulder_width} mm`       : '—'],
      ['7',  'Top of Pelvic Height',  s.top_pelvic_height    ? `${s.top_pelvic_height} mm`    : '—'],
      ['8',  'Hip / Pelvis Width',    s.hip_pelvis_width     ? `${s.hip_pelvis_width} mm`     : '—'],
      ['9',  'Below Knee',            s.below_knee           ? `${s.below_knee} mm`           : '—'],
      ['10', 'Chest Circumference',   s.chest_circumference  ? `${s.chest_circumference} mm`  : '—'],
      ['11', 'Pelvic Circumference',  s.pelvic_circumference ? `${s.pelvic_circumference} mm` : '—'],
      ['12', 'Knee Circumference',    s.knee_circumference   ? `${s.knee_circumference} mm`   : '—'],
      ['13', 'Knee Width',            s.knee_width           ? `${s.knee_width} mm`           : '—'],
      ['14', 'Foot Length',           s.foot_length          ? `${s.foot_length} mm`          : '—'],
      ['15', 'Foot Width',            s.foot_width           ? `${s.foot_width} mm`           : '—'],
    ])
    if (s.notes) noteBox(s.notes, [232, 248, 234])
  }

  // ── Footer on every page ───────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    const fy = pageH - 16
    doc.setFillColor(...bwGreen)
    doc.rect(0, fy, pageW, 1.5, 'F')
    doc.setFillColor(...light)
    doc.rect(0, fy + 1.5, pageW, 14.5, 'F')
    doc.setDrawColor(...border)
    doc.line(0, fy + 1.5, pageW, fy + 1.5)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(...charcoal)
    doc.text('Bridgeway Medical Systems', margin, fy + 6)
    doc.setFont('helvetica', 'normal'); doc.setTextColor(...muted)
    doc.text('Al Ttay, Al Khawaneej 2, Dubai  ·  Tel: +971 4 876 9106  ·  WhatsApp: +971 557 169 120', margin, fy + 11)
    doc.setFontSize(6.5); doc.setTextColor(...muted)
    doc.text('Confidential Clinical Document', pageW - margin, fy + 6, { align: 'right' })
    doc.setFont('helvetica', 'bold'); doc.setTextColor(...msNavy)
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, fy + 11, { align: 'right' })
  }

  return doc
}

export async function downloadPDF(assessment) {
  const doc = await generateAssessmentPDF(assessment)
  const name = `BHS_Assessment_${(assessment.patient_name||'Patient').replace(/\s+/g,'_')}_${(assessment.assessment_date||new Date().toISOString().split('T')[0])}.pdf`
  doc.save(name)
}

export async function getPDFBase64(assessment) {
  const doc = await generateAssessmentPDF(assessment)
  return doc.output('datauristring').split(',')[1]
}
