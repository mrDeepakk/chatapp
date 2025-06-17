import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [username, setUsername] = useState("");
  const [chatActive, setChatActive] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("typing", (user) => {
      setTypingUser(user);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 2000);
    });

    return () => {
      socket.off("message");
      socket.off("typing");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!messageText.trim()) return;
    socket.emit("sendMessage", { text: messageText, username });
    setMessageText("");
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    socket.emit("typing", username);
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex justify-center items-center font-sans">
      {!chatActive ? (
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl mb-4 font-semibold">Join the Chat</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && username.length >= 3 && setChatActive(true)
            }
            placeholder="Enter your name..."
            className="border px-4 py-2 rounded w-full mb-4"
          />
          <button
            onClick={() => username.length >= 3 && setChatActive(true)}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Start Chat
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl h-full flex flex-col bg-white shadow-lg rounded-md overflow-hidden">
          <div className="bg-blue-600 text-white p-4 text-center text-lg font-bold">
            Welcome, {username}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.username === username ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`inline-block max-w-[75%] px-4 py-2 mb-2 rounded-lg text-sm ${
                    msg.username === username
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.username !== username && (
                    <div className="text-xs text-gray-600 mb-1 font-medium">
                      {msg.username}
                    </div>
                  )}
                  <div>{msg.text}</div>
                  <div className="text-[10px] text-gray-400 mt-1 text-right">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {typingUser && typingUser !== username && (
            <div className="px-4 pb-1 text-sm text-gray-500 italic">
              {typingUser} is typing...
            </div>
          )}

          <div className="flex p-4 border-t">
            <input
              value={messageText}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
