import React from "react";
/*
 
  InboxItem is a component that will be rendered for every individual student-tutor chat obtained from the database
  it will be rendered in the 'MessagesDrawer' component (that fetches user's chat history, and supplies InboxItem with required data)

  Props
  - message (object) of the form {room_id, room_key, last_message_id, last_message_at, message_content, other_user_id, other_display_name}
  from the API endpoint that the 'MessageDrawer' component fetches from.

  onClick (function)
  passed in as a prop from MessageDrawer component (which obtained it from ChatContext). 
  This function sets the 'activeChat' state to have other_user_id and other_display_name to render the ChatWindow component in the ChatNotifier component that sits in Main.jsx
*/

const InboxItem = ({ message, onClick }) => {
  const preview = (message.message_content ?? "").slice(0, 60);
  const timeLabel = message.last_message_at
    ? new Date(message.last_message_at).toLocaleDateString()
    : "";

  return (
    <button
      type="button"
      className="w-full text-left rounded-2xl border border-slate-200 bg-white p-3 hover:bg-slate-50 transition"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-slate-900">
            {message.other_display_name}
          </h4>
          <p className="mt-1 truncate text-sm text-slate-600">{preview}</p>
        </div>
        <div className="shrink-0 text-xs text-slate-500">{timeLabel}</div>
      </div>
    </button>
  );
};

export default InboxItem;
