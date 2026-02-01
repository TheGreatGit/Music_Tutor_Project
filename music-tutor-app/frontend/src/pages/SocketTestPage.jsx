import React from "react";
import { socket } from "../socket.mjs";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "../context/UserContext";

const SocketTestPage = () => {
  const { user } = useContext(UserContext);
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);

  // socket event listener set up  and torn down in a controlled fashion via a useEffect hook
  // if the addition of event listeners was done outside the useEffect, a new event listener would be added each time a re-render occurred and would cause problems.

  useEffect(() => {
    const handleServerMessage = (payload) => {
      // payload shape is {ok:true, message: 'message recevied, bro}
      const message =
        payload && payload?.message ? payload.message : "(no message)";
      setLog((prev) => [`Server: ${message}`, ...prev]);
    };

    socket.on("server_message", handleServerMessage);

    return () => {
      // remove listener
      socket.off("server_message", handleServerMessage);
    };
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();
    if (!user) return;

    const text = input.trim();
    if (!text) return;

    setLog((prev) => [`You: ${text}`, ...prev]);
    socket.emit("chat_message", { text });
    setInput("");
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Socket Test</h1>

        {!user && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Log in to send messages.
            </div>
        )}

        <form onSubmit={sendMessage} className="mt-5 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <button
            type="submit"
            disabled={!user}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send
          </button>
        </form>

        <div className="mt-5">
          <h2 className="text-sm font-semibold text-slate-800">Log</h2>
          <div className="mt-2 h-64 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
            {log.length === 0 ? (
              <p className="text-sm text-slate-500">No messages yet.</p>
            ) : (
              <ul className="space-y-2">
                {log.map((line, idx) => (
                  <li key={idx} className="text-sm text-slate-800">
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocketTestPage;
