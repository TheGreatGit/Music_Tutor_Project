import React, { useEffect, useState } from "react";

const StudentCrudForm = ({ studentProfile }) => {
  const [dbCities, setDBCities] = useState([]);

  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [cityFetchError, setCityFetchError] = useState({
    cityError: null,
  });

  const [inputs, setInputs] = useState({
    city: studentProfile?.city_name || "",
  });

  // repopulates the form's city field if app is refreshed and studentProfile is temporarily null until re-auth completes
  useEffect(() => {
    setInputs({ city: studentProfile?.city_name || "" });
  }, [studentProfile]);

  const onChange = (e) => {
    const { name, value } = e.target;
    // this more elabprate form is not needed as only the city inpout changes, but use this more elaborate form in case I expand the form later
    setInputs((current) => ({
      ...current,
      [name]: value,
    }));
  };

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

  const userCityInput = (inputs.city || "").toLowerCase().trim();
  const hasExactCityMatch =
    userCityInput &&
    dbCities.some(
      (cityRow) => (cityRow.city_name || "").toLowerCase() === userCityInput,
    );
  const cityDropdown =
    userCityInput && !hasExactCityMatch
      ? dbCities
          .filter((cityRow) => {
            const matchCity = (cityRow.city_name || "").toLowerCase();
            return (
              matchCity.includes(userCityInput) && matchCity !== userCityInput
            );
          })
          .slice(0, 10)
      : [];

  const handleClick = (searchTerm, fieldName) => {
    // the handleChange() function is not triggered when the city/instrument dropdowns arw clicked
    // so clear the success/error state here too
    setSaveSuccess("");
    setSaveError("");
    setInputs((current) => ({
      ...current,
      [fieldName]: searchTerm,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");
    setIsSaving(true);

    try {
      console.log("student payload ", inputs.city);

      const res = await fetch("http://localhost:3000/api/students/me", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city: inputs.city.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Profile update failed");
      }

      setSaveSuccess(data?.message || "Student profile updated succssfully");
    } catch (error) {
      setSaveError(error?.message || "Profile update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Edit details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update you current student details
        </p>
      </div>

      <form noValidate className="space-y-4 text-left" onSubmit={handleSubmit}>
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
            defaultValue={studentProfile?.first_name}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            defaultValue={studentProfile?.last_name}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
            defaultValue={studentProfile?.email}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="relative">
          <label
            htmlFor="city"
            className="block text-sm font-medium text-slate-700"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={inputs.city}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          {/* REALT-TIME DROPDOWN EFFECT */}
          {inputs.city.trim() && cityDropdown.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-auto">
              {cityDropdown.map((cityRow) => (
                <div
                  onClick={() => handleClick(cityRow.city_name, "city")}
                  className="px-3 py-2 cursor-pointer hover:bg-slate-100"
                  key={cityRow.city_id}
                >
                  {cityRow.city_name}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {saveError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 text-center">
            {saveError}
          </div>
        )}

        {saveSuccess && (
          <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 text-center">
            {saveSuccess}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentCrudForm;
