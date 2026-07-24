import { useState, useRef, useEffect } from 'react'

export default function SearchableDropdown({
  options = [],
  value,
  onChange,
  placeholder = 'Search or select...',
  error,
  allowOther = false,
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherValue, setOtherValue] = useState('')
  const ref = useRef(null)
  const inputRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  const selectOption = (opt) => {
    onChange(opt)
    setSearch('')
    setOpen(false)
    setShowOtherInput(false)
  }

  const selectOther = () => {
    setShowOtherInput(true)
    setOpen(false)
    setSearch('')
  }

  const confirmOther = () => {
    if (otherValue.trim()) {
      onChange(otherValue.trim())
      setShowOtherInput(false)
    }
  }

  const displayValue = value || ''
  const isOther = value && !options.includes(value)

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      {!showOtherInput ? (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`field-input text-left flex items-center justify-between gap-2 ${error ? 'field-input-error' : ''} ${!value ? 'text-clinical-300' : 'text-clinical-800'}`}
        >
          <span className="truncate">
            {isOther ? `Other: ${value}` : displayValue || placeholder}
          </span>
          <svg className={`w-4 h-4 flex-shrink-0 text-clinical-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : (
        <div className="flex gap-2">
          <input
            autoFocus
            type="text"
            className="field-input flex-1"
            placeholder="Type custom value..."
            value={otherValue}
            onChange={e => setOtherValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmOther(); if (e.key === 'Escape') setShowOtherInput(false) }}
          />
          <button type="button" onClick={confirmOther} className="btn-green px-3 py-2 text-xs">Add</button>
          <button type="button" onClick={() => setShowOtherInput(false)} className="btn-secondary px-3 py-2 text-xs">✕</button>
        </div>
      )}

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-card-hover border border-clinical-200 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-clinical-100">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-clinical-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-clinical-50 border border-clinical-200 rounded-lg outline-none focus:border-ms-blue focus:ring-1 focus:ring-ms-blue/20"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-clinical-400 text-center">No matches found</p>
            ) : (
              filtered.map(opt => (
                <div
                  key={opt}
                  onClick={() => selectOption(opt)}
                  className={`dropdown-option ${value === opt ? 'dropdown-option-selected' : ''}`}
                >
                  {value === opt && (
                    <svg className="w-3.5 h-3.5 text-ms-navy flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {opt}
                </div>
              ))
            )}
            {allowOther && (
              <div onClick={selectOther} className="dropdown-option border-t border-clinical-100 mt-1 text-ms-blue font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Other (type your own)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
