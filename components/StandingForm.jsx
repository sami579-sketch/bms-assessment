import { useState } from 'react'
import { MeasurementInput, SectionCard, TextArea, FormField } from './FormElements'

const REQUIRED_FIELDS = ['total_height', 'chest_armpit_height', 'buttock_height', 'top_pelvic_height', 'below_knee']

const FIELDS = [
  { key: 'total_height',         number: 1,  label: 'Total Height',            required: true,  hint: 'Floor to top of head standing' },
  { key: 'shoulder_height',      number: 2,  label: 'Shoulder Height',         required: false, hint: 'Floor to top of shoulder' },
  { key: 'chest_armpit_height',  number: 3,  label: 'Chest / Armpit Height',   required: true,  hint: 'Floor to axilla (armpit)' },
  { key: 'buttock_height',       number: 4,  label: 'Buttock Height',          required: true,  hint: 'Floor to base of buttock / gluteal fold' },
  { key: 'chest_width',          number: 5,  label: 'Chest Width',             required: false, hint: 'Widest horizontal measurement across chest' },
  { key: 'shoulder_width',       number: 6,  label: 'Shoulder Width',          required: false, hint: 'Across widest point of shoulders' },
  { key: 'top_pelvic_height',    number: 7,  label: 'Top of Pelvic Height',    required: true,  hint: 'Floor to iliac crest (top of hip bone)' },
  { key: 'hip_pelvis_width',     number: 8,  label: 'Hip / Pelvis Width',      required: false, hint: 'Widest horizontal measurement across hips' },
  { key: 'below_knee',           number: 9,  label: 'Below Knee',              required: true,  hint: 'Floor to below patella (kneecap)' },
  { key: 'chest_circumference',  number: 10, label: 'Chest Circumference',     required: false, hint: 'Full circumference at widest chest point' },
  { key: 'pelvic_circumference', number: 11, label: 'Pelvic Circumference',    required: false, hint: 'Full circumference at widest hip/pelvis point' },
  { key: 'knee_circumference',   number: 12, label: 'Knee Circumference',      required: false, hint: 'Full circumference around knee' },
  { key: 'knee_width',           number: 13, label: 'Knee Width',              required: false, hint: 'Lateral width across the knee joint' },
  { key: 'foot_length',          number: 14, label: 'Foot Length',             required: false, hint: 'Heel to longest toe' },
  { key: 'foot_width',           number: 15, label: 'Foot Width',              required: false, hint: 'Widest point across the foot' },
]

const HEIGHT_FIELDS   = FIELDS.slice(0, 9)
const CIRCUM_FIELDS   = FIELDS.slice(9)

export default function StandingForm({ data = {}, onSave, onBack, readOnly = false, onEdit }) {
  const [form, setForm]     = useState({ notes: '', ...data })
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
    if (Object.keys(e).length > 0) return
    onSave(form, status)
  }

  const completedCount   = FIELDS.filter(f => form[f.key]?.trim()).length
  const requiredComplete = REQUIRED_FIELDS.filter(k => form[k]?.trim()).length

  if (readOnly) {
    return (
      <SectionCard title="Standing, Walking, Walker & Standing Frame"
        subtitle={`${completedCount} of ${FIELDS.length} measurements recorded`}
        icon={<StandingIcon />} color="navy">
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
      title="Standing, Walking, Walker & Standing Frame"
      subtitle="All measurements in millimetres (mm). Fields marked * are required."
      icon={<StandingIcon />} color="navy">

      {/* ── Reference image panel ─────────────────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-clinical-200 overflow-hidden bg-white">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-clinical-100 bg-ms-navyLight">
          <svg className="w-4 h-4 text-ms-navy flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p className="text-xs font-semibold text-ms-navy">
            Standing & Walking Measurement Reference
          </p>
        </div>

        {/* Reference image (user-supplied) */}
        <div className="p-4 flex items-center justify-center bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/standing-ref.png"
            alt="Standing and walking measurement reference diagram"
            className="mx-auto max-h-96 w-auto object-contain"
          />
        </div>
      </div>

      {/* ── Progress ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-2 text-xs text-clinical-500">
        <span className="font-medium">{requiredComplete}/{REQUIRED_FIELDS.length} required complete</span>
        <span>{completedCount}/{FIELDS.length} total</span>
      </div>
      <div className="progress-bar mb-5">
        <div className="progress-fill" style={{ width: `${(requiredComplete / REQUIRED_FIELDS.length) * 100}%` }} />
      </div>

      {/* ── Height measurements ───────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-ms-navy uppercase tracking-wider">Height Measurements</span>
          <div className="flex-1 h-px bg-ms-navyLight"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {HEIGHT_FIELDS.map(({ key, number, label, required, hint }) => (
            <MeasurementInput key={key} number={number} label={label} required={required}
              error={errors[key]} value={form[key]} onChange={set(key)} hint={hint}/>
          ))}
        </div>
      </div>

      {/* ── Circumference & width measurements ───────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold text-bw-green uppercase tracking-wider">Circumference & Width Measurements</span>
          <div className="flex-1 h-px bg-bw-greenLight"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CIRCUM_FIELDS.map(({ key, number, label, required, hint }) => (
            <MeasurementInput key={key} number={number} label={label} required={required}
              error={errors[key]} value={form[key]} onChange={set(key)} hint={hint}/>
          ))}
        </div>
      </div>

      {/* ── Notes ─────────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <FormField label="Clinical Notes">
          <TextArea value={form.notes || ''} onChange={set('notes')}
            placeholder="Any additional observations, gait analysis notes, or clinical findings..."
            rows={3}/>
        </FormField>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 justify-between pt-3 border-t border-clinical-100">
        {onBack && <button onClick={onBack} className="btn-secondary"><BackIcon /> Back</button>}
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

const StandingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
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
