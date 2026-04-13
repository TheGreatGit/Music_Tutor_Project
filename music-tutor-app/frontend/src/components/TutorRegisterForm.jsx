import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { tutorRegistrationFormSchema } from "../validationSchemas/tutorRegistrationFormSchema.mjs";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function TutorRegistrationForm() {
  // new redirect mechanism for legged-in users
  const { user } = useContext(UserContext);
  if (user) {
    return <Navigate to="/" />;
  }

  // state object for selectively rendering form section i.e. looks like multi-page form
  const [step, setStep] = useState(1);
  // same approach as from FindTutor component: fetch instrument and city info for real-time search dropdowns
  const [dbCities, setDBCities] = useState([]);
  const [dbInstruments, setDBInstruments] = useState([]);

  // error tracking for fetch calls- ERRORS ARE NOT CURRENTLY RNEDERED TO UI
  // these are separate from form errors due to user input problems
  const [fetchErrors, setFetchErrors] = useState({
    instrumentError: null,
    cityError: null,
  });

  // useEffect() to get DB cities for real-time filters
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
        // clear any previous CITY errors that might be in the object from previous render
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

  // set up form input structure, validation modes, and validation schema
  const form = useForm({
    defaultValues: {
      // form data for 1st page of form
      instrument: "",
      teachingFormats: [],
      teachingTypes: [],
      skillLevels: [],

      //form data for 2nd page of form
      firstName: "",
      lastName: "",
      city: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
    mode: "onBlur", // sets validation of fields to occur when user clicks away from the input rather than waiting until submission
    reValidateMode: "onBlur", // after initial validation, sets subsequent revalidation to onblur also.  Form will still revalidate on submit
    // the default setting is mode: "onSubmit" reValidateMode: "onChange"

    resolver: zodResolver(tutorRegistrationFormSchema), // links zod schema to form validation by using zodResolver
  });

  const {
    register,
    handleSubmit,
    formState,
    control,
    trigger,
    watch,
    setValue,
    reset,
    setError,
  } = form;

  // destructure RHF's 'errors' object for form errors
  const { errors, isSubmitting, isSubmitSuccessful } = formState;

  const onSubmit = async (formData) => {
    console.log("Submitted:", formData);
    // code for submitting to server - fetch POST request
    try {
      const res = await fetch("http://localhost:3000/api/register/tutor", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      //reset()
      console.log("server response to form data: ", data);
      if (data?.userId) {
        window.alert("Tutor registered ok ;)");
      }
    } catch (error) {
      console.error("Error submitting form data: ", error);
      //reset();
    }
  };

  // this function is used to access the state of the errors object just after validation is run
  // if validation  errors exist, handleSubmit will run this onError function- instead of the onSubmit() function- and pass to it the formState.errors object
  function onError(formErrors) {
    console.log("Validation errors: ", formErrors);
  }

  // validate form data from step 1 before going to step 2
  const checkStepOne = async () => {
    // the trigger method is a manual way of running the zod validation checks for only the named fields.
    // this is needed because, if the normal validation check ran here, the unset fields in section 2 would trigger errors even though user has not had chance to set them yet.
    const isValid = await trigger([
      "instrument",
      "teachingFormats",
      "teachingTypes",
      "skillLevels",
    ]);
    if (!isValid) return;
    // if the data is ok, change state to trigger render of 2nd part of form.
    setStep(2);
  };

  // function to allow user to navigate baxk to step 1
  const handleBack = () => setStep(1);

  // as RHF is managing inputs via useRef() hook, use RHF's 'watch()' function to access input values.
  const instrumentInput = (watch("instrument") || "").trim(); // dom't convert to lower case here because the form value will be lower case
  const cityInput = (watch("city") || "").trim();

  const userInstrumentInput = instrumentInput.toLowerCase();
  // check if the user input matches any instrument name  in any row of dbInstruments
  const hasExactInstrumentMatch =
    userInstrumentInput &&
    dbInstruments.some(
      (instrumentRow) =>
        (instrumentRow.instrument_name || "").toLowerCase() ===
        userInstrumentInput,
    );

  // now create a dropdown array only when there is user input but with no exact match; otherwise, when there is an exact match, the dropdown is an empty array
  // when there is an exact match(i.e. user clicks on an instrument dropdown option, the instrument dropdown becomes [])
  const instrumentDropdownArray =
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

  const userCityInput = cityInput.toLowerCase();
  const hasExactCityMatch =
    userCityInput &&
    dbCities.some(
      (cityRow) => (cityRow.city_name || "").toLowerCase() === userCityInput,
    );

  const cityDropdownArray =
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

  return (
    <div className=" bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 md:p-8">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          Tutor registration
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          noValidate
          className=" space-y-4"
        >
          {/* step 1 form conditional rendering */}
          {step === 1 && (
            <>
              {/* instrument */}
              <div className="relative">
                <label htmlFor="instrument">Instrument taught</label>
                <input
                  type="text"
                  id="instrument"
                  {...register("instrument")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {instrumentDropdownArray.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg z-10">
                    {instrumentDropdownArray.map((instrumentRow) => (
                      <div
                        key={instrumentRow.instrument_id}
                        // setValue is a function that, in this code, programmatically sets the 'instrument' field value to nstrumentRow.instrument_name on the onClick event.
                        // setValue basically changes the RHF form's state in a way it recognises
                        // ShouldValidate means that the field, once set, is subjected to RHF's validation - as set up earlier
                        // shouldDirty is used to indicate that, after setValue runs, the form field should be treated as 'dirty' i.e. treated as if it were a direct, user-induced change akin to entering the value manually
                        onClick={() =>
                          setValue(
                            "instrument",
                            instrumentRow.instrument_name,
                            {
                              shouldValidate: true,
                              shouldDirty: true,
                            },
                          )
                        }
                        className="px-3 py-1 cursor-pointer hover:bg-slate-100"
                      >
                        {instrumentRow.instrument_name}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.instrument?.message}
                </p>
              </div>
              {/* skill levels */}
              <div>
                <p className="block text-sm font-medium">
                  Skill levels taught (select all that apply)
                </p>
                <div className="mt-1 grid grid-cols-2 gap-2 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Beginner"
                      // the multiple options are all tied to the same section of form input data by using the same formData field name in the register function ;)
                      {...register("skillLevels")}
                    />
                    Beginner
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Intermediate"
                      {...register("skillLevels")}
                    />
                    Intermediate
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Advanced"
                      {...register("skillLevels")}
                    />
                    Advanced
                  </label>

                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="Professional"
                      {...register("skillLevels")}
                    />
                    Professional
                  </label>
                </div>
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.skillLevels?.message}
                </p>
              </div>
              {/* teaching format */}
              <div>
                <p className="block text-sm font-medium">
                  Teaching format (select all that apply)
                </p>
                <div className="mt-1 flex flex-row gap-2 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="online"
                      {...register("teachingFormats")}
                    />{" "}
                    Online
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="in_person"
                      {...register("teachingFormats")}
                    />{" "}
                    In person
                  </label>
                </div>
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.teachingFormats?.message}
                </p>
              </div>
              {/* teaching type */}
              <div>
                <p className="block text-sm font-medium">
                  Teaching type (select all that apply)
                </p>
                <div className="mt-1 flex flex-row gap-2 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="individual"
                      {...register("teachingTypes")}
                      // add the {" "} to create a space between label and text
                    />{" "}
                    Individual lessons
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      value="group"
                      {...register("teachingTypes")}
                    />{" "}
                    Group lessons
                  </label>
                </div>
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.teachingTypes?.message}
                </p>
              </div>
              {/* next/continue button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={checkStepOne}
                  className="w-full mt-2 inline-flex justify-center items-center rounded-lg 
                    bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white 
                    shadow-sm hover:bg-indigo-700 active:bg-indigo-800 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* part 2- personal details */}
          {step === 2 && (
            <>
              {/* first name */}
              <div>
                <label htmlFor="firstName">First name</label>
                <input
                  type="text"
                  id="firstName"
                  {...register("firstName")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.firstName?.message}
                </p>
              </div>
              {/* last name */}
              <div>
                <label htmlFor="lastName">Last name</label>
                <input
                  type="text"
                  id="lastName"
                  {...register("lastName")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.lastName?.message}
                </p>
              </div>
              {/* city */}
              <div className="relative">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  {...register("city")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                {cityDropdownArray.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg z-10">
                    {cityDropdownArray.map((cityRow) => (
                      <div
                        key={cityRow.city_id}
                        onClick={() =>
                          setValue("city", cityRow.city_name, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className="px-3 py-1 cursor-pointer hover:bg-slate-100"
                      >
                        {cityRow.city_name}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.city?.message}
                </p>
              </div>
              {/* email */}
              <div>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.email?.message}
                </p>
              </div>
              {/* confirm email */}
              <div>
                <label htmlFor="confirmEmail">Confirm email</label>
                <input
                  type="email"
                  id="confirmEmail"
                  {...register("confirmEmail")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.confirmEmail?.message}
                </p>
              </div>
              {/* password */}
              <div>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.password?.message}
                </p>
              </div>
              {/* confirm password */}
              <div>
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.confirmPassword?.message}
                </p>
              </div>
              {/* phone number */}
              <div>
                <label htmlFor="phoneNumber">Phone number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-red-600 h-2">
                  {errors.phoneNumber?.message}
                </p>
              </div>
              {/*  back button and submit button */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/3 inline-flex justify-center items-center rounded-lg 
                    border border-slate-300 px-4 py-2.5 text-sm font-medium 
                    text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3
                    inline-flex justify-center items-center rounded-lg 
                    bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white 
                    shadow-sm hover:bg-indigo-700 active:bg-indigo-800 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </form>
      </div>

      <DevTool control={control} />
    </div>
  );
}

export default TutorRegistrationForm;
