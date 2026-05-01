import { query } from "../config/pool.mjs";
import { loadSql } from "../queries/loadSql.mjs";

const getMessagesQuery = loadSql("getMessages.sql");
const inboxHistoryQuery = loadSql("inboxHistory.sql");

export const getMessagesFromDB = async (req, res, next) => {
  try {
    // req.user will exist as it was built by 'protect' middleware
    const myUserId = Number(req.user.user_id);
    if (!Number.isInteger(myUserId) || myUserId <= 0) {
      res.status(401);
      return next(new Error("Unauthorised"));
    }

    // gwt other user id from params
    const otherUserId = Number(req.params?.otherUserId);
    if ( !Number.isInteger(otherUserId) || otherUserId <= 0 || otherUserId === myUserId) {
      res.status(400);
      return next(new Error("Invalid otherUserId"));
    }

    // arrange userIds in ascending order to build chatroom ID as per DB schema
    const userA = Math.min(myUserId, otherUserId);
    const userB = Math.max(myUserId, otherUserId);

    // now check if current logged-in user and intended recipient are part of a room stored in DB.
    // If it exists and user ids are in it; get associated room id and room key/name; if not, return blank message array to client
    const roomRes = await query(
      `select room_id, room_key
        from chat_rooms
        where user_a_id = $1 AND user_b_id = $2`,
      [userA, userB],
    );

    //console.log(roomRes.rows);
    // if no room found, send empty messages array
    if (roomRes.rowCount === 0) {
      return res.json({
        otherUserId,
        messages: [],
      });
    }

    const { room_id, room_key } = roomRes.rows[0];
    const messageRes = await query(getMessagesQuery, [room_id]);
    const messages = messageRes.rows;
    console.log(messages);

    return res.json({
      room: room_key,
      otherUserId,
      messages,
    });
  } catch (error) {
    return next(error);
  }
};

export const inboxHistoryHandler = async (req, res, next) => {
  try {
    const myUserId = Number(req.user?.user_id);

    if (!Number.isInteger(myUserId) || myUserId <= 0) {
      res.status(401);
      return next(new Error("Unauthorised"));
    }

    const dbRes = await query(inboxHistoryQuery, [myUserId]);
    const inboxData = dbRes.rows ?? [];
    console.log('user inbox history data:', inboxData);
    
    res.json({
      inboxData,
    });
  } catch (error) {
    return next(error);
  }
};
