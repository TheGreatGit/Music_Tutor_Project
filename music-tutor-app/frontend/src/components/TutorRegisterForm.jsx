import { useState } from "react";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { tutorRegistrationFormSchema } from "../validationSchemas/tutorRegistrationFormSchema.mjs";

function TutorRegistrationForm() {
  const [step, setStep] = useState(1);

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
    mode: "onBlur", // sets validation of fields to occur onBlur rather than waiting until submission
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
    reset,
    setError,
  } = form;

  const { errors, isSubmitting, isSubmitSuccessful } = formState;

  const onSubmit = async (formData) => {
    console.log("Submitted:", formData);
    // code for submitting to server
    // reset();
  };

  // this function is used to access the state of the errors object just after validation is run
  // if validation  errors exist, handleSubmit will run this onError function and pass to it the formState.errors object
  function onError(formErrors) {
    console.log("Validation errors: ", formErrors);
  }

  // validate form data from step 1 before going to step 2
  const checkStepOne = async () => {
    // the trigger methos is a manual way of running the zod validation checks for only the named fields.
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
              <div>
                <label htmlFor="instrument">Instrument taught</label>
                <input
                  type="text"
                  id="instrument"
                  {...register("instrument")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
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
              <div>
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  {...register("city")}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
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
