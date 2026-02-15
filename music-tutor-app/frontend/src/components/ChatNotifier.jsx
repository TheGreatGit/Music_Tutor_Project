import React from "react";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { ChatContext } from "../context/ChatContext";
import { socket } from "../socket.mjs";
import ChatWindow from "./ChatWindow";

const ChatNotifier = () => {
  const { user } = useContext(UserContext);
  const { activeChat, setActiveChat } = useContext(ChatContext);

  // set state for controlling the pending chat message notification
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (!user) return;

    console.log("Chat notifier running for user:", user);

    const handleIncomingChat = (payload) => {
      // not currently using the 'room' variable but might later
      const fromUserId = Number(payload?.fromUserId);
      const fromName = payload?.fromName ?? "unkown";
      const preview = payload?.preview ?? "";

      if (!Number.isInteger(fromUserId) || fromUserId <= 0) return;

      // prevents prompts if currently chatting with other user in window as it ends the method before the pending useStae object ha sits state updated as below
      if (activeChat?.otherUserId === fromUserId) return;

      // give message preview info so the preview modal can display it
      setPending({ fromUserId, fromName, preview });
    };

    console.log("attaching chat listener");
    socket.on("incoming_chat", handleIncomingChat); // assigns data for generating the preview modal

    return () => {
      console.log("removing incoming_chat listener");

      socket.off("incoming_chat", handleIncomingChat);
    };
  }, [user, activeChat?.otherUserId]);

  // useEffect to clear 'pending' state when the Global ChatWindow component is opened
  useEffect(()=>{
    if(activeChat) setPending(null);
  }, [activeChat]);

  // if tutor/user logs out, the component will disappear
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
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white cursor-pointer"
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
        // note that the ChatWindow does not actually get the initiation message that prompted its opening
        // the ChatWindow component also does not fetch a record of relevant chat messages fropm DB either; it sets its internal message log state as []
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
