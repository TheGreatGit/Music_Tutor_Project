import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {UserContext} from "./context/UserContext.jsx";

// create a function that enfolds App in a context provider but also supplies the user,setUser functions
// Call this function in the rendering function

function Main(){
  // set up useState() hook so you can supply the user,setUser functions to the context Provider
  // this means that any sub-component that imports UserContext and then uses useContext() hook to read UserContext's value will get user,setUser.
  const [user, setUser] = useState(null);

  return (
    // UserContext initially has no value, as per its definition file.
    // Feeding the user,setUSer - (wrapped in an object)- into Provider changes UserContext's value to the object containing those functions
    // These functions are now available to any sub-comnponent that uses useContext(UserContext) hook.
    // Any subconponent that uses this particular setUser will change the user value at this component level
    // this means that the user info being supplied to the context Provider changes which then changes the user info viewable in child components!
    <UserContext.Provider value={{user,setUser}}> 
      <App />
    </UserContext.Provider>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Main />
  </StrictMode>
);
