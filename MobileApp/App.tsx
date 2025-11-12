import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface Message {
  id: number;
  username: string;
  text: string;
  sentimentLabel: string;
  sentimentScore: number;
  timestamp: string;
}

const API_URL = "https://konusarak-ogren-projesi-mlsp.onrender.com";


function App(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nickname, setNickname] = useState("");
  const [currentMessage, setCurrentMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/messages`)
      .then(response => response.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Mesajlar yüklenemedi:", error);
        Alert.alert("Hata", "Eski mesajlar yüklenemedi.");
        setLoading(false);
      });
  }, []);

  const handleSendMessage = async () => {
    if (!currentMessage || !nickname) {
      Alert.alert("Uyarı", "Lütfen rumuz ve mesaj girin.");
      return;
    }

    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: nickname,
        text: currentMessage
      })
    });

    if (response.ok) {
      const newMessage = await response.json();
      setMessages([...messages, newMessage]);
      setCurrentMessage("");
    } else {
      console.error("Mesaj gönderilemedi.");
      Alert.alert("Hata", "Mesaj gönderilirken bir hata oluştu.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView
        style={styles.messageList}
        ref={scrollViewRef}

        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {loading && <ActivityIndicator size="large" color="#007bff" />}
        
        {messages.map(msg => (
          <View key={msg.id} style={styles.message}>
            <Text style={styles.username}>{msg.username}:</Text>
            <Text style={styles.text}>{msg.text}</Text>
            <Text style={styles.sentiment}>
              ({msg.sentimentLabel} - {Math.round(msg.sentimentScore * 100)}%)
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputForm}>
        <TextInput
          style={styles.input}
          placeholder="Rumuzunuz..."
          value={nickname}
          onChangeText={setNickname} 
        />
        <TextInput
          style={styles.input}
          placeholder="Mesajınızı yazın..."
          value={currentMessage}
          onChangeText={setCurrentMessage}
        />
        <Button
          title="Gönder"
          onPress={handleSendMessage}
          color="#007bff"
        />
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  messageList: {
    flex: 1,
    padding: 20,
  },
  message: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  username: {
    fontWeight: 'bold',
    color: '#333',
  },
  text: {
    marginTop: 4,
    fontSize: 16,
    color: '#555',
  },
  sentiment: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'right',
  },
  inputForm: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
    fontSize: 16,
  },
});

export default App;