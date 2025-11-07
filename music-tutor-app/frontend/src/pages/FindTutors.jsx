import React from "react";
import { useEffect, useState } from "react";
import TutorCard from "../components/TutorCard";

const FindTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  // placeholder for real-time search input values:
  const [inputs, setInputs] = useState({instrument:"", city:""});

  // text-processed placeholder data ready for adding  to DB query:
  const [filters, setFilters] = useState({instrument:"", city:""})

  useEffect(() => {
    const controller = new AbortController();

    const getTutors = async () => {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams(); // used to build url query string (the stuff after '?' in a url)
        let instrument = filters.instrument.trim();
        let city = filters.city.trim();
        if(instrument){
          params.set("instrument", instrument )
        }
        if(city){
          params.set('city', city);
        }
        console.log('search params are: ', params.toString());

        let url = "http://localhost:3000/api/tutors";

        if(params.toString()){
          // params.toString() gives you the string representation of serach params in the necessary string format for appending to the url. 
          // the'?' in the URL creates a query string; anything after it should be key-value pairs e.g. instrument=piano
          // fetch will send 'get' request and express handler will see everything after the ? in the req.query property
          url = `http://localhost:3000/api/tutors?${params.toString()}`
        }
        const res = await fetch(url, {
          credentials: "include", // not strictly needed here, but useful for when a user is logged in
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch tutors");
        }
        const data = await res.json();
        console.log(data);
        setTutors(data);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("fetch aborted");
        } else {          
          setErr(error.message || 'something went wrong');
          setTutors([]);
          console.log(error);
        }
      }finally{
        setLoading(false);
      }
    };
    getTutors();
    return () => controller.abort();
  }, [filters.instrument, filters.city]);

  const handleChange = (e) =>{
    const {name, value} = e.target;
    setInputs((current) => ({...current, [name]: value}))
  }
  const commitFilters = () =>{
    setFilters({
      instrument: inputs.instrument,
      city: inputs.city
    });
  }

  const handleKeyDown = (e)=>{
    if(e.key === "Enter"){
      e.preventDefault();
      commitFilters();
    }
  }
  return (
    <div className="p-6 space-y-6">
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col">

          <label htmlFor="instrument" className="text-sm text-slate-600 mb-1">Instrument</label>
          <input type="text" id="instrument" name="instrument" value={inputs.instrument} onChange={handleChange} onKeyDown={handleKeyDown}
          placeholder="search instrument" className="rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
        
        </div>

        <div className="flex flex-col">

          <label htmlFor="city" className="text-sm text-slate-600 mb-1">City</label>
          <input type="text" id="city" name="city" value={inputs.city} onChange={handleChange} onKeyDown={handleKeyDown}
          placeholder="search city" className="rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
        
        </div>
      </div>

      {/* show placeholder message during fetch */}
      {loading && <p>Loading tutor data...</p>}

      {/* show any error messages */}
      {err && <p className="text-red-600">{err}</p>}

      {/* display results */}
      {!loading && tutors.length> 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor)=>(
            <TutorCard tutor={tutor} key={tutor.tutor_id}/>
          ))}
        </div>
      )}

      {/* if no results */}
      {!loading && tutors.length === 0 && !err && (
        <p className="text-slate-500">No tutors found; adjust search and press enter</p>
      )}
    </div>
  );
};

export default FindTutors;
