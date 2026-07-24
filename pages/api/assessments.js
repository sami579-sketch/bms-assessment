import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Save assessment
    const { assessment } = req.body
    if (!assessment) return res.status(400).json({ error: 'Missing assessment data' })

    const { data, error } = await supabase
      .from('assessments')
      .upsert({
        id: assessment.id?.startsWith('bms_') ? undefined : assessment.id,
        patient_name: assessment.patient_name,
        patient_age: assessment.patient_age,
        patient_height: assessment.patient_height,
        patient_phone: assessment.patient_phone,
        assessor_name: assessment.assessor_name,
        assessor_email: assessment.assessor_email,
        assessment_date: assessment.assessment_date,
        wheelchair_data: assessment.wheelchair_data || null,
        standing_data: assessment.standing_data || null,
        status: assessment.status || 'draft',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, assessment: data })
  }

  if (req.method === 'GET') {
    const { id } = req.query

    if (id) {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(data)
    }

    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
