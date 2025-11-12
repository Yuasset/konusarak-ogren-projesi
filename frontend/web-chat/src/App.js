import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_URL = "https://konusarak-ogren-projesi-mlsp.onrender.com";

function App() {
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    fetch(`${API_URL}/api/messages`)
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Mesajlar yüklenemedi:", error);
        setLoading(false);
      });
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!currentMessage || !nickname) {
      alert("Lütfen rumuz ve mesaj girin.");
      return;
    }

    const response = await fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: nickname,
        text: currentMessage,
      }),
    });

    if (response.ok) {
      const newMessage = await response.json();

      setMessages([...messages, newMessage]);
      setCurrentMessage("");
    } else {
      console.error("Mesaj gönderilemedi.");
      alert("Mesaj gönderilirken bir hata oluştu.");
    }
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {loading && <div className="message">Mesajlar yükleniyor...</div>}

        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <span className="username">{msg.username}:</span>
            <span className="text">{msg.text}</span>
            <span className="sentiment">
              ({msg.sentimentLabel} - {Math.round(msg.sentimentScore * 100)}%)
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Rumuzunuz..."
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mesajınızı yazın..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}

export default App;
