import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserContext } from "./context/UserContext.jsx";
import { ChatContext } from "./context/ChatContext.jsx";
import { socket } from "./socket.mjs";
import ChatNotifier from "./components/ChatNotifier.jsx";
import ChatMessagesIcon from "./components/ChatMessagesIcon.jsx";
import MessagesDrawer from "./components/MessagesDrawer.jsx";

// create a function that enfolds App in a context provider but also supplies the user,setUser functions
// Call this function in the rendering function

function Main() {
  // set up useState() hook so you can supply the user,setUser functions to the context Provider
  // this means that any sub-component that imports UserContext and then uses useContext() hook to read UserContext's value will get user,setUser.
  const [user, setUser] = useState(null);

  // set up useState() hook in order to supply setter/getter for global activeChat state via  another bespoke context provider
  const [activeChat, setActiveChat] = useState(null);

  // set up state to control the inbox-messages side-bar visibilty
  const [isInboxOpen, setIsInboxOpen] = useState(false);

  // useEffect to manage socket connection to ensure only logged in users get websocket functionality
  // set to watch user state
  useEffect(() => {
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
  }, [user]);

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
    <UserContext.Provider value={{ user, setUser }}>
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
    </UserContext.Provider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Main />
  </StrictMode>,
);
