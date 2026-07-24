const STORAGE_KEY = 'bms_assessments'
const DRAFT_KEY = 'bms_current_draft'

export function saveAssessmentLocally(assessment) {
  try {
    const existing = getAllLocalAssessments()
    const idx = existing.findIndex(a => a.id === assessment.id)
    const updated = { ...assessment, updated_at: new Date().toISOString() }
    if (idx >= 0) {
      existing[idx] = updated
    } else {
      existing.unshift(updated)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
    return true
  } catch (e) {
    console.error('localStorage save failed:', e)
    return false
  }
}

export function getAllLocalAssessments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getLocalAssessment(id) {
  return getAllLocalAssessments().find(a => a.id === id) || null
}

export function deleteLocalAssessment(id) {
  try {
    const updated = getAllLocalAssessments().filter(a => a.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return true
  } catch {
    return false
  }
}

export function saveDraft(data) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, saved_at: new Date().toISOString() }))
  } catch {}
}

export function getDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {}
}

export function generateId() {
  return `bms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
