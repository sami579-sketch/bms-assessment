import { createClient } from '@supabase/supabase-js'

// Server-side client using the service-role key. All reads/writes go through here
// (never the public browser key), so patient data isn't directly queryable by anyone
// who has the site's public anon key.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  // ── Create / update ──────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { assessment } = req.body
    if (!assessment) return res.status(400).json({ error: 'Missing assessment data' })

    const row = {
      // Legacy bms_ ids get a fresh UUID; real UUIDs are kept so re-saves update the same row.
      id: assessment.id && !String(assessment.id).startsWith('bms_') ? assessment.id : undefined,
      patient_name: assessment.patient_name,
      patient_age: assessment.patient_age,
      patient_height: assessment.patient_height,
      patient_phone: assessment.patient_phone,
      assessor_name: assessment.assessor_name,
      assessor_email: assessment.assessor_email,
      assessment_date: assessment.assessment_date,
      product: assessment.product ?? null,
      client: assessment.client ?? null,
      wheelchair_data: assessment.wheelchair_data || null,
      standing_data: assessment.standing_data || null,
      status: assessment.status || 'draft',
      updated_at: new Date().toISOString(),
    }
    if (assessment.pdf_path !== undefined) row.pdf_path = assessment.pdf_path

    const { data, error } = await supabase.from('assessments').upsert(row).select().single()
    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: error.message })
    }
    return res.status(200).json({ success: true, assessment: data })
  }

  // ── Read: one by id, or a filtered/searched list ─────────────────────────
  if (req.method === 'GET') {
    const { id, q, status } = req.query

    if (id) {
      const { data, error } = await supabase.from('assessments').select('*').eq('id', id).single()
      if (error) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(data)
    }

    let query = supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000)

    if (status && status !== 'all') query = query.eq('status', status)
    if (q) {
      const term = `%${q}%`
      query = query.or(
        `patient_name.ilike.${term},assessor_name.ilike.${term},client.ilike.${term},product.ilike.${term}`
      )
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'Missing id' })
    const { error } = await supabase.from('assessments').delete().eq('id', id)
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
