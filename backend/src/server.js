const http = require("http");

const { Server } = require("socket.io");

const registerChatSocket = require("./modules/chat/chat.socket");
const app = require("./app");

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
registerChatSocket(io)

server.listen(process.env.PORT || 3000, () => {
    console.log("Server + Socket running")

});
