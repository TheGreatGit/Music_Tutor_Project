import React, { useEffect, useState } from "react";

const StudentCrudForm = () => {
  const [dbCities, setDBCities] = useState([]);

  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [cityFetchError, setCityFetchError] = useState({
    cityError: null,
  });

  // get cities
  useEffect(() => {
    const controller = new AbortController();

    const getCities = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/filters/cities", {
          credentials: "include",
          signal: controller.signal,
        });

        // try new approach of .json() on response before !res.ok check so you can get backend error message
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to fetch cities");
        }

        setDBCities(data);
        setCityFetchError({
          cityError: null,
        });
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        setCityFetchError({
          cityError: error?.message || "Error when fetching cities",
        });
        setDBCities([]);
      }
    };

    getCities();
    return () => controller.abort();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Edit details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update you current student details
        </p>
      </div>

      <form noValidate className="space-y-4 text-left">
        <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-slate-700"
          >
            First name
          </label>
          <input
            type="text"
            id="firstName"
            readOnly
            className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm"
          />
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-slate-700"
          >
            Last name
          </label>
          <input
            type="text"
            id="lastName"
            readOnly
            className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            readOnly
            className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm"
          />
        </div>

        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-slate-700"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm"
          />
        </div>
      </form>
    </div>
  );
};

export default StudentCrudForm;
