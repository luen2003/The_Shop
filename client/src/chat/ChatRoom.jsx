import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useApi } from "../services/ChatService";
import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";

export default function ChatRoom({ currentChat, currentUser, socket, users, onlineUsersId }) {
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);
  
  // Dùng Ref để lưu trữ roomId hiện tại, tránh việc closure của socket nhận nhầm phòng
  const currentChatIdRef = useRef(currentChat?._id);

  const { getMessagesOfChatRoom, sendMessage } = useApi();

  useEffect(() => {
    currentChatIdRef.current = currentChat?._id;
  }, [currentChat?._id]);

  // Cuộn nội bộ khung chat
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // 1. Fetch tin nhắn (Chỉ chạy khi ID phòng thay đổi)
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (currentChat?._id) {
        const res = await getMessagesOfChatRoom(currentChat._id);
        if (isMounted) {
          setMessages(res);
          // Cuộn ngay lập tức sau khi render
          requestAnimationFrame(scrollToBottom);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [currentChat?._id, getMessagesOfChatRoom, scrollToBottom]);

  // 2. Lắng nghe Socket (Tối ưu hóa để không nháy)
  useEffect(() => {
    if (!socket.current) return;

    const handleGetMessage = (data) => {
      // KIỂM TRA 1: Tin nhắn phải thuộc về phòng đang mở
      // KIỂM TRA 2: Không xử lý tin nhắn của chính mình (đã add ở hàm gửi)
      if (data.chatRoomId === currentChatIdRef.current && data.senderId !== currentUser._id) {
        setMessages((prev) => [...prev, {
          sender: data.senderId,
          message: data.message,
          createdAt: new Date().toISOString(),
          _id: `temp-${Date.now()}` // ID tạm để React không nhầm lẫn
        }]);
        setTimeout(scrollToBottom, 50);
      }
    };

    socket.current.on("getMessage", handleGetMessage);
    return () => {
      socket.current.off("getMessage", handleGetMessage);
    };
  }, [socket, currentUser._id, scrollToBottom]);

  // 3. Gửi tin nhắn
  const handleFormSubmit = async (message) => {
    if (!message.trim() || !currentChat) return;

    const receiverId = currentChat.members.find(m => m !== currentUser._id);

    // Phát socket kèm theo chatRoomId để bên kia lọc được
    socket.current.emit("sendMessage", {
      senderId: currentUser._id,
      receiverId,
      chatRoomId: currentChat._id,
      message,
    });

    const res = await sendMessage({
      chatRoomId: currentChat._id,
      sender: currentUser._id,
      message,
      isRead: false,
    });

    setMessages((prev) => [...prev, res]);
    scrollToBottom();
  };

  // Dùng useMemo để Contact không bị render lại mỗi khi gõ phím trong ChatForm
  const memoizedContact = useMemo(() => (
    <Contact
      chatRoom={currentChat}
      currentUser={currentUser}
      onlineUsersId={onlineUsersId}
    />
  ), [currentChat, onlineUsersId, currentUser]);

  return (
    <div className="lg:col-span-2 flex flex-col h-[600px] border-l dark:border-gray-700">
      <div className="p-3 bg-white border-b dark:bg-gray-900 dark:border-gray-700">
        {memoizedContact}
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 w-full p-6 overflow-y-auto bg-white dark:bg-gray-900 scroll-smooth"
      >
        <ul className="space-y-4">
          {messages.map((msg, index) => (
            <Message
              key={msg._id || index}
              message={msg}
              self={currentUser._id}
              users={users}
              currentUser={currentUser}
            />
          ))}
        </ul>
      </div>

      <div className="p-3 border-t dark:border-gray-700">
        <ChatForm handleFormSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}