import React from "react";
import { useState, useEffect } from "react";
import { socket } from "../socket.mjs";

const ChatWindow = ({ otherUserId, otherDisplayName, onClose }) => {
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

    // send named event TO server
    socket.emit("join_room", { otherUserId });

    const handleJoin = ({ room }) => setRoom(room); // room is used to display room number in component but also to allow client-side to send chst message to server along woth room number so server can route it to the room
    const handleError = (payload) => {setErr(payload?.message || "Chat error");};
    const handleMessage = (message) => {setMessages((current) => [...current, message])};

    // set up relevant listeners for named events FROM server
    socket.on("join_room", handleJoin);
    socket.on("chat_error", handleError);
    socket.on("chat_message", handleMessage);

    // remove listeners on compomnent unmount
    return () => {
      socket.off("join_room", handleJoin);
      socket.off("chat_error", handleError);
      socket.off("chat_message", handleMessage);
    };
  }, [otherUserId]);

  const handleSend = (e)=>{
    e.preventDefault();
    setErr("");

    const message = text.trim();
    if(!message) return;

    if(!room){
        setErr('No room name supplied');
        return;
    }

    socket.emit("chat_message", {room, text:message});
    setText("");
  };
// the div with classname pf 'fixed inset-0 z-50  fills the entire screen when the chatwindow component opens
  return <div className="fixed inset-0 z-50">
    {/*  having this button here, just below the outer div, means that you can click anywhere on the screen and it closes the component.
    This way, you don't have to rely on only the specific 'close' button */}
    <button className="absolute inset-0 bg-black/40" type="button" onClick={onClose}/> 

    <div className="relative mx-auto mt-24 w-[min(720px,92vw)]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">

            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

                <div>
                    <h3 className="text-base font-semibold text-slate-900">
                        Chat with: {otherDisplayName ? ` ${otherDisplayName}`: ""}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                        {room ? `Room: ${room}`: "Joining..."}
                    </p>
                </div>

                <button 
                    type="button"
                    onClick={onClose}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">
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
                    ): (
                        <ul className="space-y-2">
                            {messages.map((message, index)=>(
                                <li key={index} className="text-sm">
                                    <div className="text-xs text-slate-500">
                                        <span className="font-medium text-slate-700">
                                            {message.fromName ?? `User ${message.fromUserId}`}
                                        </span> {" "}
                                        {message.sentAt ? new Date(message.sentAt).toLocaleTimeString(): ""}
                                    </div>
                                    <div className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2">
                                        {message.text}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* input */}
                <form onSubmit={handleSend} className="mt-3 flex gap-2">
                    
                    <input type="text"  value={text} onChange={(e)=> setText(e.target.value)} placeholder="Type message"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"/>

                    <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white cursor-pointer">
                        Send
                    </button>

                </form>
            </div>
        </div>
    </div>
  </div>
  
};

export default ChatWindow;
