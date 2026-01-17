import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useApi } from "../services/ChatService";
import Message from "./Message";
import Contact from "./Contact";
import ChatForm from "./ChatForm";

export default function ChatRoom({
  currentChat,
  currentUser,
  socket,
  users,
  onlineUsersId,
}) {
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);

  // lưu roomId hiện tại để socket không bị stale
  const currentChatIdRef = useRef(null);

  const { getMessagesOfChatRoom, sendMessage } = useApi();

  // cập nhật ref khi đổi phòng
  useEffect(() => {
    currentChatIdRef.current = currentChat?._id || null;
  }, [currentChat?._id]);

  // scroll an toàn
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, []);

  // 1️⃣ Fetch messages khi đổi phòng
  useEffect(() => {
    if (!currentChat?._id) {
      setMessages([]);
      return;
    }

    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const res = await getMessagesOfChatRoom(currentChat._id);
        if (!isMounted) return;

        setMessages(res || []);

        requestAnimationFrame(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight;
          }
        });
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [currentChat?._id, getMessagesOfChatRoom]);

  // 2️⃣ Socket nhận tin nhắn
  useEffect(() => {
    if (!socket?.current) return;

    const handleGetMessage = (data) => {
      if (
        data.chatRoomId === currentChatIdRef.current &&
        data.senderId !== currentUser._id
      ) {
        setMessages((prev) => [
          ...prev,
          {
            _id: `temp-${Date.now()}`,
            sender: data.senderId,
            message: data.message,
            createdAt: new Date().toISOString(),
          },
        ]);

        setTimeout(scrollToBottom, 30);
      }
    };

    socket.current.on("getMessage", handleGetMessage);
    return () => {
      socket.current.off("getMessage", handleGetMessage);
    };
  }, [socket, currentUser._id, scrollToBottom]);

  // 3️⃣ Gửi tin nhắn
  const handleFormSubmit = async (message) => {
    if (!message.trim() || !currentChat?._id) return;

    const receiverId = currentChat.members.find(
      (m) => m !== currentUser._id
    );

    // emit socket
    socket.current.emit("sendMessage", {
      senderId: currentUser._id,
      receiverId,
      chatRoomId: currentChat._id,
      message,
    });

    try {
      const res = await sendMessage({
        chatRoomId: currentChat._id,
        sender: currentUser._id,
        message,
        isRead: false,
      });

      setMessages((prev) => [...prev, res]);
      scrollToBottom();
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // memo header
  const memoizedContact = useMemo(() => {
    if (!currentChat) return null;
    return (
      <Contact
        chatRoom={currentChat}
        currentUser={currentUser}
        onlineUsersId={onlineUsersId}
      />
    );
  }, [currentChat, currentUser, onlineUsersId]);

  return (
    <div className="lg:col-span-2 flex flex-col h-[600px] border-l dark:border-gray-700">
      <div className="p-3 bg-white border-b dark:bg-gray-900 dark:border-gray-700">
        {memoizedContact}
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 w-full p-6 overflow-y-auto bg-white dark:bg-gray-900"
      >
        <ul className="space-y-4">
          {messages.map((msg) => (
            <Message
              key={msg._id}
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
