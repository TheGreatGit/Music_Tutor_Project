import React from "react";

const TutorCard = ({ tutor }) => {
  return (
    // card container div
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition  flex flex-col text-left overflow-hidden ">
        {/* gradient banner at top of card */}
        <div className="relative h-32 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            {/* tutor silhouette placeholder insode of banner */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
                <img src="https://cdn-icons-png.flaticon.com/512/847/847969.png" className="w-full h-full object-cover" />
            </div>
        </div>

      <div className="p-5 flex flex-col flex-1">
          <header className="mb-2">
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">
              {tutor.first_name}
            </h3>
            <p className="mt-0.5 text-slate-600 text-md leading_snug">
              <span className="font-medium">{tutor.city}</span>
              <span className="mx-1 text-slate-400">{tutor.teaching_formats}</span>
            </p>
          </header>
          <div className=" ">
              <p className="text-sm text-slate-700 mb-1">
                <strong>Instruments:</strong> {tutor.instruments}
              </p>
              <p className="text-sm text-slate-700 mb-1">
                <strong>Teaching types:</strong> {tutor.teaching_types}
              </p>
              <p className="text-sm text-slate-700 mb-2">
                <strong>Levels:</strong> {tutor.tutor_skill_levels}
              </p>
          </div>
          <p className="text-sm text-slate-700 mb-3 leading-snug">
           Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laudantium sed voluptate ipsam necessitatibus cupiditate tenetur consectetur illo. Voluptatem, accusamus iste!
          </p>
          {/* card footer */}
          <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
            <div className="text-sm text-slate-500">Message</div>
            <div className="text-sm font-semibold text-slate-900">From 30 GBP/30 min</div>
          </div>
      </div>

    </div>
  );
};

export default TutorCard;
