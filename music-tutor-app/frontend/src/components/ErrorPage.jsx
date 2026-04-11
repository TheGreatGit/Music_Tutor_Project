import React from "react";
import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  // get any errors with router dom's error hook
  const error = useRouteError();

  // check if it as anctual Error object or just a sloppy 'throw xyz' from the code
  // this is because, for soem reason, JS allows you to throw without creating an actual Error object
  const message =
    error instanceof Error ? error?.message : "An unexpected error occurred";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          An error occurred
        </h1>
        <p className="mt-3 text-slate-600">{message}</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Back to main page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
