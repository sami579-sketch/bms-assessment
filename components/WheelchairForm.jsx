import { useState } from 'react'
import { MeasurementInput, SectionCard, TextArea, FormField } from './FormElements'

const REQUIRED_FIELDS = ['back_height', 'lower_leg_length', 'seat_depth', 'seat_width', 'height_seat_to_head']

const FIELDS = [
  { key: 'back_height',        number: 1, label: 'Back Height',                   required: true,  hint: 'Seat surface to top of back support needed' },
  { key: 'arm_height',         number: 2, label: 'Arm Height',                    required: false, hint: 'Seat surface to bottom of forearm at rest' },
  { key: 'lower_leg_length',   number: 3, label: 'Lower Leg Length',              required: true,  hint: 'Back of knee to heel' },
  { key: 'seat_depth',         number: 4, label: 'Seat Depth',                    required: true,  hint: 'Back of buttock to back of knee' },
  { key: 'chest_width',        number: 5, label: 'Chest Width',                   required: false, hint: 'Widest point across chest / rib cage' },
  { key: 'seat_width',         number: 6, label: 'Seat Width',                    required: true,  hint: 'Widest point across hips / thighs seated' },
  { key: 'height_seat_to_head',number: 7, label: 'Height — Seat to Top of Head',  required: true,  hint: 'Seat surface to top of head when seated' },
  { key: 'shoulder_width',     number: 8, label: 'Shoulder Width',                required: false, hint: 'Across widest point of shoulders' },
]

export default function WheelchairForm({ data = {}, onSave, onBack, readOnly = false, onEdit }) {
  const [form, setForm]   = useState({ notes: '', ...data })
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const e = {}
    REQUIRED_FIELDS.forEach(key => {
      const field = FIELDS.find(f => f.key === key)
      if (!form[key]?.trim()) e[key] = `${field?.label} is required`
      else if (isNaN(parseFloat(form[key]))) e[key] = 'Enter a valid measurement'
    })
    return e
  }

  const handleSave = (status = 'draft') => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length > 0) {
      const first = document.querySelector('[data-error]')
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    onSave(form, status)
  }

  const completedCount   = FIELDS.filter(f => form[f.key]?.trim()).length
  const requiredComplete = REQUIRED_FIELDS.filter(k => form[k]?.trim()).length

  if (readOnly) {
    return (
      <SectionCard title="Wheelchair, Seating, Toilet, Bath, Scallop & Buggy"
        subtitle={`${completedCount} of ${FIELDS.length} measurements recorded`}
        icon={<WheelchairIcon />} color="green">
        <div className="space-y-2">
          {FIELDS.map(({ key, number, label, required }) => (
            <div key={key} className="flex items-center gap-3 py-2 border-b border-clinical-50 last:border-0">
              <div className="measurement-badge text-xs">{number}</div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-clinical-600">{label}</span>
                {required && <span className="ml-1 text-red-400 text-xs">*</span>}
              </div>
              <div className="text-right">
                {form[key]
                  ? <span className="text-sm font-bold text-ms-navy">{form[key]} <span className="text-xs font-normal text-clinical-500">mm</span></span>
                  : <span className="text-xs text-clinical-300 italic">not recorded</span>}
              </div>
            </div>
          ))}
          {form.notes && (
            <div className="mt-3 bg-clinical-50 rounded-lg p-3 border border-clinical-100">
              <p className="text-xs font-semibold text-clinical-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-clinical-700">{form.notes}</p>
            </div>
          )}
        </div>
        {onEdit && <button onClick={onEdit} className="btn-secondary mt-4 text-xs py-2 px-3"><PencilIcon /> Edit Measurements</button>}
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Wheelchair, Seating, Toilet, Bath, Scallop & Buggy"
      subtitle="All measurements in millimetres (mm). Fields marked * are required."
      icon={<WheelchairIcon />} color="green">

      {/* ── Reference image (user-supplied) ───────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-clinical-200 overflow-hidden bg-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-clinical-100 bg-bw-greenLight">
          <svg className="w-4 h-4 text-bw-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-xs font-semibold text-bw-green">Wheelchair &amp; Seating Measurement Reference</p>
        </div>
        <div className="p-4 flex items-center justify-center bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/wheelchair-ref.png"
            alt="Wheelchair and seating measurement reference diagram"
            className="mx-auto max-h-80 w-auto object-contain"
          />
        </div>
      </div>

      {/* ── Progress ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 text-xs text-clinical-500">
        <span className="font-medium">{requiredComplete}/{REQUIRED_FIELDS.length} required complete</span>
        <span>{completedCount}/{FIELDS.length} total</span>
      </div>
      <div className="progress-bar mb-5">
        <div className="progress-fill" style={{ width: `${(requiredComplete / REQUIRED_FIELDS.length) * 100}%` }} />
      </div>

      {/* ── Measurement fields ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {FIELDS.map(({ key, number, label, required, hint }) => (
          <div key={key} data-error={errors[key] ? true : undefined}>
            <MeasurementInput
              number={number}
              label={label}
              required={required}
              error={errors[key]}
              value={form[key]}
              onChange={set(key)}
              hint={hint}
            />
          </div>
        ))}
      </div>

      {/* ── Notes ─────────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <FormField label="Clinical Notes">
          <TextArea
            value={form.notes || ''}
            onChange={set('notes')}
            placeholder="Any additional observations, contraindications, or clinical notes..."
            rows={3}
          />
        </FormField>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-between pt-3 border-t border-clinical-100">
        {onBack && (
          <button onClick={onBack} className="btn-secondary">
            <BackIcon /> Back
          </button>
        )}
        <div className="flex gap-3 ml-auto">
          <button onClick={() => handleSave('draft')} className="btn-secondary">Save Draft</button>
          <button onClick={() => handleSave('complete')} className="btn-primary">
            Save & Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </button>
        </div>
      </div>
    </SectionCard>
  )
}

const WheelchairIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="4" r="2" strokeWidth={2}/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 8h3l2 6h3M10 8L8 14m4-6v4"/>
    <circle cx="9" cy="19" r="2" strokeWidth={2}/>
    <circle cx="17" cy="19" r="2" strokeWidth={2}/>
  </svg>
)
const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
  </svg>
)
const BackIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
  </svg>
)
