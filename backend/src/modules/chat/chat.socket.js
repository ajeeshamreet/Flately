const chatService = require("./chat.service");



function registerChatSocket(io){
    io.on("connection", (socket) => {
        socket.on("join",conversationId=>{
            socket.join(conversationId);

        });
            
    socket.on("send_message", async ({conversationId, senderId, content})=>{
        const msg = await chatService.sendMessage(
            conversationId,
            senderId,
            content
        );
        
        io.to(conversationId).emit("new_message", msg);
        
    })
    })
    }

module.exports = registerChatSocket;