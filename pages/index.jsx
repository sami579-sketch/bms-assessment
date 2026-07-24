import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import PatientProfile from '../components/PatientProfile'
import AssessmentSelector from '../components/AssessmentSelector'
import WheelchairForm from '../components/WheelchairForm'
import StandingForm from '../components/StandingForm'
import ReviewPanel from '../components/ReviewPanel'
import { saveAssessmentLocally, generateId, getDraft, saveDraft, clearDraft } from '../lib/storage'

const STEPS = { PROFILE: 'profile', SELECT: 'select', WHEELCHAIR: 'wheelchair', STANDING: 'standing', REVIEW: 'review' }

export default function Home() {
  const [step, setStep] = useState(STEPS.PROFILE)
  const [assessment, setAssessment] = useState(null)
  const [saving, setSaving] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)

  useEffect(() => {
    const draft = getDraft()
    if (draft && !draftRestored) {
      setAssessment(draft)
      setStep(STEPS.SELECT)
      setDraftRestored(true)
      toast((t) => (
        <span className="text-sm">
          Draft restored for <strong>{draft.patient_name}</strong>
          <button onClick={() => { setAssessment(null); setStep(STEPS.PROFILE); clearDraft(); toast.dismiss(t.id) }}
            className="ml-3 text-xs text-red-400 underline">Discard</button>
        </span>
      ), { duration: 6000 })
    }
  }, [])

  useEffect(() => {
    if (assessment) { saveDraft(assessment); saveAssessmentLocally(assessment) }
  }, [assessment])

  const saveToSupabase = useCallback(async (data) => {
    setSaving(true)
    try {
      await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment: data }),
      })
    } catch (err) { console.warn('Supabase save failed:', err.message) }
    setSaving(false)
  }, [])

  const handleProfileComplete = (profileData) => {
    const a = { id: generateId(), ...profileData, wheelchair_data: null, standing_data: null, status: 'draft', created_at: new Date().toISOString() }
    setAssessment(a)
    setStep(STEPS.SELECT)
    saveToSupabase(a)
  }

  const handleWheelchairSave = (formData) => {
    const updated = { ...assessment, wheelchair_data: formData }
    setAssessment(updated)
    saveToSupabase(updated)
    toast.success('Wheelchair assessment saved')
    setStep(STEPS.SELECT)
  }

  const handleStandingSave = (formData) => {
    const updated = { ...assessment, standing_data: formData }
    setAssessment(updated)
    saveToSupabase(updated)
    toast.success('Standing assessment saved')
    setStep(STEPS.SELECT)
  }

  const handleNewAssessment = () => { clearDraft(); setAssessment(null); setStep(STEPS.PROFILE) }

  const completed = {
    wheelchair: !!(assessment?.wheelchair_data && Object.keys(assessment.wheelchair_data).length > 0),
    standing: !!(assessment?.standing_data && Object.keys(assessment.standing_data).length > 0),
  }

  const stepProgress = { profile: 20, select: 45, wheelchair: 65, standing: 65, review: 100 }

  return (
    <>
      <Head>
        <title>Bridgeway Healthcare — Assessment</title>
        <meta name="description" content="Bridgeway Healthcare Clinical Assessment Tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#2B3A8F" />
      </Head>

      <Toaster position="top-center" toastOptions={{
        className: 'text-sm font-medium',
        style: { borderRadius: '10px', background: '#1e293b', color: '#fff' },
        success: { style: { background: '#3DB54A', color: '#fff' } },
        error: { style: { background: '#dc2626', color: '#fff' } },
      }} />

      <div className="min-h-screen flex flex-col">

        {/* ── Header ── */}
        <header className="sticky top-0 z-40 bg-white border-b border-clinical-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

            {/* Logo — tightly-cropped mark, sized for clear visibility */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/bhs-logo.jpg"
                alt="Bridgeway Healthcare"
                className="h-11 w-auto object-contain"
                style={{ maxWidth: '210px' }}
              />
            </div>

            {/* Right: saving indicator + patient chip */}
            <div className="flex items-center gap-3 min-w-0">
              {saving && (
                <span className="text-xs text-clinical-400 flex items-center gap-1 flex-shrink-0">
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving…
                </span>
              )}
              {assessment && step !== STEPS.PROFILE && (
                <div className="hidden sm:block text-right min-w-0">
                  <p className="text-xs font-bold text-ms-navy truncate max-w-40">{assessment.patient_name}</p>
                  <p className="text-xs text-clinical-400">{assessment.assessment_date}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-clinical-100">
            <div
              className="h-full transition-all duration-700"
              style={{
                width: `${stepProgress[step] || 0}%`,
                background: 'linear-gradient(to right, #2B3A8F, #3DB54A)',
              }}
            />
          </div>
        </header>

        {/* ── Main ── */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-20">

          {/* Step label */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                ${step === STEPS.PROFILE ? 'bg-ms-navy' : 'bg-bw-green'}`}>
                {step === STEPS.PROFILE ? '1' : step === STEPS.REVIEW ? '3' : '2'}
              </span>
              <span className="text-sm font-semibold text-clinical-600">
                {step === STEPS.PROFILE && 'Patient Profile'}
                {step === STEPS.SELECT && 'Select Assessment'}
                {step === STEPS.WHEELCHAIR && 'Wheelchair & Seating'}
                {step === STEPS.STANDING && 'Standing & Walking'}
                {step === STEPS.REVIEW && 'Review & Export'}
              </span>
            </div>
            {step !== STEPS.PROFILE && assessment?.product && (
              <span className="text-xs text-bw-green bg-bw-greenLight border border-bw-green/20 px-2.5 py-1 rounded-full font-semibold">
                {assessment.product}
              </span>
            )}
          </div>

          {step === STEPS.PROFILE && (
            <PatientProfile data={{}} onComplete={handleProfileComplete} />
          )}
          {step === STEPS.SELECT && assessment && (
            <div className="space-y-4">
              <PatientProfile data={assessment} readOnly onEdit={() => setStep(STEPS.PROFILE)} />
              <AssessmentSelector onSelect={(t) => {
                if (t === 'review') setStep(STEPS.REVIEW)
                else if (t === 'wheelchair') setStep(STEPS.WHEELCHAIR)
                else if (t === 'standing') setStep(STEPS.STANDING)
              }} completed={completed} />
            </div>
          )}
          {step === STEPS.WHEELCHAIR && assessment && (
            <div className="space-y-4">
              <PatientProfile data={assessment} readOnly />
              <WheelchairForm data={assessment.wheelchair_data || {}} onSave={handleWheelchairSave} onBack={() => setStep(STEPS.SELECT)} />
            </div>
          )}
          {step === STEPS.STANDING && assessment && (
            <div className="space-y-4">
              <PatientProfile data={assessment} readOnly />
              <StandingForm data={assessment.standing_data || {}} onSave={handleStandingSave} onBack={() => setStep(STEPS.SELECT)} />
            </div>
          )}
          {step === STEPS.REVIEW && assessment && (
            <div className="space-y-4">
              <button onClick={() => setStep(STEPS.SELECT)} className="text-xs text-clinical-500 hover:text-ms-navy flex items-center gap-1 mb-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12"/>
                </svg>
                Back to assessment
              </button>
              <ReviewPanel
                assessment={assessment}
                onEditProfile={() => setStep(STEPS.PROFILE)}
                onEditWheelchair={() => setStep(STEPS.WHEELCHAIR)}
                onEditStanding={() => setStep(STEPS.STANDING)}
                onNewAssessment={handleNewAssessment}
              />
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <footer className="bg-white border-t border-clinical-100 py-4">
          <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-clinical-500 font-medium">© Bridgeway Healthcare — Confidential Clinical Tool</p>
              <p className="text-xs text-clinical-400 mt-0.5">Al Ttay, Al Khawaneej 2, Dubai · +971 4 876 9106</p>
            </div>
            {/* Logo in footer — visible but modest */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bhs-logo.jpg"
              alt="Bridgeway Healthcare"
              className="h-9 w-auto object-contain opacity-80"
              style={{ maxWidth: '150px' }}
            />
          </div>
        </footer>
      </div>
    </>
  )
}
