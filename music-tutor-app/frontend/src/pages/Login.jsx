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


// // set up a useEffect to check user login status and redirect if logged in
// useEffect(()=>{

// }, [user, navigate])

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((currentFormData) => ({ ...currentFormData, [name]: value }));
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

      const res = await fetch("http://localhost:3000/api/auth/login", {
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
    <div className="max-w-md mx-auto p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-4">Log in</h1>

      {error && (
        <div className="mb-3 rounded p-2 border border-red-400 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="block mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full border rounded p-2"
            value={form.email}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full border rounded p-2"
            value={form.password}
            onChange={onChange}
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl p-2 border disabled:opacity-60"
        >
          {pending ? "Attempting login" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginUserForm;
