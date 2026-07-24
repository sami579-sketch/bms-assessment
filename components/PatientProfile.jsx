import { useState } from 'react'
import { FormField, TextInput, SectionCard } from './FormElements'
import SearchableDropdown from './SearchableDropdown'
import { PRODUCTS, CLIENTS } from '../lib/constants'

const INITIAL = {
  patient_name: '', patient_age: '', patient_height: '', patient_phone: '',
  assessor_name: '', assessor_email: '', assessment_date: '',
  product: '', client: '',
}

export default function PatientProfile({ data = {}, onComplete, readOnly = false, onEdit }) {
  const [form, setForm] = useState({ ...INITIAL, ...data })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))
  const setDirect = (field) => (val) => setForm(f => ({ ...f, [field]: val }))

  const validate = () => {
    const e = {}
    if (!form.patient_name.trim()) e.patient_name = 'Patient name is required'
    if (!form.patient_age.trim()) e.patient_age = 'Age is required'
    else if (isNaN(Number(form.patient_age)) || Number(form.patient_age) < 0 || Number(form.patient_age) > 120)
      e.patient_age = 'Enter a valid age (0–120)'
    if (!form.patient_height.trim()) e.patient_height = 'Height is required'
    if (!form.patient_phone.trim()) e.patient_phone = 'Phone number is required'
    if (!form.product) e.product = 'Please select a product'
    if (!form.client) e.client = 'Please select a client / hospital'
    if (!form.assessor_name.trim()) e.assessor_name = 'Assessor name is required'
    if (!form.assessor_email.trim()) e.assessor_email = 'Assessor email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.assessor_email)) e.assessor_email = 'Enter a valid email address'
    if (!form.assessment_date.trim()) e.assessment_date = 'Assessment date is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length === 0) onComplete(form)
  }

  if (readOnly) {
    return (
      <SectionCard title="Patient Profile" subtitle="Assessment details" icon={<PatientIcon />} color="navy">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            ['Patient Name', data.patient_name],
            ['Age', data.patient_age ? `${data.patient_age} years` : ''],
            ['Height', data.patient_height],
            ['Phone', data.patient_phone],
            ['Product', data.product],
            ['Client / Hospital', data.client],
            ['Assessor', data.assessor_name],
            ['Assessor Email', data.assessor_email],
            ['Assessment Date', data.assessment_date],
          ].map(([label, value]) => (
            <div key={label} className="bg-clinical-50 rounded-lg px-3 py-2.5 border border-clinical-100">
              <p className="text-[10px] text-clinical-500 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-sm font-semibold text-clinical-800 truncate">{value || '—'}</p>
            </div>
          ))}
        </div>
        {onEdit && (
          <button onClick={onEdit} className="btn-secondary mt-4 text-xs py-2 px-3">
            <PencilIcon /> Edit Profile
          </button>
        )}
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Patient Profile"
      subtitle="All fields are required — complete this section to continue"
      icon={<PatientIcon />}
      color="navy"
    >
      {/* Patient details */}
      <div className="mb-5">
        <SectionDivider label="Patient Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Patient Name" required error={errors.patient_name}>
            <TextInput value={form.patient_name} onChange={set('patient_name')} placeholder="Full name" error={errors.patient_name} autoComplete="off" />
          </FormField>
          <FormField label="Age" required error={errors.patient_age}>
            <TextInput value={form.patient_age} onChange={set('patient_age')} placeholder="e.g. 34" inputMode="numeric" error={errors.patient_age} />
          </FormField>
          <FormField label="Height" required error={errors.patient_height} hint="e.g. 165cm or 5ft 5in">
            <TextInput value={form.patient_height} onChange={set('patient_height')} placeholder="e.g. 165cm" error={errors.patient_height} />
          </FormField>
          <FormField label="Phone Number" required error={errors.patient_phone}>
            <TextInput value={form.patient_phone} onChange={set('patient_phone')} placeholder="e.g. 07700 900000" type="tel" inputMode="tel" error={errors.patient_phone} />
          </FormField>
        </div>
      </div>

      {/* Product & Client */}
      <div className="mb-5">
        <SectionDivider label="Assessment Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Product Being Assessed" required error={errors.product}>
            <SearchableDropdown
              options={PRODUCTS}
              value={form.product}
              onChange={setDirect('product')}
              placeholder="Select product..."
              error={errors.product}
              allowOther={true}
            />
            {errors.product && (
              <p className="field-error mt-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {errors.product}
              </p>
            )}
          </FormField>
          <FormField label="Client / Hospital" required error={errors.client}>
            <SearchableDropdown
              options={CLIENTS}
              value={form.client}
              onChange={setDirect('client')}
              placeholder="Select client or hospital..."
              error={errors.client}
              allowOther={true}
            />
            {errors.client && (
              <p className="field-error mt-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {errors.client}
              </p>
            )}
          </FormField>
        </div>
      </div>

      {/* Assessor details */}
      <div className="mb-5">
        <SectionDivider label="Assessor Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Assessor Name" required error={errors.assessor_name}>
            <TextInput value={form.assessor_name} onChange={set('assessor_name')} placeholder="Full name" error={errors.assessor_name} />
          </FormField>
          <FormField label="Assessor Email" required error={errors.assessor_email}>
            <TextInput value={form.assessor_email} onChange={set('assessor_email')} placeholder="name@clinic.com" type="email" inputMode="email" error={errors.assessor_email} />
          </FormField>
          <FormField label="Assessment Date" required error={errors.assessment_date} className="sm:col-span-2 sm:max-w-xs">
            <TextInput value={form.assessment_date} onChange={set('assessment_date')} type="date" error={errors.assessment_date} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSubmit} className="btn-primary">
          Continue to Assessment
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>
    </SectionCard>
  )
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-ms-navy uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-ms-navyLight" />
    </div>
  )
}

function PatientIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  )
}
