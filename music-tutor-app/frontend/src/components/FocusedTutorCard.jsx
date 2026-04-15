const FocusedTutorCard = ({tutor,draftBookingBundle,canMessage,onMessageClick,}) => {

  if (!tutor) return <p>No tutor passed in as prop</p>;

  const { draftBooking, updateDraftBooking } = draftBookingBundle;
  const buttonStyling = (isActive)=> `mr-2 mb-2 inline-flex items-center rounded-md px-4 py-2 font-medium transition-all duration-200 
  ${isActive ? " bg-slate-500 text-white shadow-sm " : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`
  
  return (
    // card container div
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition  flex flex-col text-left overflow-hidden ">
      {/* gradient banner at top of card */}
      <div className="relative h-36 bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
        {/* tutor silhouette placeholder insode of banner */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
          <img
            src={`/${tutor.first_name.toLowerCase()}_avatar.webp`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* div wrapper for main card content */}
      <div className="p-6  flex flex-col flex-1">
        <header className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 leading-tight">
            {tutor.first_name}
          </h3>
          <p className="mt-0.5 text-slate-600 text-base leading-snug">
            <span className="font-medium block">{tutor.city_name}</span>
          </p>
        </header>

        <div className=" space-y-2">
          <p className="text-sm text-slate-700 mb-1">
            <strong>Format:</strong>{" "}
            {tutor.teaching_formats.map((teachingFormat) => {
              const isActive =
                draftBooking.teaching_format_id === teachingFormat.teaching_format_id;
              return (
                <button
                  key={teachingFormat.teaching_format_id}
                  onClick={() =>
                    updateDraftBooking({
                      teaching_format_id: isActive ? null :teachingFormat.teaching_format_id,
                    })
                  }
                   className={buttonStyling(isActive)}
                >
                  {teachingFormat.teaching_format_name}
                </button>
              );
            })}
          </p>

          <p className="text-sm text-slate-700 mb-1">
            <strong>Instrument:</strong>{" "}
            {tutor.instruments.map((instrument) => {
              const isActive =
                draftBooking.instrument_id === instrument.instrument_id;
              return (
                <button
                  key={instrument.instrument_id}
                  onClick={() =>
                    updateDraftBooking({
                      instrument_id: isActive ? null :instrument.instrument_id,
                    })
                  }
                   className={buttonStyling(isActive)}
                >
                  {instrument.instrument_name}
                </button>
              );
            })}
          </p>

          <p className="text-sm text-slate-700 mb-1">
            <strong>Teaching type:</strong>{" "}
            {tutor.teaching_types.map((teachingType) => {
              const isActive =
                draftBooking.teaching_type_id === teachingType.teaching_type_id;
              return (
                <button
                  key={teachingType.teaching_type_id}
                  onClick={() =>
                    updateDraftBooking({
                      teaching_type_id: isActive ? null :teachingType.teaching_type_id,
                    })
                  }
                   className={buttonStyling(isActive)}
                >
                  {teachingType.teaching_type_name}
                </button>
              );
            })}
          </p>

          <p className="text-sm text-slate-700 mb-1">
            <strong>Teaching level:</strong>{" "}
            {tutor.skill_levels.map((skillLevel) => {
              const isActive =
                draftBooking.skill_level_id === skillLevel.skill_level_id;
              return (
                <button
                  key={skillLevel.skill_level_id}
                  onClick={() =>
                    updateDraftBooking({
                      skill_level_id: isActive ? null: skillLevel.skill_level_id,
                    })
                  }
                   className={buttonStyling(isActive)}
                >
                  {skillLevel.skill_level_name}
                </button>
              );
            })}
          </p>
        </div>

        <p className="mt-4 mb-2 text-base  text-slate-600 leading-[1.75]">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laudantium
          sed voluptate ipsam necessitatibus cupiditate tenetur consectetur
          illo. Voluptatem, accusamus iste!
        </p>

        {/* card footer */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          {/* onMessageClick, defined in TutorProfilePage, updates the activeChat conetxt status to have recipients display name and user id */}
            <button
              onClick={onMessageClick}
              disabled={!canMessage}
              className={`bg-indigo-50 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition 
                ${canMessage ? " text-indigo-700 hover:bg-indigo-100 cursor-pointer " : " text-slate-400 cursor-not-allowed"}`}
            >
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
            </svg>
              Message tutor
            </button>

          <div className="text-right">
            <p className=" font-medium uppercase tracking-wide text-slate-400">From</p>
            <p className=" font-semibold text-slate-900">30 GBP /30 min</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusedTutorCard;
