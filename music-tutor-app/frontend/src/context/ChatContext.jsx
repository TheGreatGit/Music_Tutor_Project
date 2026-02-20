import { createContext } from "react";

export const ChatContext = createContext({
    // creating default values that will be used in absence of a specific context provider above the component that is using ChatContext
    // act as placeholders- especially the setActiveChat as an empty function 
    // The empty setActiveChat function is a safe placeholder in case any components try to access the ChatContext functions to call setActiveChat() but without a ChatContext.Provider above them in the render tree 
    // in practice, I in Main.jsx, I use useState hook to create avtiveChat amd setActiveChat functions and
    // these are passed to the ChatContext provider 
    // so that any of its child components using ChatContext will get the useState functions but with the state shared across them (if they pull the functions from ChatContext)
    activeChat: null,
    setActiveChat: ()=>{},
});