
const TutorCard = ({ tutor }) => {
  if (!tutor) return <p>No tutor passed in as prop</p>;
  console.log(`avatar source ${tutor.first_name.toLowerCase()}_avatar.webp `);
  
  return (
    // card container div
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition  flex flex-col text-left overflow-hidden ">
      {/* gradient banner at top of card */}
      <div className="relative h-32 bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">
        {/* tutor silhouette placeholder insode of banner */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-30 h-30 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
          <img
            src={`/${tutor.first_name.toLowerCase()}_${tutor.last_name.toLowerCase()}.webp`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* div wrapper for main card content */}
      <div className="p-5 flex flex-col flex-1 ">
        <header className="mb-2">
          <h3 className="text-lg font-semibold text-slate-900 leading-tight">
            {tutor.first_name}
          </h3>
          <p className="mt-0.5 text-slate-600 text-md leading-snug">
            <span className="font-medium block">{tutor.city_name}</span>
            <span className="text-slate-400">{tutor.teaching_formats}</span>
          </p>
        </header>
        <div className=" ">
          <p className="text-sm text-slate-700 mb-1">
            <strong>Instruments:</strong> {tutor.instruments}
          </p>
          <p className="text-sm text-slate-700 mb-1">
            <strong>Teaching types:</strong> {tutor.teaching_types}
          </p>
          <p className="text-sm text-slate-700 mb-2 wrap-anywhere">
            <strong>Levels:</strong> {tutor.skill_levels}
          </p>
        </div>
        <p className="text-sm text-slate-700 mb-3 leading-snug">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laudantium
          sed voluptate ipsam necessitatibus cupiditate tenetur consectetur
          illo. Voluptatem, accusamus iste!
        </p>
        {/* card footer */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100 
        max-[440px]:flex-col max-[440px]:items-center max-[440px]:justify-start max-[440px]:gap-2">
          <div className="text-sm text-slate-500 flex gap-1 items-center">
                  <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>Message</div>
          <div className="text-sm font-semibold text-slate-900">
            From 30 GBP/30 min
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
