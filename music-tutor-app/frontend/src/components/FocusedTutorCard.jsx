
const FocusedTutorCard = ({ tutor, draftBookingBundle }) => {
  
  if (!tutor) return <p>No tutor passed in as prop</p>;
  const {draftBooking, updateDraftBooking} = draftBookingBundle;
  
  return (
    // card container div
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition  flex flex-col text-left overflow-hidden ">
      {/* gradient banner at top of card */}
      <div className="relative h-32 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
        {/* tutor silhouette placeholder insode of banner */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-4 border-white bg-white overflow-hidden shadow-sm">
          <img
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* div wrapper for main card content */}
      <div className="p-5 flex flex-col flex-1">

        <header className="mb-2">
          <h3 className="text-lg font-semibold text-slate-900 leading-tight">
            {tutor.first_name}
          </h3>
          <p className="mt-0.5 text-slate-600 text-md leading_snug">
            <span className="font-medium block">{tutor.city_name}</span>
          </p>
        </header>

        <div className=" ">
          <p className="text-sm text-slate-700 mb-1">Select lesson options</p>
          <p className="text-sm text-slate-700 mb-1">
            <strong>Format:</strong> {tutor.teaching_formats.map((teachingFormat)=>{
              const isActive = draftBooking.teaching_format_id === teachingFormat.teaching_format_id;
              return (
                <button
                key={teachingFormat.teaching_format_id}
                onClick={()=>updateDraftBooking({teaching_format_id: teachingFormat.teaching_format_id})}
                className={`mr-1 mb-1 font-bold py-2 px-4 rounded transition text-white ${isActive ? "bg-blue-700 ring-2 ring-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}>
                  {teachingFormat.teaching_format_name}
                </button>
              )
            })}
          </p>

          <p className="text-sm text-slate-700 mb-1">
            <strong>Instrument:</strong> {tutor.instruments.map((instrument)=>{
              const isActive = draftBooking.instrument_id === instrument.instrument_id;
              return (
                <button
                key={instrument.instrument_id}
                onClick={()=>updateDraftBooking({instrument_id: instrument.instrument_id})}
                className={`mr-1 mb-1 font-bold py-2 px-4 rounded transition text-white ${isActive ? "bg-blue-700 ring-2 ring-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}>
                  {instrument.instrument_name}
                </button>
              )
            })}
          </p>

          <p className="text-sm text-slate-700 mb-1">
            <strong>Teaching type:</strong> {tutor.teaching_types.map((teachingType)=>{
              const isActive = draftBooking.teaching_type_id === teachingType.teaching_type_id;
              return (
                <button
                key={teachingType.teaching_type_id}
                onClick={()=>updateDraftBooking({teaching_type_id: teachingType.teaching_type_id})}
                className={`mr-1 mb-1 font-bold py-2 px-4 rounded transition text-white ${isActive ? "bg-blue-700 ring-2 ring-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}>
                  {teachingType.teaching_type_name}
                </button>
              )
            })}
          </p>

          <p className="text-sm text-slate-700 mb-1">
            <strong>Teaching level:</strong> {tutor.skill_levels.map((skillLevel)=>{
              const isActive = draftBooking.skill_level_id === skillLevel.skill_level_id;
              return (
                <button
                key={skillLevel.skill_level_id}
                onClick={()=>updateDraftBooking({skill_level_id: skillLevel.skill_level_id})}
                className={`mr-1 mb-1 font-bold py-2 px-4 rounded transition text-white ${isActive ? "bg-blue-700 ring-2 ring-blue-300" : "bg-blue-500 hover:bg-blue-600"}`}>
                  {skillLevel.skill_level_name}
                </button>
              )
            })}
          </p>
        </div>

        <p className="text-sm text-slate-700 mb-3 leading-snug">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Laudantium
          sed voluptate ipsam necessitatibus cupiditate tenetur consectetur
          illo. Voluptatem, accusamus iste!
        </p>

        {/* card footer */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100">
          <div className="text-sm text-slate-500">Message</div>
          <div className="text-sm font-semibold text-slate-900">
            From 30 GBP/30 min
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusedTutorCard