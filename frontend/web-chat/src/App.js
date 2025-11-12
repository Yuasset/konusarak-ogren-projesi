import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// !!! DEĞİŞTİR !!!
// BURAYA RENDER'DAN ALDIĞINIZ VE ARTIK ÇALIŞAN API URL'İNİZİ YAPIŞTIRIN
// Örnek: "https://konusarakogren-api.onrender.com"
const API_URL = "https://konusarak-ogren-projesi-mlsp.onrender.com"; // <-- KENDİ URL'NİZİ BURAYA YAPIŞTIRIN

function App() {
  // --- "State" Değişkenleri ---
  // 'state', bir bileşenin hafızasıdır.

  // messages: Ekranda gösterilecek tüm mesajların listesi
  const [messages, setMessages] = useState([]);

  // nickname: Kullanıcının girdiği rumuz
  const [nickname, setNickname] = useState("");

  // currentMessage: Kullanıcının anlık yazdığı mesaj
  const [currentMessage, setCurrentMessage] = useState("");

  // loading: API'den verinin gelip gelmediğini takip etmek için
  const [loading, setLoading] = useState(true);

  // Mesaj listesinin en altına otomatik kaydırmak için referans
  const messagesEndRef = useRef(null);

  // --- Fonksiyon: Otomatik Kaydırma ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // messages listesi her güncellendiğinde en alta kaydır
  useEffect(scrollToBottom, [messages]);

  // --- "Effect" Hook'u ---
  // useEffect, bileşen ilk açıldığında (boş [] dizi sayesinde) çalışır.
  useEffect(() => {
    // Sayfa ilk yüklendiğinde eski mesajları API'den çek
    fetch(`${API_URL}/api/messages`)
      .then((response) => response.json())
      .then((data) => {
        setMessages(data); // Gelen mesajları 'messages' state'ine kaydet
        setLoading(false); // Yükleme bitti
      })
      .catch((error) => {
        console.error("Mesajlar yüklenemedi:", error);
        setLoading(false); // Hata olsa da yükleme bitti
      });
  }, []); // Boş dizi sayesinde bu sadece 1 kez çalışır.

  // --- Fonksiyon: Mesaj Gönderme ---
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Form'un sayfayı yenilemesini engelle
    if (!currentMessage || !nickname) {
      alert("Lütfen rumuz ve mesaj girin.");
      return; // Boşsa gönderme
    }

    // 1. API'ye (Backend'e) yeni mesajı gönder
    const response = await fetch(`${API_URL}/api/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: nickname, // rumuz
        text: currentMessage,
      }),
    });

    if (response.ok) {
      // 2. Backend, mesajı AI'ye sorup veritabanına kaydetti
      // ve bize duygu skoruyla beraber geri yolladı.
      const newMessage = await response.json();

      // 3. Ekrana yeni mesajı ekle
      // setMessages, React'e "ekranı güncelle" emri verir.
      setMessages([...messages, newMessage]);

      // 4. Mesaj kutusunu temizle
      setCurrentMessage("");
    } else {
      console.error("Mesaj gönderilemedi.");
      alert("Mesaj gönderilirken bir hata oluştu.");
    }
  };

  // --- "JSX" (HTML'e benzeyen görünüm) ---
  // Bu kısım, ekranda neyin görüneceğini tanımlar.
  return (
    <div className="chat-container">
      {/* 1. Mesajların Listelendiği Alan */}
      <div className="message-list">
        {loading && <div className="message">Mesajlar yükleniyor...</div>}

        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <span className="username">{msg.username}:</span>
            <span className="text">{msg.text}</span>
            {/* PDF'in istediği anlık duygu skoru */}
            <span className="sentiment">
              ({msg.sentimentLabel} - {Math.round(msg.sentimentScore * 100)}%)
            </span>
          </div>
        ))}

        {/* Bu boş div, en alta kaydırmak için kullanılır */}
        <div ref={messagesEndRef} />
      </div>

      {/* 2. Mesaj Yazma Formu */}
      <form className="input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Rumuzunuz..."
          value={nickname}
          onChange={(e) => setNickname(e.target.value)} // Yazılanı 'nickname' state'ine kaydet
        />
        <input
          type="text"
          placeholder="Mesajınızı yazın..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)} // Yazılanı 'currentMessage' state'ine kaydet
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}

export default App;
