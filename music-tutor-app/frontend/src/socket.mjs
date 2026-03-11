import {io} from "socket.io-client";

const socketUrl = "http://localhost:3000";

export const socket = io(socketUrl, {
    withCredentials: true, // necessary for the client to send rleevant cookies for socket.io verification (see note below about why 'auth' option is not used)
    autoConnect: false, // don't connect automatically as client should be verified before allowing connection.
    // NOT SENDING AUTH TOKEN VIA 'auth' option as the backend puts the JWT in an http-only cookie which means the frontend JS can't read it
})