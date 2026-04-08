import React from "react";

const About = () => {
  return (
    <div className="w-full bg-slate-100 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-slate-50 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* left column */}
          <div className="text-left">
            <h1 className="text-2xl font-semibold  text-slate-900">
              About music tutor app
              </h1>

            <div className="mt-8 space-y-8 text-slate-700">
              <p className=" mb-4">
                Music tutor app makes it easy to find and book music lessons in one place.
              </p>

              <p className=" mb-4">
                Whether you are a beginner, improver, or an advanced student, the app helps you find and connect with
                tutors who meet your needs.
              </p>

              <p className=" mb-4">
                You can search for tutors by instrument and location, message them directly, and book lessons easily through the app.
              </p>

              <p className="mb-4">
                Our aim is to make finding tuition straightforward and easy to manage for students, parents, and families.
              </p>

              <p className="mb-4">If you are a tutor, you can quickly register and specify your instrument,
                 location, and teaching levels so you can be found by students in your area.</p>

              <p className="mb-4">
                So, don't delay. Start searching for the right tutor and begin your music learning journey today
              </p>


            </div>


          </div>

          {/* right column */}
          <div className="text-left">
            <h2 className="text-xl font-medium text-slate-900">How it works</h2>

            <div className="mt-6 space-y-5">

              <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
                <h3 className="font-semibold text-slate-900">
                  Search for tutors
                </h3>
                <p className="mt-2 text-sm text-slate-700">
                  Browse our registered tutors and find those who match your
                  preferred instrument, skill level, and location
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
                <h3 className="font-semibold text-slate-900">
                  Register an account
                </h3>
                <p className="mt-2 text-sm text-slate-700">
                  Register so you can message tutors, book lessons directly,
                  and manage your details.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
                <h3 className=" font-semibold text-slate-900">
                  Message tutors
                </h3>
                <p className="mt-2 text-sm text-slate-700">
                  Once registered, you can message tutors directly and instantly with no obligation to book lessons.
                  This lets you get to know a tutor so you can be sure they are the right fit before you book with them
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-100 p-4">
                <h3 className=" font-semibold text-slate-900">
                  Book lessons
                </h3>
                <p className="mt-2 text-sm text-slate-700">
                 Once you have found the right tutor, you can book lessons directly in the app with 
                 just a few clicks and you get instant confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
