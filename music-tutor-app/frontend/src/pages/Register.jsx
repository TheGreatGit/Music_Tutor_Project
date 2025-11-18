import React from "react";
import { NavLink } from "react-router-dom";

const Register = () => {
  return (
  <div className="p-10">
    <h1 className="text-3xl font-semibold mb-8">Register</h1>
    <p className="mb-6 text-slate-600">
      Choose profile...
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <NavLink to="/register/tutor" className="block p-8 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition cursor-pointer bg-white text-center">
        <h2 className="text-xl fonr:semibold mb-2">Register as tutor</h2>
        <p className="text-slate-600"></p>
      </NavLink>

      <NavLink to="/register/student" className="block p-8 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition cursor-pointer bg-white text-center">
        <h2 className="text-xl fonr:semibold mb-2">Register as student</h2>
        <p className="text-slate-600"></p>
      </NavLink>


    </div>
  </div>)
};

export default Register;
