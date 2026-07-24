export default function AssessmentSelector({ onSelect, completed = {} }) {
  const hasWheelchair = completed.wheelchair
  const hasStanding = completed.standing

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-clinical-100 bg-gradient-to-r from-clinical-50 to-white">
        <div className="flex items-center gap-3">
          <div className="section-icon bg-accent-teal">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-clinical-800 text-sm">Select Assessment Form</h3>
            <p className="text-xs text-clinical-500 mt-0.5">Choose one or both forms to complete. You can return to add the other later.</p>
          </div>
        </div>
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Wheelchair card */}
        <button
          onClick={() => onSelect('wheelchair')}
          className={`group relative text-left rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-card-hover active:scale-[0.98] ${
            hasWheelchair
              ? 'border-accent-teal bg-accent-tealLight'
              : 'border-clinical-200 bg-white hover:border-accent-teal'
          }`}
        >
          {hasWheelchair && (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold text-accent-teal bg-white rounded-full px-2 py-0.5 shadow-sm border border-accent-tealLight">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Complete
            </span>
          )}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
            hasWheelchair ? 'bg-accent-teal' : 'bg-clinical-100 group-hover:bg-accent-teal'
          }`}>
            <svg className={`w-5 h-5 transition-colors ${hasWheelchair ? 'text-white' : 'text-clinical-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="4" r="2" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 8h3l2 6h3M10 8L8 14m4-6v4" />
              <circle cx="9" cy="19" r="2" strokeWidth={2} />
              <circle cx="17" cy="19" r="2" strokeWidth={2} />
            </svg>
          </div>
          <h4 className="font-bold text-clinical-800 text-sm mb-1">
            Wheelchair & Seating
          </h4>
          <p className="text-xs text-clinical-500 leading-relaxed">
            Wheelchair, seating, toilet, bath, scallop & buggy assessment
          </p>
          <p className="text-xs font-semibold text-clinical-400 mt-2">8 measurements</p>
        </button>

        {/* Standing card */}
        <button
          onClick={() => onSelect('standing')}
          className={`group relative text-left rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-card-hover active:scale-[0.98] ${
            hasStanding
              ? 'border-navy-700 bg-navy-50'
              : 'border-clinical-200 bg-white hover:border-navy-700'
          }`}
        >
          {hasStanding && (
            <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold text-navy-700 bg-white rounded-full px-2 py-0.5 shadow-sm border border-navy-100">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Complete
            </span>
          )}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
            hasStanding ? 'bg-navy-800' : 'bg-clinical-100 group-hover:bg-navy-800'
          }`}>
            <svg className={`w-5 h-5 transition-colors ${hasStanding ? 'text-white' : 'text-clinical-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h4 className="font-bold text-clinical-800 text-sm mb-1">
            Standing & Walking
          </h4>
          <p className="text-xs text-clinical-500 leading-relaxed">
            Standing, walking, walker & standing frame assessment
          </p>
          <p className="text-xs font-semibold text-clinical-400 mt-2">15 measurements</p>
        </button>

      </div>

      {(hasWheelchair || hasStanding) && (
        <div className="px-5 pb-5">
          <button
            onClick={() => onSelect('review')}
            className="btn-primary w-full justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Review & Export Assessment
          </button>
        </div>
      )}
    </div>
  )
}
