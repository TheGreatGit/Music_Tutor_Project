import React from "react";
import { useState, useEffect } from "react";
import { socket } from "../socket.mjs";
import { useContext } from "react";
import {UserContext} from "../context/UserContext";

/*
  This component displays a modal chat window for a logged-in user to exhange real-time messages with another user
  This is accomplished by joining a server-side 'room' via the frontend's socket.io instance.

  It fetches and displays 
  1)historical messages via http fetch.
  2)real-time messages via websocket.

  Context:
  -user(object)- supplied via UserContext. Used to populate myUserId which is used to determine ownership and UI appearance of chat messages in component

  Props:
  -otherUserId (number): Id of the intended recipient of the logged-in user's messages. Used to create/join a chatroom on the server and to fetch chat history
  -otherDisplayName(string): Name of chat recipient- used for UI.
  -onClose() (function): sets activeChat to null and closes the ChatWindow modal. Funcion runs on clicking the overlay or the Close button

  Local state:
  -room (string): Created on server from combination of both users' user ids. The value is stored in state and used when sending messages to server.
  -text (string): react-contolled input state variable for user-created chat message and, in the handleSend() function, is sent to server via the socket.emit('chat_message, text:message) event
  -messages (array): Log of historic and real-time chat messages used for rendering messages in the component
  - err(string): used to display errors in UI.

  Socket:
  Emits:
  'join_room' event to server, supplying it with intended recipient's user id, so the server can create/join a room for both users
  'chat_message' event that sends a message -and its intended room-to the server.

  Listens for:
  'join_room' event- a reply from the server to this component's 'join_room' event. It takes the server-supplied room number and stores it in state for sending messages
  'chat_message'- listens for new chat messages from ths server and adds them to the end of the messages array.
  'chat_error'- displays errors in UI.

  Effects:
  -useEffect sets up the socket listeners, emits the 'join_room' event, fetches chat history and removes duplicate messages, removes listeners and aborts any fetches on cleanup.
  Its dependency is otherUserId so the hook runs again if otherUserId changes.
*/


const ChatWindow = ({ otherUserId, otherDisplayName, onClose }) => {
  const { user } = useContext(UserContext);
  const myUserId = user?.user_id;
  const [room, setRoom] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!otherUserId) return;

    // reset info if/when otherUserId changes
    setRoom(null);
    setMessages([]);
    setErr("");

    const controller = new AbortController();

    const handleJoin = ({ room }) => setRoom(room); // room is used to display room number in component but also to allow client-side to send chst message to server along woth room number so server can route it to the room
    const handleError = (payload) => {setErr(payload?.message || "Chat error");
    };
    // this 'message' is the 'out' object sent by the server
    const handleMessage = (message) => {setMessages((current) => [...current, message]);
    };

    // set up relevant listeners for named events FROM server
    socket.on("join_room", handleJoin);
    socket.on("chat_error", handleError);
    socket.on("chat_message", handleMessage);

    // ask server to create a room with user id and recipient id and then send to room info back to client
    socket.emit("join_room", { otherUserId });

    // fetch room chat history
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/chat/messages/${otherUserId}`,
          { credentials: "include", signal: controller.signal },
        );
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json(); // format of {room, otherUserId, messages}
        const chatHistory = data?.messages;
        //console.log('chat history is:',chatHistory);

        // this is crucial as live emssages may have arrived to component via socket whilst fetch is still running
        // need to ensure that any messages sent after fetch starts but before it ends are not erased by setting messages array to just the DB response
        setMessages((current) => {
          const fullHistory = [...chatHistory, ...current];
          // as a Set has no duplicates, this is used as a proxy to store unique message ids from full chat history
          const seen = new Set();

          const noDuplicates = fullHistory.filter((message) => {
            const id = message.messageId;
            if (seen.has(id)) return false; // this filters out duplicates
            seen.add(id);
            return true;
          });
          // sort by ascending message id
          noDuplicates.sort((a, b) => a.messageId - b.messageId);
          // return noDuplicates so that state is updated
          return noDuplicates;
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          setErr(error.message || "failed to load messages");
        }
      }
    };
    fetchHistory();
    // remove listeners on compomnent unmount
    return () => {
      controller.abort();
      socket.off("join_room", handleJoin);
      socket.off("chat_error", handleError);
      socket.off("chat_message", handleMessage);
    };
  }, [otherUserId]);

  const handleSend = (e) => {
    e.preventDefault();
    setErr("");

    const message = text.trim();
    if (!message) return;

    if (!room) {
      setErr("No room name supplied");
      return;
    }

    socket.emit("chat_message", { room, text: message });
    setText("");
  };

  // the div with classname pf 'fixed inset-0 z-50  fills the entire screen when the chatwindow component opens
  return (
    <div className="fixed inset-0 z-50">
      {/*  having this button here, just below the outer div/overlay, means that you can click anywhere on the screen and it closes the component.
    This way, you don't have to rely on only the specific 'close' button */}
      <button
        className="absolute inset-0 bg-black/40"
        type="button"
        onClick={onClose}
      />

      <div className="relative mx-auto mt-24 w-[min(720px,92vw)]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Chat with: {otherDisplayName ? ` ${otherDisplayName}` : ""}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {room ? `Room: ${room}` : "Joining..."}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
          </div>

          {/* display errors */}
          {err && (
            <div className="px-5 pt-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                {err}
              </div>
            </div>
          )}

          {/* body */}
          <div className="px-5 py-4">
            <div className="h-[45vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500">No messages yet</p>
              ) : (
                <ul className="space-y-2">
                    {messages.map((message)=>{
                        const isMine = message.fromUserId === myUserId;

                        return (
                            <li key={message.messageId} className="text-sm">
                                <div className={`flex ${isMine ? "justify-end" : "justify_start"}`}>
                                    <div className="max-w-[75%]">
                                        <div className={`rounded-2xl px-3 py-2 shadow-sm ${isMine ? "bg-emerald-600 text-white rounded-br-sm"
                                            :"bg-blue-600 text-white rounded-bl-sm"}`}>
                                                {message.text}
                                        </div>

                                        <div className={`mt-1 text-[11px] text-slate-500 ${isMine ? "text-right": "text-left"}`}>
                                            {message.sentAt ? new Date(message.sentAt).toLocaleTimeString() : ""}
                                        </div>

                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
              )}
            </div>

            {/* input */}
            <form onSubmit={handleSend} className="mt-3 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type message"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />

              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
