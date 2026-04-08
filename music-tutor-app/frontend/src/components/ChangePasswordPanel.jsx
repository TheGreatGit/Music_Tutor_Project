import React, { useState } from "react";

const ChangePasswordPanel = () => {
  // not using react hook form as too complicated for this simple form
  const [inputs, setInputs] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  // set up state  for UI messages
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSaveError("");
    setSaveSuccess("");

    setInputs((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const checkPassword = (currentPassword, newPassword, confirmNewPassword) => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setSaveError("All fields required");
      return false;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setSaveError("Password must be at between 8 and 16 characters");
      return false;
    }

    if (newPassword !== confirmNewPassword) {
      setSaveError("New password and confirm password do not match");
      return false;
    }

    if(newPassword === currentPassword){
      setSaveError("New password must be different from old password");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaveSuccess("");

    const currentPassword = inputs.currentPassword.trim();
    const newPassword = inputs.newPassword.trim();
    const confirmNewPassword = inputs.confirmNewPassword.trim();

    if (!checkPassword(currentPassword, newPassword, confirmNewPassword)) {
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("http://localhost:3000/api/user/changePassword", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      // now get the res.json() befroe throwing error so that the backend error can be accessed
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to change password");
      }

      setSaveSuccess(data?.message || "Password changed successfully");
      setInputs({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      console.log("passowrd change error", error);
      setSaveError(error?.message || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-800">
          Change password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Update your account password
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5 text-left">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-slate-700"
          >
            Current password
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={inputs.currentPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-slate-700"
          >
            New password
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={inputs.newPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm font-medium text-slate-700"
          >
            Confirm new password
          </label>
          <input
            type="password"
            id="confirmNewPassword"
            name="confirmNewPassword"
            value={inputs.confirmNewPassword}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
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

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          <p className="text-sm text-slate-500"></p>
        </div>
      </form>
    </div>
  );
};

export default ChangePasswordPanel;
