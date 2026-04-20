import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const LoginUserForm = () => {
  // grab user context
  // NOTICE THE {} NOTATION AND NOT [] THAT WOULD BE USED WITH USESTATE DIRECTLY!!
  // The {} is used because UserContext.Provider (in main.jsx) is given user and setUser in an object
  const { user, setUser } = useContext(UserContext); 

  const navigate = useNavigate();
  const [form, setForm] = useState({email: "", password: ""});
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


// // set up a useEffect to check user login status and redirect if logged in
// useEffect(()=>{

// }, [user, navigate])

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((currentFormData) => ({ ...currentFormData, [name]: value }));
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // clear any previous errors from faulty submission data
    setError("");

    // if (form.email.trim() !== form.confirmEmail.trim()) {
    //   setError("Emails do not match");
    //   return;
    // }

    // if (form.password.trim() !== form.confirmPassword.trim()) {
    //   setError("Passwords do not match");
    //   return;
    // }

    setPending(true);

    try {
      const formData = {
        email: form.email.trim(),
        password: form.password.trim(),
      };

      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("DB data is: ", data);

      if (!res.ok) {
        console.log("error from backend ", data);
        throw new Error(data?.message);
      }

      console.log(data.user);
      // context api !!
      setUser(data.user);
      navigate("/");
    } catch (error) {
      setError(error.message || "something went wrong");
    } finally {
      setPending(false);
    }
  };
  return (
    <div className=" max-w-md mx-auto p-6 rounded-2xl shadow">
      <div className="flex flex-col items-center">
        <img src="/player.png" className="h-24 w-24" alt="" />
        <h1 className="text-2xl font-semibold mb-4">Welcome back</h1>
      </div>

      {error && (
        <div className="mb-3 p-1.5 rounded  border border-red-400   text-red-700 text-center">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>

          <label className="block mb-1 text-sm font-medium" htmlFor="email">
            Email
          </label>

          <div className="relative">
            <img src="/mail.png" className="absolute left-2 top-1/2 -translate-y-1/2  h-5 w-5" />
            <input
              id="email"
              name="email"
              type="email"
              className="w-full pl-11 border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

        </div>

        <div>
          <label className="block mb-1 text-sm font-medium" htmlFor="password">
            Password
          </label>

          <div className="relative ">
            <img src="/locked-computer.png" className="absolute h-6 w-6 left-2 top-1/2 -translate-y-1/2 " />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text': 'password'}
              className="pl-11 w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={form.password}
              onChange={onChange}
              required
              maxLength={16}
            />   
            
          <button
            type="button"
            onClick={()=>setShowPassword((current)=> !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6">
              { showPassword ? <img src="/show.png" /> : <img src="/hide.png"/>}
          </button>
          </div>

       

        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl font-medium text-white p-2 border bg-indigo-600 hover:bg-indigo-700 cursor-pointer disabled:opacity-60"
        >
          {pending ? "Attempting login" : "Log in"}
        </button>
      </form>
    </div>
  );
};

export default LoginUserForm;
