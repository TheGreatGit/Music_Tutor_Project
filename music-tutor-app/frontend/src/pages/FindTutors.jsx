import React from "react";
import { useEffect, useState } from "react";
import {useSearchParams} from 'react-router-dom';
import TutorCard from "../components/TutorCard";

const FindTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // set up state for data that will be compared to real-time input filters
  const [dbCities, setDBCities] = useState([]);
  const [dbInstruments, setDBInstruments] = useState([]);

  // placeholder for real-time search input values:
  const [inputs, setInputs] = useState({ instrument: "", city: "" });

  // text-processed placeholder data ready for adding  to DB query:
  // separation of input values and SqL search filters is done so you don't have a DB fetch on every input keystroke
  const [filters, setFilters] = useState({ instrument: "", city: "" });

  const [searchParams, setSearchParams] = useSearchParams();

  // useEffect to keep inputs/filters and url in sync on initial load and navigation
  useEffect(()=>{
    const urlInstrument = (searchParams.get('instrument') || "").trim();
    const urlCity = (searchParams.get('city') || "").trim();

    setInputs({instrument: urlInstrument, city: urlCity});
    setFilters({instrument: urlInstrument, city: urlCity})
  },[searchParams])

  // useEffect() to get DB cities  for real-time filters
  useEffect(() => {
    const controller = new AbortController();

    const getCities = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/filters/cities", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch cities");
        }
        const cities = await res.json();
        setDBCities(cities);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("city fetch aborted");
        } else {
          console.error("Cities fetch error: ", error);
          setErr(error.message || "error in city fetch");
          // set DB cities to empty array so no dodgy data is in it
          setDBCities([]);
        }
      }
    };
    getCities();
    return () => controller.abort();
  }, []);

  // useEffect to get instruments for real-time search filter.
  useEffect(() => {
    const controller = new AbortController();

    const getInstruments = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/filters/instruments",
          { credentials: "include", signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch instruments");
        }
        const instruments = await res.json();
        setDBInstruments(instruments);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("instruments fetch aborted");
        } else {
          console.error("Instruments fetch error: ", error);
          setErr(error.message || "error in fetching instruments");
          setDBInstruments([]);
        }
      }
    };
    getInstruments();
    return () => controller.abort();
  }, []);

  // useEffect for getting tutors- gets all tutors initially and gets filtered tutors upon search
  useEffect(() => {
    const controller = new AbortController();

    const getTutors = async () => {
      setLoading(true);
      setErr(null);
      try {
        const params = new URLSearchParams(); // used to build url query string (the stuff after '?' in a url)
        let instrument = filters.instrument.trim(); // null on initial page load
        let city = filters.city.trim(); // null on initial page load
        if (instrument) {
          params.set("instrument", instrument);
        }
        if (city) {
          params.set("city", city);
        }
        console.log("search params are: ", params.toString());

        let url = "http://localhost:3000/api/tutors";

        if (params.toString()) {
          // params.toString() gives you the string representation of serach params in the necessary string format for appending to the url.
          // the'?' in the URL creates a query string; anything after it should be key-value pairs e.g. instrument=piano
          // fetch will send 'get' request and express handler will see everything after the ? in the req.query property
          url = `http://localhost:3000/api/tutors?${params.toString()}`;
        }
        const res = await fetch(url, {
          credentials: "include", // not strictly needed here, but useful for when a user is logged in
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch tutors");
        }
        const data = await res.json();
        // console.log(data);
        setTutors(data);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("fetch aborted");
        } else {
          setErr(error.message || "something went wrong");
          setTutors([]);
          console.log(error);
        }
      } finally {
        // done so the UI will not just display ..loading message permanently
        setLoading(false);
      }
    };
    getTutors();
    return () => controller.abort();
  }, [filters.instrument, filters.city]);

  // updates input value in-sync with user typing; primarily used to match input to instrument or city options from DB
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((current) => ({ ...current, [name]: value })); // don't use trim here as it would prevent user from adding a space
  };

  // sets the serach filters to match the user input; this is run in the handler for the enter-key keydown event
  const commitFilters = () => {
    const newSearchParams = {};
    if(inputs.instrument.trim()){ newSearchParams.instrument = inputs.instrument.trim()};
    if(inputs.city.trim()){newSearchParams.city = inputs.city.trim()};
    setSearchParams(newSearchParams); // due to useEffect() earlier in code, changing searchParams uodates inputs and filters
  };

  // commits the trimmed user input to filters to be used in fetch to DB. Filters are dependecies in the fetchTutor useEffect()
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitFilters();
    }
  };

  // used to set input data when user clicks on any matching dropdown div when presented during real-time input matching
  const handleClick = (searchTerm, fieldName) => {
    setInputs((current) => ({ ...current, [fieldName]: searchTerm }));
  };

  {
    /* approach adapted from https://www.youtube.com/watch?v=Jd7s7egjt30 */
    // to get conditional rendering of the container for matching search-input filters, create these variables that store matches then use it in div later on
  }
  const instrumentMatches = dbInstruments.filter((instrumentRow) => {
      const userInput = (inputs.instrument || "").toLowerCase();
      const matchInstrument = (instrumentRow.instrument_name || "").toLowerCase();
      return (userInput && matchInstrument.includes(userInput) && matchInstrument !== userInput )
    })
    .slice(0, 10);

  const cityMatches = dbCities.filter((cityRow) => {
      const userInput = (inputs.city || "").toLowerCase();
      const matchCity = (cityRow.city_name || "").toLowerCase();
      return (userInput && matchCity.startsWith(userInput) && matchCity !== userInput)
    })
    .slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* set the container of the inputs to relative */}
        <div className="flex flex-col relative">
          <label htmlFor="instrument" className="text-sm text-slate-600 mb-1">
            Instrument
          </label>
          <input
            type="text"
            id="instrument"
            name="instrument"
            value={inputs.instrument}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="search instrument"
            className="placeholder:text-gray-600 rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {/* this only renders if instrument matches exist */}
          {instrumentMatches.length > 0 && (
            <div className="dropdown-rows-container-non-tailwind absolute top-full left-0 mt-1 w-full z-10 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-64 overflow-auto">
              {/* render a dropdown option for every insttuemnt from DB that matches current user input */}
              {instrumentMatches.map((instrumentRow) => (
                // the handleClick() function sets the input field's value to match the insturment name clicked on in the real-time input filtering
                <div key={instrumentRow.instrument_id} onClick={() => handleClick(instrumentRow.instrument_name, "instrument")}
                  className="dropdown-row-non-tailwind px-3 py-2 cursor-pointer hover:bg-indigo-50"
                >
                  {instrumentRow.instrument_name}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* repeat the above but for cities */}
        <div className="flex flex-col relative">
          <label htmlFor="city" className="text-sm text-slate-600 mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={inputs.city}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="search city"
            className=" placeholder:text-gray-600 rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {/* this only renders if city matches exist */}
          {cityMatches.length > 0 && (
            <div className="dropdown-rows-container-non-tailwind absolute top-full left-0 mt-1 w-full z-10 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-64 overflow-auto">
              {cityMatches.map((cityRow) => (
                <div key ={cityRow.city_id} onClick={() =>handleClick(cityRow.city_name, "city")}
                  className="dropdown-row-non-tailwind px-3 py-2 cursor-pointer hover:bg-indigo-50"
                >
                  {cityRow.city_name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* show placeholder message during fetch */}
      {loading && <p>Loading tutor data...</p>}

      {/* show any error messages */}
      {err && <p className="text-red-600">{err}</p>}

      {/* display results */}
      {!loading && tutors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <TutorCard tutor={tutor} key={tutor.tutor_id} />
          ))}
        </div>
      )}

      {/* if no results */}
      {!loading && tutors.length === 0 && !err && (
        <p className="text-slate-500">
          No tutors found; adjust search and press enter
        </p>
      )}
    </div>
  );
};

export default FindTutors;
