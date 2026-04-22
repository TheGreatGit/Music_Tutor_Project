import React from "react";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { ChatContext } from "../context/ChatContext";
import { socket } from "../socket.mjs";
import ChatWindow from "./ChatWindow";

/*
  This component  renders either:
  1) notification modal to notify logged-in users of a new chat message
  2) ChatWindow component where the logged-in user can have a real-time chat with another user.
  It is  placed in Main.jsx so that it can display anywhere in the app

  Socket instance:
  Uses frontend's shared socket instance.
  It listens for the server-emitted 'incoming_chat' event that includes a payload from the server containing fromUserId, fromName, and preview.

  Context:
  -user (object). Supplied via UserContext. 
    If no user is logged in, this component will not render anything. Logging out clears pending notifications and closes ChatWindow component.
    It is a dependency in the usEffect hook that sets up a socket event-listener for 'incoming_chat' event from server which is used to populate the notification modal
    
  -activeChat. Supplied via ChatContext
    Determines whether the ChatWindow component is displayed and it supplies the ChatWindow component with other user Id -needed for its internal chat-fetching logic-
    and other user's display name.

  -setActiveChat. Supplied via ChatContext
    Changes the state associated with active chat either to allow ChatWindow component to be displayed or to be hidden

  Local state:
  - pending, setPending. 
   Used in a useEffect() hook listening for socket's 'incoming_chat' event to hold data for notification modal to display.
   Its data is also put in to activeChat in order to display the ChatWindow component when 'open' button is clicked.
   setPending is used to clear state to prevent notification modal displaying whilst ChatWindow component is rendered or after user logout

  Effects
  useEffect validates the data from servers 'incoming_chat' event and prevents  duplicate notifications when user is chatting with the sender.
  Removes the socket event listener as part of effect cleanup to prevent duplicate listeners.
  It only shows the most recent notification message as it overwrites any previous ones displayed in the notification modal.

  useEffect clears 'pending' state to close the notification modal when the Global ChatWindow component is opened 

  useEffect ensures that , when user logs out, the notification or ChatWindow will disappear
*/  

const ChatNotifier = () => {
  const { user } = useContext(UserContext);
  const { activeChat, setActiveChat } = useContext(ChatContext);

  // set state for controlling the pending chat message notification and for supplying other user data to the ChatWindow component
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (!user) return;

    console.log("Chat notifier running for user:", user);

    // this function detrmines whether to show the pending modal or , if user has opened their chat window, to not show the pending modal
    const handleIncomingChat = (payload) => {
      // not currently using the 'room' variable from the payload but might later
      const fromUserId = Number(payload?.fromUserId);
      const fromName = payload?.fromName ?? "unknown";
      const preview = payload?.preview ?? "";

      if (!Number.isInteger(fromUserId) || fromUserId <= 0) return;

      // prevents notification modal disolaying if currently chatting with other user in window as it ends the method before the pending useState object ha sits state updated as below
      // the activeChat object will only have had data set if the ChatWindow component was opened
      if (activeChat?.otherUserId === fromUserId) return;

      // give message preview info so the preview modal can display it
      setPending({ fromUserId, fromName, preview });
    };

    // listen to event emitted from tiehr user's server's socket.io instance; it will contain the sender's userID, name, and a message preview
    socket.on("incoming_chat", handleIncomingChat); // assigns data for generating the preview modal

    return () => {
      console.log("removing incoming_chat listener");

      socket.off("incoming_chat", handleIncomingChat);
    };
  }, [user, activeChat?.otherUserId]);

  // useEffect to clear 'pending' state to close the notification modal when the Global ChatWindow component is opened 
  useEffect(()=>{
    if(activeChat) setPending(null);
  }, [activeChat]);

  // if user logs out, the notification or ChatWindow will disappear
  useEffect(() => {
    if (!user) {
      setPending(null);
      setActiveChat(null);
    }
  }, [user]);

  if (!user) return null;

  return (
    <>
      {/* the notification modal */}
      {pending && !activeChat && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(360px, 92vw)] rounded-2xl border border-slate-200 bg-white shadow-lg p-4">
          <div className="text-sm font-semibold text-slate-900">
            New message from {pending.fromName}
          </div>

          {pending?.preview && (
            <div className="mt-1 text-sm text-slate-600">{pending.preview}</div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white cursor-pointer"
              onClick={() => {
                //  for opening active chat window and closing the notification window, get sender details and in to activeChat's state object and then set Pending to null
                setActiveChat({
                  otherUserId: pending.fromUserId,
                  otherDisplayName: pending.fromName,
                });
                setPending(null);
              }}
            >
              Open Chat
            </button>

            <button
              type="button"
              className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
              //  reset the pending state variable so as to de-render the pending modal
              onClick={() => setPending(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {/* end of pending modal */}

      {/* GLOBAL chat window modal */}
      {
        // use the ActiveChat state that was set up when you clicked 'open' on the notification modal
        activeChat && (
          <ChatWindow
            otherUserId={activeChat.otherUserId}
            otherDisplayName={activeChat.otherDisplayName}
            onClose={() => setActiveChat(null)}
          />
        )
      }
    </>
  );
};

export default ChatNotifier;
