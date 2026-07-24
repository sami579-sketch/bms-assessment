import { useState } from 'react'
import toast from 'react-hot-toast'
import { downloadPDF, getPDFBase64 } from '../lib/pdf'
import { StatusBadge } from './FormElements'

export default function ReviewPanel({ assessment, onEditProfile, onEditWheelchair, onEditStanding, onNewAssessment }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const hasWheelchair = assessment.wheelchair_data && Object.keys(assessment.wheelchair_data).length > 0
  const hasStanding = assessment.standing_data && Object.keys(assessment.standing_data).length > 0

  // Single click: export PDF to device + email assessor automatically
  const handleExportAndSend = async () => {
    if (loading || done) return
    setLoading(true)
    const toastId = toast.loading('Generating PDF...')

    try {
      // Step 1: Download PDF to device
      await downloadPDF(assessment)
      toast.loading('Sending to ' + assessment.assessor_email + '...', { id: toastId })

      // Step 2: Get base64 for email
      const pdfBase64 = await getPDFBase64(assessment)

      // Step 3: Send email to assessor automatically
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment,
          recipientEmail: assessment.assessor_email,
          pdfBase64,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Email failed')

      toast.success(`PDF saved & sent to ${assessment.assessor_email}`, { id: toastId, duration: 6000 })
      setDone(true)
    } catch (err) {
      // PDF downloaded but email failed — still show partial success
      if (err.message?.includes('email') || err.message?.includes('SMTP') || err.message?.includes('send')) {
        toast.error(`PDF saved. Email failed: ${err.message}`, { id: toastId, duration: 8000 })
      } else {
        toast.error(err.message || 'Something went wrong', { id: toastId })
      }
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">

      {/* Summary header */}
      <div className="card overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-ms-navy via-ms-cyan to-bw-green" />
        <div className="p-5">

          {/* Patient info */}
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-lg font-bold text-clinical-900">{assessment.patient_name}</h2>
                <StatusBadge status={assessment.status} />
              </div>
              <p className="text-sm text-clinical-500">
                Assessed by <strong>{assessment.assessor_name}</strong> · {assessment.assessment_date}
              </p>
              {assessment.client && <p className="text-xs text-ms-navy font-semibold mt-0.5">{assessment.client}</p>}
              {assessment.product && <p className="text-xs text-bw-green font-semibold">{assessment.product}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              {hasWheelchair && <Tag color="navy" label="Wheelchair & Seating" />}
              {hasStanding && <Tag color="green" label="Standing & Walking" />}
            </div>
          </div>

          {/* Detail grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {[
              ['Age', assessment.patient_age ? `${assessment.patient_age} yrs` : '—'],
              ['Height', assessment.patient_height || '—'],
              ['Phone', assessment.patient_phone || '—'],
              ['Send to', assessment.assessor_email || '—'],
            ].map(([k, v]) => (
              <div key={k} className="bg-clinical-50 rounded-lg p-2 border border-clinical-100">
                <p className="text-clinical-500 font-semibold uppercase tracking-wider text-[10px] mb-0.5">{k}</p>
                <p className="text-clinical-800 font-semibold text-xs truncate">{v}</p>
              </div>
            ))}
          </div>

          {/* THE button */}
          {!done ? (
            <button
              onClick={handleExportAndSend}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
              style={{ background: loading ? '#64748b' : 'linear-gradient(135deg, #2B3A8F 0%, #3DB54A 100%)' }}
            >
              {loading ? (
                <><SpinnerIcon />Processing...</>
              ) : (
                <>
                  <ExportSendIcon />
                  Export PDF &amp; Send to Assessor
                </>
              )}
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-3.5 bg-bw-greenLight border-2 border-bw-green rounded-xl text-bw-greenDark font-semibold text-sm">
              <svg className="w-5 h-5 text-bw-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              PDF exported &amp; sent to {assessment.assessor_email}
            </div>
          )}

          {/* Email notice */}
          <p className="text-center text-xs text-clinical-400 mt-2">
            PDF will download to your device and email automatically to <span className="font-semibold text-clinical-600">{assessment.assessor_email}</span>
          </p>
        </div>
      </div>

      {/* Wheelchair summary */}
      {hasWheelchair && (
        <MeasurementCard
          title="Wheelchair & Seating"
          color="navy"
          rows={[
            [1,'Back Height', assessment.wheelchair_data.back_height, true],
            [2,'Arm Height', assessment.wheelchair_data.arm_height, false],
            [3,'Lower Leg Length', assessment.wheelchair_data.lower_leg_length, true],
            [4,'Seat Depth', assessment.wheelchair_data.seat_depth, true],
            [5,'Chest Width', assessment.wheelchair_data.chest_width, false],
            [6,'Seat Width', assessment.wheelchair_data.seat_width, true],
            [7,'Height — Seat to Top of Head', assessment.wheelchair_data.height_seat_to_head, true],
            [8,'Shoulder Width', assessment.wheelchair_data.shoulder_width, false],
          ]}
          notes={assessment.wheelchair_data.notes}
          onEdit={onEditWheelchair}
        />
      )}

      {/* Standing summary */}
      {hasStanding && (
        <MeasurementCard
          title="Standing & Walking"
          color="green"
          rows={[
            [1,'Total Height', assessment.standing_data.total_height, true],
            [2,'Shoulder Height', assessment.standing_data.shoulder_height, false],
            [3,'Chest / Armpit Height', assessment.standing_data.chest_armpit_height, true],
            [4,'Buttock Height', assessment.standing_data.buttock_height, true],
            [5,'Chest Width', assessment.standing_data.chest_width, false],
            [6,'Shoulder Width', assessment.standing_data.shoulder_width, false],
            [7,'Top of Pelvic Height', assessment.standing_data.top_pelvic_height, true],
            [8,'Hip / Pelvis Width', assessment.standing_data.hip_pelvis_width, false],
            [9,'Below Knee', assessment.standing_data.below_knee, true],
            [10,'Chest Circumference', assessment.standing_data.chest_circumference, false],
            [11,'Pelvic Circumference', assessment.standing_data.pelvic_circumference, false],
            [12,'Knee Circumference', assessment.standing_data.knee_circumference, false],
            [13,'Knee Width', assessment.standing_data.knee_width, false],
            [14,'Foot Length', assessment.standing_data.foot_length, false],
            [15,'Foot Width', assessment.standing_data.foot_width, false],
          ]}
          notes={assessment.standing_data.notes}
          onEdit={onEditStanding}
        />
      )}

      {/* Edit / New row */}
      <div className="card p-4 bg-clinical-50">
        <p className="text-xs text-clinical-500 font-semibold uppercase tracking-wider mb-3">Edit Assessment</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={onEditProfile} className="btn-secondary text-xs py-2 px-3"><PencilIcon /> Patient Profile</button>
          {hasWheelchair && <button onClick={onEditWheelchair} className="btn-secondary text-xs py-2 px-3"><PencilIcon /> Wheelchair Form</button>}
          {hasStanding && <button onClick={onEditStanding} className="btn-secondary text-xs py-2 px-3"><PencilIcon /> Standing Form</button>}
          <button onClick={onNewAssessment} className="btn-secondary text-xs py-2 px-3 ml-auto"><PlusIcon /> New Assessment</button>
        </div>
      </div>

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Tag({ color, label }) {
  const s = { navy: 'bg-ms-navyLight text-ms-navy', green: 'bg-bw-greenLight text-bw-greenDark' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s[color]}`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
      </svg>
      {label}
    </span>
  )
}

function MeasurementCard({ title, color, rows, notes, onEdit }) {
  const header = color === 'navy' ? 'bg-ms-navy' : 'bg-bw-charcoal'
  const badge = color === 'navy' ? 'bg-ms-navy' : 'bg-bw-charcoal'
  const val = color === 'navy' ? 'text-ms-navy' : 'text-bw-charcoal'
  return (
    <div className="card overflow-hidden">
      <div className={`px-5 py-3 ${header} flex items-center justify-between`}>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <button onClick={onEdit} className="text-white/70 hover:text-white text-xs flex items-center gap-1">
          <PencilIcon /> Edit
        </button>
      </div>
      <div className="divide-y divide-clinical-50">
        {rows.map(([num, label, value, required]) => (
          <div key={num} className="flex items-center gap-3 px-4 py-2.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${badge}`}>{num}</div>
            <div className="flex-1 text-xs text-clinical-600 font-medium">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</div>
            <div className="text-right">
              {value
                ? <span className={`text-sm font-bold ${val}`}>{value} <span className="text-xs font-normal text-clinical-400">mm</span></span>
                : <span className="text-xs text-clinical-300 italic">—</span>}
            </div>
          </div>
        ))}
      </div>
      {notes && (
        <div className="px-4 py-3 bg-clinical-50 border-t border-clinical-100">
          <p className="text-xs font-semibold text-clinical-500 uppercase tracking-wider mb-1">Notes</p>
          <p className="text-xs text-clinical-700">{notes}</p>
        </div>
      )}
    </div>
  )
}

const ExportSendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)
const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
)
const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
  </svg>
)
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
  </svg>
)
