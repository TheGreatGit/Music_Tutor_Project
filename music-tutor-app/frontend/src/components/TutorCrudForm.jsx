import React, { useEffect, useState } from "react";

// OPTED NOT TO USE RHF AT THIS STAGE FOR SIMPLICITY BECAUSE MOST OF THE DATA IN THE PAGE COMES FROM BACKEND ON INITIAL FETCH
// AND THE USER HAS LIMITED MEANS TO AMEND DATA FORMAT SO
const TutorCrudForm = ({ tutorProfile }) => {
  const [dbCities, setDBCities] = useState([]);
  const [dbInstruments, setDBInstruments] = useState([]);

  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [fetchErrors, setFetchErrors] = useState({
    cityError: null,
    instrumentError: null,
  });

  const [inputs, setInputs] = useState({
    city: tutorProfile?.city_name || "",
    instrument: tutorProfile?.instruments?.[0]?.instrument_name || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((current) => ({
      ...current,
      [name]: value,
    }));
  };

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

    const formData = new FormData(e.target);

    // covnert formData in to plain JS object so it can be sent in request body via stringify
    const payload = {
      city: formData.get("city")?.trim() || "",
      instrument: formData.get("instrument")?.trim() || "",
      teachingFormats: formData.getAll("teachingFormats"),
      teachingTypes: formData.getAll("teachingTypes"),
      skillLevels: formData.getAll("skillLevels"),
    };

    console.log("Tutor updated payload", payload);
    try {
      const res = await fetch("http://localhost:3000/api/tutors/me", {
        method: "PATCH",
        credentials: "include",
        headers: {
          // headers needed so express.json() parses the body json data
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("tutor crud response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Failed to update tutor profile");
      }
      // window.alert("Tutor profile updated successfully");
      setSaveSuccess(data?.message || "Tutor profile updated successfully");
    } catch (error) {
      console.log("Tutor crud error", error);
      // window.alert(error.message || "Failed to update tutor prfile");
      setSaveError(error?.message || "Falied to update tutor profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormChange = () => {
    // clear previous save/error state when user starts editing the form again
    setSaveSuccess("");
    setSaveError("");
  };
  // sync effect for city and isntruemnt input from tutor profile- not strictly necessary as this component is only rednered if tutrProfile exists
  // but it is defensive to have it here
  useEffect(() => {
    if (!tutorProfile) return;
    setInputs({
      city: tutorProfile.city_name || "",
      instrument: tutorProfile?.instruments?.[0]?.instrument_name || "",
    });
  }, [tutorProfile]);

  // useEffect() to get DB cities for real-time filter
  useEffect(() => {
    const controller = new AbortController();
    const getCities = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/filters/cities", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch cities");
        }
        const cities = await res.json();
        console.log(cities);
        setDBCities(cities);
        // clear any previous city-fetch errors that might be in the object from previous render
        setFetchErrors((current) => ({
          ...current,
          cityError: null,
        }));
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("city fetch aborted");
        } else {
          console.error("Cities fetch error: ", error);
          setFetchErrors((current) => ({
            ...current,
            cityError: error.message || "City fetch error",
          }));
          setDBCities([]);
        }
      }
    };
    getCities();
    return () => controller.abort();
  }, []);

  // useEffect to get instruments for real-time search filter.
  useEffect(() => {
    const controller = new AbortController();
    const getInstruments = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/filters/instruments",
          { credentials: "include", signal: controller.signal },
        );
        if (!res.ok) {
          throw new Error("Failed to fetch instruments");
        }
        const instruments = await res.json();
        setDBInstruments(instruments);
        // clear any previous INSTRUMENT error that might be there:
        setFetchErrors((current) => ({ ...current, instrumentError: null }));
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("instruments fetch aborted");
        } else {
          console.error("Instruments fetch error: ", error);
          setFetchErrors((current) => ({
            ...current,
            instrumentError: error.message || "Instrument fetch error",
          }));
          setDBInstruments([]);
        }
      }
    };
    getInstruments();
    return () => controller.abort();
  }, []);

  if (!tutorProfile) {
    return <p>No tutor profile</p>;
  }

  // get user's input
  const userInstrumentInput = (inputs.instrument || "").toLowerCase().trim();
  // check if the user input matches any instrument name  in any row of dbInstruments
  const hasExactInstrumentMatch =
    userInstrumentInput &&
    dbInstruments.some(
      (instrumentRow) =>
        (instrumentRow.instrument_name || "").toLowerCase().trim() ===
        userInstrumentInput,
    );
  // now create a dropdown only when there is user input but with no exact match; otherwise, the dropdown is an empty array
  // when there is an exact match(i.e. user clicks on an instrument dropdown option, the instrument dropdown becomes [])
  const instrumentDropdown =
    userInstrumentInput && !hasExactInstrumentMatch
      ? dbInstruments
          .filter((instrumentRow) => {
            const matchInstrument = (
              instrumentRow.instrument_name || ""
            ).toLowerCase();
            return (
              matchInstrument.includes(userInstrumentInput) &&
              matchInstrument !== userInstrumentInput
            );
          })
          .slice(0, 10)
      : [];

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

  const selectedTeachingFormats =
    tutorProfile?.teaching_formats?.map((format) =>
      (format?.teaching_format_name || "").toLowerCase(),
    ) || [];

  const selectedTeachingTypes =
    tutorProfile?.teaching_types?.map((type) =>
      (type?.teaching_type_name || "").toLowerCase(),
    ) || [];

  const selectedTeachingSkillLevels =
    tutorProfile?.skill_levels?.map((level) => level?.skill_level_name || "") ||
    [];

  // console.log("skill levels array", selectedTeachingSkillLevels);

  const hasTeachingFormat = (value) => {
    return selectedTeachingFormats.includes(value.toLowerCase());
  };

  const hasTeachingType = (value) => {
    return selectedTeachingTypes.includes(value.toLowerCase());
  };

  const hasSkillLevel = (value) => {
    return selectedTeachingSkillLevels.includes(value);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">Edit details</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your current tutor details:
        </p>
      </div>

        <form
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          noValidate
          className="space-y-4 text-left"
        >
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
              value={tutorProfile?.first_name || ""}
              readOnly
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
              value={tutorProfile?.last_name || ""}
              readOnly
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
              type="text"
              id="email"
              value={tutorProfile?.email || ""}
              readOnly
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
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

            {fetchErrors.cityError && (
              <p className="mt-1 text-sm text-red-600">
                {fetchErrors.cityError}
              </p>
            )}
          </div>

          <div className="relative">
            <label
              htmlFor="instrument"
              className="block text-sm font-medium text-slate-700"
            >
              Instrument
            </label>
            <input
              type="text"
              id="instrument"
              name="instrument"
              value={inputs.instrument}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {/* real-time dropdown */}
            {inputs.instrument.trim() && instrumentDropdown.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-auto">
                {instrumentDropdown.map((instrumentRow) => (
                  <div
                    onClick={() =>
                      handleClick(instrumentRow.instrument_name, "instrument")
                    }
                    className="px-3 py-2 cursor-pointer hover:bg-slate-100"
                    key={instrumentRow.instrument_id}
                  >
                    {instrumentRow.instrument_name}
                  </div>
                ))}
              </div>
            )}
            {fetchErrors.instrumentError && (
              <p className="mt-1 text-sm text-red-600">
                {fetchErrors.instrumentError}
              </p>
            )}
          </div>

          <div>
            <p className="block text-sm font-medium text-slate-700">
              Teaching format:
            </p>
            <div className="mt-2 rounded-lg border border-slate-300 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="teachingFormats"
                  value="in_person"
                  defaultChecked={hasTeachingFormat("in_person")}
                />
                In person
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="teachingFormats"
                  value="online"
                  defaultChecked={hasTeachingFormat("online")}
                />
                Online
              </label>                
              </div>
            </div>
          </div>

          <div>
            <p className="block text-sm font-medium text-slate-700">
              Teaching type:
            </p>
            <div className="mt-2 rounded-lg border border-slate-300 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="teachingTypes"
                  value="individual"
                  defaultChecked={hasTeachingType("individual")}
                />
                Individual
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="teachingTypes"
                  value="group"
                  defaultChecked={hasTeachingType("group")}
                />
                Group
              </label>                
              </div>
            </div>
          </div>

          <div>
            <p className="block text-sm font-medium text-slate-700">
              Skill levels taught:
            </p>

            <div className="mt-2 rounded-lg border border-slate-300 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="skillLevels"
                  value="Beginner"
                  defaultChecked={hasSkillLevel("Beginner")}
                />
                Beginner
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="skillLevels"
                  value="Intermediate"
                  defaultChecked={hasSkillLevel("Intermediate")}
                />
                Intermediate
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="skillLevels"
                  value="Advanced"
                  defaultChecked={hasSkillLevel("Advanced")}
                />
                Advanced
              </label>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="skillLevels"
                  value="Professional"
                  defaultChecked={hasSkillLevel("Professional")}
                />
                Professional
              </label>                
              </div>
            </div>
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

export default TutorCrudForm;
