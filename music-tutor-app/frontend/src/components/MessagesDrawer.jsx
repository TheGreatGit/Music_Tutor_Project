import React from "react";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";
import { ChatContext } from "../context/ChatContext";
import InboxItem from "./InboxItem";

/*
  MessagesDrawer.jsx
  This component is a slide-in/out drawer that will fetch and show the logged-in user's conversation summaries (chat rooms).
  Mounted in Main.jsx component so it can be opened anywhere in the app.

  Props (supplied from Main.jsx):
  -isInboxOpen (boolean):
    Controls whether the 'Overlay'  section of this component is visible via selective rendering
    and whetehr the 'Drawer' section of the component is visible via assignment of tailwind translate utitlity classes in the 'Drawer' section's div element
    It also enables/prevents database fetching in a useEffect() hook.
     
  -closeInbox (function): 
    A function that uses the setIsInboxOpen() function to set isInboxOpen state to false which de-renders the 'Overlay' section and translates the 'Drawer' section offscreen.
    This function runs if user clicks on the overlay (anywhere on screen outside the drawer section), if user clicks the 'close' button, or if the user clicks on
    the 'InboxItem'component -that this component selectively renders-  representing a student-tutor chat.

  Context
  -user (object). Supplied via UserContext. Holds state associated with current logged-in user. If missing, inbox fetch is skipped

  -setActiveChat (function). Supplied via ChatContext
    Used in the 'onClick' prop of the 'InboxItem' component  to supply the  activeChat state with otherUser/recipient user id and display name data from a given message in the inBoxData array.
    Via use of ChatContext provider, this triggers rendering of the 'ChatWindow' component in the 'ChatNotifier' component that is also set up in Main.jsx
  
  Data in/out 
  -When a user is logged in and the drawer is open, useEffect hook fetches the logged-in user's chat history from "http://localhost:3000/api/chat/messages/inbox" endpoint with logged-in user's credentials.
   The messages are stored in the inBoxData state as an array of conversations.
   Expected response pattern/shape is [{room_id, room_key, last_message_id, last_message_at, message_content, other_user_id, other_display_name}]
   If messages are present, they are rendered via the InboxItem component. Clicking on an InboxItem component calls setActiveChat() and closeInbox();
   
  UseEffects/side effects
  useEffect hook fetches chat history when [user] or [isInboxOpen] state change but does not fetch if [user] is logged out or if [isInboxOpen] is false. 
  Uses AbortController to cancel in-flight fetches if the overlay or drawer unmount via closeInbox().

  Potential UI states
  -'Loading...' when a fetch is in-flight but data not returned yet
  - err- shows error message 
  - 'No conversations yet' if the fetch returns an empty array.
*/

const MessagesDrawer = ({ isInboxOpen, closeInbox }) => {
  const { user } = useContext(UserContext);
  const { setActiveChat } = useContext(ChatContext);

  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user || !isInboxOpen) return;
    const controller = new AbortController();

    const loadInbox = async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(
          "http://localhost:3000/api/chat/messages/inbox",
          { credentials: "include", signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error("Error when fetching inbox history");
        }

        const data = await res.json();
        setInboxData(data.inboxData ?? []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setErr(error.message || "Failed to load inbox");
        }
      } finally {
        setLoading(false);
      }
    };
    loadInbox();
    return () => controller.abort();
  }, [user, isInboxOpen]);

  return (
    <>
      {/* overlay  
        give it 'fixed' and 'inset-0' so it covers the whole viewport and give it the 'closeInbox'
        for its onCLick property so clicking on it closes the inbox drawer
        I have set the z-index to 40 (lower than the drawers z-index of 50) 
        so that this does not sit over the drawer and close the drawer when user thinks they're clicking on the drawer 
        but are clicking the overlay
       */}
      {isInboxOpen && (
        <div onClick={closeInbox} className="fixed inset-0 z-40 bg-black/30" />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[min(420px,92vw)] border border-slate-200 bg-white shadow-xl
      transform transition-transform duration-300 ease-in-out
      ${isInboxOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Messages</h2>
            <p className="text-xs text-slate-500">Your recent conversations</p>
          </div>
          <button
            type="button"
            onClick={closeInbox}
            className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="h-[calc(100%-56px)] overflow-auto p-3">
          {loading && <p className="text-sm text-slate-600">Loading...</p>}
          {err && <p className="text-sm text-rose-700">{err}</p>}

          {!loading && !err && inboxData.length === 0 && (
            <p className="text-sm text-slate-600">No conversations yet</p>
          )}

          <div className="space-y-2">
            {inboxData.map((message) => (
              <InboxItem
                key={message.room_id}
                message={message}
                onClick={() => {
                  setActiveChat({
                    otherUserId: message.other_user_id,
                    otherDisplayName: message.other_display_name,
                  });
                  closeInbox();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagesDrawer;
