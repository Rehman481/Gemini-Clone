import { createContext, useState, useEffect } from "react";
import runChat from "../config/gemini";

import { db, auth } from "../firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
} from "firebase/firestore";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");

  const [chats, setChats] = useState([
    {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
    },
  ]);

  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);

  const currentChat = chats.find((c) => c.id === activeChat);
  const messages = currentChat ? currentChat.messages : [];

  // ----------------------------
  // GET USER ID
  // ----------------------------
  const getUserId = () => auth.currentUser?.uid;

  // ----------------------------
  // CREATE CHAT
  // ----------------------------
  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
  };

  // ----------------------------
  // UPDATE CHAT STATE
  // ----------------------------
  const updateChatMessages = (chatId, newMessages) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: newMessages }
          : chat
      )
    );
  };

  // ----------------------------
  // SAVE TO FIRESTORE
  // ----------------------------
  const saveChatToDB = async (chatId, messages) => {
    const uid = getUserId();
    if (!uid) return;

    const ref = doc(db, "users", uid, "chats", chatId);

    await setDoc(ref, {
      messages,
    }, { merge: true });
  };

  // ----------------------------
  // LOAD CHATS FROM FIREBASE
  // ----------------------------
  const loadChats = async () => {
    const uid = getUserId();
    if (!uid) return;

    const snap = await getDocs(collection(db, "users", uid, "chats"));

    const loadedChats = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    if (loadedChats.length > 0) {
      setChats(loadedChats);
      setActiveChat(loadedChats[0].id);
    }
  };

  // ----------------------------
  // AUTO LOAD ON LOGIN
  // ----------------------------
  useEffect(() => {
    loadChats();
  }, [auth.currentUser]);

  // ----------------------------
  // SEND MESSAGE (MAIN LOGIC)
  // ----------------------------
  const handleSend = async () => {
    if (!input.trim()) return;

    if (!currentChat) createNewChat();

    const userMessage = { role: "user", text: input };

    const updatedMessages = [...messages, userMessage];

    updateChatMessages(activeChat, updatedMessages);

    await saveChatToDB(activeChat, updatedMessages);

    const userInput = input;
    setInput("");
    setLoading(true);

    const aiIndex = updatedMessages.length;

    let tempMessages = [
      ...updatedMessages,
      { role: "ai", text: "" },
    ];

    updateChatMessages(activeChat, tempMessages);

    try {
      const res = await runChat(userInput);

      let i = 0;

      const interval = setInterval(() => {
        if (i < res.length) {
          const updated = [...tempMessages];

          updated[aiIndex] = {
            ...updated[aiIndex],
            text: updated[aiIndex].text + res[i],
          };

          tempMessages = updated;
          updateChatMessages(activeChat, updated);

          i++;
        } else {
          clearInterval(interval);
          setLoading(false);
          saveChatToDB(activeChat, tempMessages);
        }
      }, 10);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  // ----------------------------
  // EDIT MESSAGE
  // ----------------------------
  const editMessage = (chatId, index, newText) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;

        const updated = [...chat.messages];

        updated[index] = {
          ...updated[index],
          text: newText,
        };

        return { ...chat, messages: updated };
      })
    );
  };

  // ----------------------------
  // REGENERATE RESPONSE
  // ----------------------------
  const regenerateResponse = async (chatId, index) => {
    const chat = chats.find((c) => c.id === chatId);
    if (!chat) return;

    const sliced = chat.messages.slice(0, index);

    const lastUserMsg =
      sliced.filter((m) => m.role === "user").pop()?.text;

    if (!lastUserMsg) return;

    setLoading(true);

    const res = await runChat(lastUserMsg);

    const updated = [
      ...sliced,
      { role: "ai", text: res },
    ];

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? { ...c, messages: updated }
          : c
      )
    );

    await saveChatToDB(chatId, updated);

    setLoading(false);
  };

  return (
    <Context.Provider
      value={{
        input,
        setInput,
        chats,
        messages,
        activeChat,
        setActiveChat,
        handleSend,
        loading,
        createNewChat,
        editMessage,
        regenerateResponse,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export default ContextProvider;