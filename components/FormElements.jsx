export function FormField({ label, required, error, hint, children, className = '' }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className={`field-label ${required ? 'field-required' : ''}`}>
        {label}
        {!required && <span className="ml-1 text-clinical-300 normal-case font-normal tracking-normal text-xs">(optional)</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-clinical-400 mt-1">{hint}</p>}
      {error && (
        <p className="field-error">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export function TextInput({ error, ...props }) {
  return <input className={`field-input ${error ? 'field-input-error' : ''}`} {...props} />
}

export function TextArea({ error, rows = 4, ...props }) {
  return <textarea rows={rows} className={`field-input resize-none ${error ? 'field-input-error' : ''}`} {...props} />
}

export function MeasurementInput({ number, label, required, error, unit = 'mm', value, onChange, hint }) {
  return (
    <div className={`flex gap-3 items-start p-3 rounded-lg border transition-colors ${
      error ? 'border-red-200 bg-red-50' : 'border-clinical-100 bg-clinical-50 hover:border-ms-blue/30'
    }`}>
      <div className="measurement-badge mt-0.5">{number}</div>
      <div className="flex-1 min-w-0">
        <label className={`field-label mb-1 ${required ? 'field-required' : ''}`}>
          {label}
          {!required && <span className="ml-1 text-clinical-300 normal-case font-normal tracking-normal text-xs">(optional)</span>}
        </label>
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            className={`field-input pr-12 ${error ? 'field-input-error' : ''}`}
            value={value || ''}
            onChange={onChange}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-clinical-400 pointer-events-none">{unit}</span>
        </div>
        {hint && !error && <p className="text-xs text-clinical-400 mt-1">{hint}</p>}
        {error && (
          <p className="field-error">
            <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export function SectionCard({ title, subtitle, icon, color = 'navy', children, className = '' }) {
  const colors = {
    navy: 'bg-ms-navy',
    green: 'bg-bw-green',
    cyan: 'bg-ms-cyan',
    blue: 'bg-ms-blue',
  }
  return (
    <div className={`card overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-clinical-100 bg-gradient-to-r from-clinical-50 to-white">
        <div className="flex items-center gap-3">
          <div className={`section-icon ${colors[color] || colors.navy}`}>{icon}</div>
          <div>
            <h3 className="font-semibold text-clinical-800 text-sm">{title}</h3>
            {subtitle && <p className="text-xs text-clinical-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

export function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-amber-100 text-amber-700',
    complete: 'bg-green-100 text-green-700',
    sent: 'bg-ms-navyLight text-ms-navy',
  }
  const labels = { draft: 'Draft', complete: 'Complete', sent: 'Sent' }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.draft}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {labels[status] || 'Draft'}
    </span>
  )
}
