import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TutorCard from "../components/TutorCard";

const FindTutors = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // arrays to contain pre-fetched instrument and city info from DB
  const [dbCities, setDBCities] = useState([]);
  const [dbInstruments, setDBInstruments] = useState([]);

  // React-router hook that can  be used to sync  search filters with url in browser
  // useSearchParams also 'listens' for client-side url changes
  // it uses JS UrlSearchParam under-the-hood
  const [searchParams, setSearchParams] = useSearchParams();

  // placeholder for real-time search input values:
  // to avoid fetches on each keystroke, fetches will not be run with input values directly
  const [inputs, setInputs] = useState({ instrument: "", city: "" });

  // text-processed placeholder data ready for adding  to DB query
  // this state object is intended to separate input values from directly triggering fetches on each input key-stroke; instead, wait until inoput is finalised and then run fetch
  // the filters are finalised in the useEffect hook with searchPArams as a dependency
  const [filters, setFilters] = useState({ instrument: "", city: "" });

  // useEffect() to get DB cities for real-time filters
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
        // console.log(cities);
        setDBCities(cities);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("city fetch aborted");
        } else {
          console.error("Cities fetch error: ", error);
          setErr(error.message || "error in city fetch");
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

  // a useEffect that keeps the broswer's url and the actual search filters in-sync; a url -> state sync
  // this is acheived by using the srachParams as a dependency and updating the 'filters' state object ()
  useEffect(() => {
    // the searchParams will be set in the commitFilters() function which is called in the keydown event handler function which triggers this useeffect
    // on initial component load (and when clicking on 'find a tutor' link) these params will be empty
    const instrument = (searchParams.get("instrument") || "").trim();
    const city = (searchParams.get("city") || "").trim();

    // using setFilters triggers the main data-fetching useEffect() below
    setFilters({ instrument, city }); // triggers tutor fetching in useeffect below

    // setInputs  so that the rendered input fields are in-sync with what  has been searched for - even "" on reload
    // this is done here so that the inputs boxes will show the same content even if user types query string in to URL directly
    setInputs({ instrument, city });
  }, [searchParams]);



  // useEffect for getting tutors- gets all tutors initially and gets filtered tutors upon search
  useEffect(() => {
    const controller = new AbortController();
    let url = "http://localhost:3000/api/tutors";

    const getTutors = async () => {
      setLoading(true);
      setErr(null);
      try {
        const params = new URLSearchParams(); // used to build url query string (the stuff after '?' in a url)
        // URLSearchPArams() does NOT interfere with the useSearchPArams() hook!
        // URLSearchParams() is used only in this useEffect() hook to build strings to feed in to a fetch
        let instrument = filters.instrument.trim();
        let city = filters.city.trim();
        if (instrument) {
          params.set("instrument", instrument);
        }
        if (city) {
          params.set("city", city);
        }
        console.log("search params are: ", params.toString());

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
         console.log(data);
        setTutors(data);
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("fetch aborted");
        } else {
          setErr(error?.message || "something went wrong");
          setTutors([]); // clear tutor info so that no tutor info is shown by mistake
          console.log(error);
        }
      } finally {
        setLoading(false); // update loading state so the UI does not remain stuck even after results are obtained from DB
      }
    };
    getTutors();
    return () => controller.abort();
  }, [filters.instrument, filters.city]); // dependent on FILTER values  and not input values!

  // handle user-input to the input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((current) => ({ ...current, [name]: value }));
  };

  const commitFilters = () => {
    const newSearchParams = {};
    const instrument = inputs?.instrument.trim();
    const city = inputs?.city.trim();
    if (instrument) {
      newSearchParams.instrument = instrument;
    }
    if (city) {
      newSearchParams.city = city;
    }
    // this is crucial as it triggers the earlier useEffect hook that itself uses the setters for filters and inputs which then triggers the data fetching useEffect
    setSearchParams(newSearchParams);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitFilters();
    }
  };

  // used to update inputs when user clicks on the input dropdown
  const handleClick = (searchTerm, fieldName) => {
    setInputs((current) => ({ ...current, [fieldName]: searchTerm }));
  };

  // code amended to fix issue where ,when typing piano, e.g. classical piano remained as dropdowns
  // add a check to remove a dropdown when the user input (post-click) matches the dropdown values exactly

  // get user's input
  const userInstrumentInput = (inputs.instrument || "").toLowerCase().trim();
  // check if the user input matches any instrument name  in any row of dbInstruments 
  const hasExactInstrumentMatch = userInstrumentInput && dbInstruments.some((instrumentRow)=>(instrumentRow.instrument_name || "").toLowerCase().trim()=== userInstrumentInput)
  
  // now create a dropdown only when there is user input but with no exact match; otherwise, the dropdown is an empty array
  // when there is an exact match(i.e. user clicks on an instrument dropdown option, the instrument dropdown becomes [])
  const instrumentDropdown = userInstrumentInput && !hasExactInstrumentMatch ? dbInstruments.filter((instrumentRow)=>{
    const matchInstrument = (instrumentRow.instrument_name ||"").toLowerCase();
    return (matchInstrument.includes(userInstrumentInput) && matchInstrument!== userInstrumentInput);
  }).slice(0,10) : [];

  const userCityInput = (inputs.city || "").toLowerCase().trim();
  const hasExactCityMatch = userCityInput && dbCities.some((cityRow)=>(cityRow.city_name ||"").toLowerCase() === userCityInput);

  const cityDropdown = userCityInput && !hasExactCityMatch ? dbCities.filter((cityRow)=>{
    const matchCity = (cityRow.city_name || "").toLowerCase();
    return(matchCity.includes(userCityInput) && matchCity !== userCityInput)
  }).slice(0,10):[];

  return (
    <div className="p-6 space-y-6">
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col relative">
  
          <input
            type="text"
            id="instrument"
            name="instrument"
            value={inputs.instrument}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="search instrument"
            className="placeholder:text-slate-400 text-slate-900 rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {/* /* approach adapted from https://www.youtube.com/watch?v=Jd7s7egjt30 */}
          {inputs.instrument.trim() && instrumentDropdown.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-auto">
              {instrumentDropdown.map((instrumentRow) => (
                <div
                  onClick={() =>
                    handleClick(instrumentRow.instrument_name, "instrument")
                  }
                  className="px-3 py-2 cursor-pointer hover:bg-slate-100"
                  key={instrumentRow.instrument_id}
                >
                  {instrumentRow.instrument_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col relative">

          <input
            type="text"
            id="city"
            name="city"
            value={inputs.city}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="search city"
            className="placeholder:text-slate-400 text-slate-900 rounded-2xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {inputs.city.trim() && cityDropdown.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-auto">
              {cityDropdown.map((cityRow) => (
                <div
                  onClick={() => handleClick(cityRow.city_name, "city")}
                  className="px-3 py-2 cursor-pointer hover:bg-slate-100"
                  key={cityRow.city_id}
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
            
            <Link to={`/tutors/${tutor.tutor_id}`} key={tutor.tutor_id}>
               {/* This represents the old TutorCard component but it is wrapped in a link to TutorProfilePage ( via '/tutors/${tutor.tutor_id}'as per frontend router) which contains the new FocusedTutorCard compomnent*/} 
              <TutorCard tutor={tutor}  />
            </Link>
            
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
