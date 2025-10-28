import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const RegisterUserForm = () => {
  const navigate = useNavigate();

  const {user,setUser}= useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

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
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      };

      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log('DB data is: ',data);

      if(!res.ok){
        console.log('error from backend ', data);
        throw new Error(data?.message);
      }

      
      console.log(data.user);
      // context api
      setUser(data.user);
      navigate('/');
    } catch (error) {
        setError(error.message || 'something went wrong');
    }finally{
        setPending(false)
    }
  };
  return (
    <div className="max-w-md mx-auto p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>

      {error && (
        <div className="mb-3 rounded p-2 border border-red-400 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="block mb-1" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            className="w-full border rounded p-2"
            value={form.name}
            onChange={onChange}
            required
            minLength={2}
          />
        </div>

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

        {/* <div>
          <label className="block mb-1" htmlFor="email">
            Confirm email
          </label>
          <input
            id="confirmEmail"
            name="confirmEmail"
            type="email"
            className="w-full border rounded p-2"
            value={form.confirmEmail}
            onChange={onChange}
            required
          />
        </div> */}

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

        {/* <div>
          <label className="block mb-1" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            className="w-full border rounded p-2"
            value={form.confirmPassword}
            onChange={onChange}
            required
            minLength={6}
          />
        </div> */}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl p-2 border disabled:opacity-60"
        >
          {pending ? "Creating account..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterUserForm;
