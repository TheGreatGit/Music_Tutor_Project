import { StrictMode, useState, useEffect, useContext } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserContext, UserProvider } from "./context/UserContext.jsx";
import { ChatContext } from "./context/ChatContext.jsx";
import { socket } from "./socket.mjs";
import ChatNotifier from "./components/ChatNotifier.jsx";
import ChatMessagesIcon from "./components/ChatMessagesIcon.jsx";
import MessagesDrawer from "./components/MessagesDrawer.jsx";

// create a function that enfolds App in a context provider but also supplies the user,setUser functions
// Call this function in the rendering function

function MainInner() {
  // get user-related state from the new UserProvider component that is , under-the-hood, wrapping everything in USerCOntext.Provider
  const {user, authLoading} = useContext(UserContext);

  // set up useState() hook in order to supply setter/getter for global activeChat state via  another bespoke context provider
  const [activeChat, setActiveChat] = useState(null);

  // set up state to control the inbox-messages side-bar visibilty
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  // useEffect to manage socket connection to ensure only logged in users get websocket functionality
  // set to watch user state
  useEffect(() => {
  /*
     new code that uses new re-auth state variable from UserProvider ( thereforeUserContext.Provider).

     when the app has a full refresh after login, even though JWT is still in browser, 
     user = null when app reloads as all state is reset to default.
     
     to prevent premature user= null app decision-making (e.g. conditional rendering or socket conneection),
     authLoading is inserted here so the app 'waits' to see if user state can be rebuilt in the case
     where a valid JWT is still in browser.
  */

    if(authLoading)return;

    if (user) {
      if (!socket.connected) {
        socket.connect();
      }
      return;
    }

    // disconnect socket if no user logged in (just in case it's still connected somehow)
    if (socket.connected) {
      socket.disconnect();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) {
      setActiveChat(null);
      /* 
        setIsInboxOpen(false) is not stricly necessary as having no user means the ChatMessagesIcon and MessagesDrawer components don't render...
        BUT, theoretically, the isInboxOpen could remain 'true' as the state is saved in this Main component and the
        drawer could pop up again as soon as a user logs in again
      */
      setIsInboxOpen(false);
    }
  }, [user]);

  return (
    // UserContext initially has no value, as per its definition file.
    // Feeding the user,setUSer - (wrapped in an object)- into Provider changes UserContext's value to the object containing those functions
    // These functions are now available to any sub-comnponent that uses useContext(UserContext) hook.
    // Any subconponent that uses this particular setUser will change the user value at this component level
    // this means that the user info being supplied to the context Provider changes which then changes the user info viewable in child components!
  
      <ChatContext.Provider value={{ activeChat, setActiveChat }}>
        <>
          <ChatNotifier />
          <App />
          {user && (
            <>
              <ChatMessagesIcon
                toggleInboxOpen={() => setIsInboxOpen((current) => !current)}
              />
              <MessagesDrawer
                isInboxOpen={isInboxOpen}
                closeInbox={() => setIsInboxOpen(false)}
              />
            </>
          )}
        </>
      </ChatContext.Provider>
  );
}

// create new Main for rendering
function Main(){
  return(
    // UserProvider uses the {children} pattern to act as a wrapper that itself uses UserContext.Provider to supply user state to the app tree
    <UserProvider>
      <MainInner/>
    </UserProvider>
  )
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);
