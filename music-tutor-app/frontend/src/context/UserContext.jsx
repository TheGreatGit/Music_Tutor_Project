import { createContext, useEffect, useState } from "react";

/*
change from createCOntext() to createCOntext(...code...) so that
the context object, when not being filled in by a provider, has
these default values.
A safety mechanism for the case where a component use USerContext outside of a provider
- shouldn't really happen becuase of how I've wrapped the app in the context provider
*/
export const UserContext = createContext({
  user: null,
  setUser: () => {},
  authLoading: true,
});

/*
    Uses the {children} pattern to become a wrapper for other components.
    It uses the UserCOntext.Provider as a wrapper and supplies relevant user state
    
    After login, if the browser fully refreshes, even though JWT is still in the browser, user is set to null
    because all app state is reset to default/initial values.
    Initial value for user = null - as per the UserProvider below- so this mechanism rebuilds that state from the JWT

    When app reloads and user = null, anything relying on user state e.g. conditional rendering will fulfill the case for user = null
    This would be premature in the case where a valid JWT exists because a user isn't truly logged out- a refresh just reset the user state
    To prevent the premature user=null decision behaviour, the authLoading state is created as a way of saying
    user might be null, but don't act on this just yet as user may be able to be rebuilt from JWT (if there is one in browser).
*/
export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const reAuthUser = async () => {
        console.log('running re-auth from UserProvider useEffect ;)');
        
      try {
        const res = await fetch("http://localhost:3000/api/reauth", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        console.error("Re-auth failed:", error);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    reAuthUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, authLoading }}>
      {children}
    </UserContext.Provider>
  );
}