import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentRegistrationFormSchema } from "../validationSchemas/studentRegistrationFormSchema.mjs";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const StudentRegisterForm = () => {
  // new redirect mechanism for legged-in users
  const { user } = useContext(UserContext);
  if (user) {
    return <Navigate to="/" />;
  }

  //fetch city info for real-time search dropdowns
  const [dbCities, setDBCities] = useState([]);

  // error tracking for fetch calls- ERRORS ARE NOT CURRENTLY RNEDERED TO UI
  // these are separate from form errors due to user input problems
  const [fetchErrors, setFetchErrors] = useState({ cityError: null });

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

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      city: "",
      email: "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
    mode: "onBlur", // sets validation of fields to occur onBlur rather than waiting until submission
    reValidateMode: "onBlur", // after initial validation, sets subsequent revalidation to onblur also.  Form will still revalidate on submit
    // the default setting is mode: "onSubmit" reValidateMode: "onChange"

    //resolver: zodResolver(studentRegistrationFormSchema), // links zod schema to form validation by using zodResolver
  });

  const {
    register,
    handleSubmit,
    formState,
    control,
    watch,
    setValue,
    reset,
    setError,
  } = form;

  // destructure RHF's 'errors' object for form validation errors
  const { errors, isSubmitting, isSubmitSuccessful } = formState;

  const onSubmit = async (formData) => {
    console.log("Submitted:", formData);
    // code for submitting to server - fetch POST request
    try {
      const res = await fetch("http://localhost:3000/api/register/student", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      // NEW CODE TO GET BACKEND ERROR INFO
      if (!res.ok) {
        // backend sends array called errors attached to data.
        if (Array.isArray(data?.errors)) {
          data.errors.forEach((error) => {
            // each error in the errors array is an object with 2 properties: a path property that has the field name in an array,
            // and has a message property with error message
            const field = error?.path?.[0];
            if (field) {
              setError(field, {
                message: error?.message || "unoknown field error",
              });
            }
          });
        }
        return;
      }
      
      if (data?.userId) {
        window.alert("Student registered ok ;)");
      }
      //reset()
      console.log("server response to form data: ", data);
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

  // as RHF is managing inputs via useRef() hook, use RHF's 'watch()' function to access input values.
  const cityInput = (watch("city") || "").trim();
  const userCityInput = cityInput.toLowerCase();

  const hasExactCityMatch =
    userCityInput &&
    dbCities.some(
      (cityRow) => (cityRow.city_name || "").toLowerCase() === userCityInput,
    );

  // crucial bug fix is to use the !hasExactMatch; otherwise, when clicking on piano, classical piano and jazz piano would still show in a dropdown
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

  return (
    <div className=" bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 md:p-8">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          Student registration
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          noValidate
          className=" space-y-4"
        >
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
              {cityDropdown.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg z-10">
                  {cityDropdown.map((cityRow) => (
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
            <div className="flex gap-2 pt-2 justify-center">
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
        </form>
      </div>

      <DevTool control={control} />
    </div>
  );
};

export default StudentRegisterForm;
