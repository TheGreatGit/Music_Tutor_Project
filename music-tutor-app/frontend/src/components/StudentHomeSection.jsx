import React from 'react'

const StudentHomeSection = (user) => {
  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-lg font-semibold text-slate-800">
            Student dashboard
        </h2>
        <p className="text-sm text-slate-600">
            Hello, {user?.role} {user?.display_name}
        </p>
    </div>
  )
}

export default StudentHomeSection