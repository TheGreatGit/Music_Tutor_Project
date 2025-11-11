import React from "react";
import { useEffect, useState } from "react";
import {useSearchParams} from 'react-router-dom'
import TutorCard from "../components/TutorCard";

const FindTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // hook that can  be used to sync  search filters with url in browser
  // useSearchParams also 'listens' for client-side url changes
  const [searchParams, setSearchParams] = useSearchParams()

  // placeholder for real-time search input values:
  // to avoid fetches on each keystroke, fetches will not be run with input values directly
  const [inputs, setInputs] = useState({instrument:"", city:""});

  // text-processed placeholder data ready for adding  to DB query
  // this state object is intended to separate input values from directly triggering fetches on each input key-stroke; instead, wait until inoput is finalised and then run fetch
  // the filters are finalised in the useEffect hook with searchPArams as a dependency
  const [filters, setFilters] = useState({instrument:"", city:""})

  // a useEffect that keeps the broswer's url and the actual search filters in-sync; a url -> state sync
  // this is acheived by using the srachParams as a dependency and updating the filters ()
  useEffect(()=>{
    // the searchParams will be set in the commitFilters() function which is called in the keydown event handler function
    // on initial component load (and when clicking on 'find a tutor' link) these params will be empty
    const instrument = (searchParams.get('instrument') || "").trim();
    const city = (searchParams.get('city') || "").trim();

    // using setFilters triggers the main data-fetching useEffect() below
    setFilters({instrument, city});
    setInputs({instrument, city}) // setInputs only so that the input fields are in-sync with what  has been searched for - even "" on reload
  }, [searchParams])

  // main useEffect hook for getting tutor details with or without filters
  useEffect(() => {
    const controller = new AbortController();
    let url = "http://localhost:3000/api/tutors";

    const getTutors = async () => {
      setLoading(true);
      setErr("");
      try {
        const params = new URLSearchParams(); // used to build url query string (the stuff after '?' in a url)
        // URLSearchPArams() does NOT interfere with the useSearchPArams() hook!
        // URLSearchParams() is used only in this useEffect() hook to build strings to feed in to a fetch
        let instrument = filters.instrument.trim();
        let city = filters.city.trim();
        if(instrument){
          params.set("instrument", instrument )
        }
        if(city){
          params.set('city', city);
        }
        console.log('search params are: ', params.toString());

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
          setErr(error?.message || 'something went wrong');
          setTutors([]); // clear tutor info so that no tutor info is shown by mistake
          console.log(error);
        }
      }finally{
        setLoading(false); // update loading state so the UI does not remain stuck even after results are obtained from DB
      }
    };
    getTutors();
    return () => controller.abort();
  }, [filters.instrument, filters.city]); // dependent on FILTER values  and not input values!

  // handle user-input to the input fields
  const handleChange = (e) =>{
    const {name, value} = e.target;
    setInputs((current) => ({...current, [name]: value}))
  }

  const commitFilters = () =>{
    const newSearchParams = {};
    const instrument = inputs?.instrument.trim();
    const city = inputs?.city.trim();
    if (instrument){ newSearchParams.instrument= instrument};
    if(city){newSearchParams.city = city};
    // this is crucial as it triggers the earlier useEffect hook that itself uses the setters for filters and inputs which then triggers the data fetching useEffect
    setSearchParams(newSearchParams);
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
          placeholder="search instrument" className="placeholder:text-slate-400 text-slate-900 rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
        
        </div>

        <div className="flex flex-col">

          <label htmlFor="city" className="text-sm text-slate-600 mb-1">City</label>
          <input type="text" id="city" name="city" value={inputs.city} onChange={handleChange} onKeyDown={handleKeyDown}
          placeholder="search city" className="placeholder:text-slate-400 text-slate-900 rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
        
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
