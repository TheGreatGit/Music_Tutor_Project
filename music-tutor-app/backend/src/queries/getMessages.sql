SELECT
-- alias the columns so they match the socket.io server's 'out' object for live messages; this prevents different proeprty names between live messages output and historic DB messge output on front end
m.message_id as "messageId",                
m.sender_user_id as "fromUserId",
m.recipient_user_id as "toUserId", 
m.message_content as "text",
m.sent_at as "sentAt",     
m.edited_at as "editedAt"
FROM chat_messages as m
WHERE m.room_id = $1
AND m.deleted_at IS NULL
ORDER BY m.message_id ASC
LIMIT 50;
