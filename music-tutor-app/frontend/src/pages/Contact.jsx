import React, { useState } from "react";

const Contact = () => {
  const [confirmMessage, setConfirmMessage] = useState("");

  const [inputs, setFormInputs] = useState({
    name: "",
    email: "",
    phone: "",
    enquiryReason: "",
    message: "",
  });

  const clearForm = () => {
    setFormInputs({
      name: "",
      email: "",
      phone: "",
      enquiryReason: "",
      message: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormInputs((current) => ({
      ...current,
      [name]: value,
    }));
    setConfirmMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("contact form details ", inputs);
    setConfirmMessage("Enquiry submitted");
    clearForm();
  };

  return (
    <div className="w-full bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-slate-50 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* left column */}
          <div className="text-left">
            <h1 className="text-2xl font-semibold uppercase text-slate-900 ">
              Contact us
            </h1>

            <div className="mt-8 space-y-8 text-base text-slate-700">
              <p>Get in contact with us by filling in the form</p>

              <p>
                If you are contacting us about a booking already made, please be
                aware that refunds are not available for lessons cancelled
                within 24 hours of start time.
              </p>
              <p>
                For booking enquiries, please include the tutor's name and the
                student's name.
              </p>
            </div>

            {/* address deataisls maybe? */}
            <div className="mt-12 space-y-2 text-slate-800">
              <h2 className="text-xl font-medium">Music tutor app</h2>
              <p className="text-base">100 Music tutor street</p>
              <p className="text-base">Music City</p>
              <p className="text-base">Music country</p>
              <p className="text-base">BT12 1AB</p>
            </div>
          </div>

          {/* right column */}
          <div>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5 text-left"
            >
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-800"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={inputs.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-800"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={inputs.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-800"
                >
                  Phone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={inputs.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label
                  htmlFor="enquiryReason"
                  className="block text-sm font-medium text-slate-800"
                >
                  Reason for enquiry
                </label>
                <select
                  id="enquiryReason"
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  name="enquiryReason"
                  value={inputs.enquiryReason}
                  onChange={handleChange}
                >
                  <option value="">Select an option</option>
                  <option value="general enquiry">General enquiry</option>
                  <option value="booking question">Booking question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-800"
                >
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  value={inputs.message}
                  onChange={handleChange}
                  rows={6}
                  className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>
              {confirmMessage && (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 text-center">
                  {confirmMessage}
                </div>
              )}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  Send message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
