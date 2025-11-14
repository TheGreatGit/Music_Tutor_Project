import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { tutorRegistrationFormSchema } from "../validationSchemas/tutorRegistrationFormSchema.mjs";

function TutorRegistrationForm() {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
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

  const { register, handleSubmit, formState, control, reset, setError } = form;

  const { errors, isSubmitting, isSubmitSuccessful } = formState;

  const onSubmit = async (formData) => {
    console.log("Submitted:", formData);
    // code for submitting to server
    reset();
  };

  // this function is used to access the state of the errors object just after validation is run
  // if validation  errors exist, handleSubmit will run this onError function and pass to it the formState.errors object
  function onError(formErrors) {
    console.log("Validation errors: ", formErrors);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 md:p-8">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          Tutor registration
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          noValidate
          className=" space-y-4"
        >
          <div>
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              {...register("firstName")}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-red-600">{errors.firstName?.message}</p>
          </div>

          <div>
            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              {...register("lastName")}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-red-600">{errors.lastName?.message}</p>
          </div>

          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>
          </div>

          <div>
            <label htmlFor="confirmEmail">Confirm email</label>
            <input
              type="email"
              id="confirmEmail"
              {...register("confirmEmail")}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-red-600">{errors.confirmEmail?.message}</p>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-red-600">{errors.password?.message}</p>
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword")}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword?.message}</p>
          </div>

          <div>
            <label htmlFor="phoneNumber">Phone number</label>
            <input
              type="text"
              id="phoneNumber"
              {...register("phoneNumber")}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber?.message}</p>
          </div>

          

          <button type="submit" disabled={isSubmitting} className="w-full
           mt-2 inline-flex justify-center items-center rounded-lg 
           bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white 
           shadow-sm hover:bg-indigo-700 active:bg-indigo-800 
           focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed">
            Submit
          </button>
        </form>
      </div>

      <DevTool control={control} />
    </div>
  );
}

export default TutorRegistrationForm;
