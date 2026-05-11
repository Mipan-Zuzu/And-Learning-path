import { io } from "socket.io-client";

export const createSocket = (apiUrl) => io(apiUrl);

