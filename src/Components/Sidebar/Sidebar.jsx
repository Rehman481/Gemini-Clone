import React, { useContext, useState, useEffect } from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { Context } from "../../context/Context";
import { logoutUser, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Sidebar = () => {
  const [extended, setExtended] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);

  const { chats, activeChat, setActiveChat, createNewChat } =
    useContext(Context);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowSettings(false);
      
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className={`sidebar ${extended ? "extended" : "collapsed"}`}>

      
      <div className="top">

       
        <img
          onClick={() => setExtended((prev) => !prev)}
          className="menu"
          src={assets.menu_icon}
          alt="menu"
        />

       
        <div className="new-chat" onClick={createNewChat}>
          <img src={assets.plus_icon} alt="new chat" />
          {extended && <p>New Chat</p>}
        </div>

        
        {extended && (
          <div className="recent">
            <p className="recent-title">Recent</p>

            {chats.length === 0 ? (
              <div className="no-chats">
                <p>No chats yet</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`recent-entry ${
                    chat.id === activeChat ? "active-chat" : ""
                  }`}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <img src={assets.message_icon} alt="chat" />
                  <p>
                    {chat.messages?.[0]?.text
                      ? chat.messages[0].text.slice(0, 25)
                      : "New Chat"}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      
      <div className="bottom">

       
        <div className="bottom-item">
          <img src={assets.question_icon} alt="help" />
          {extended && <p>Help</p>}
        </div>

        
        <div className="bottom-item">
          <img src={assets.history_icon} alt="history" />
          {extended && <p>Activity</p>}
        </div>

       
        <div
          className="bottom-item settings-item"
          onClick={() => setShowSettings((prev) => !prev)}
        >
          <img src={assets.setting_icon} alt="settings" />
          {extended && <p>Settings</p>}

          {/* DROPDOWN */}
          {showSettings && (
            <div className="settings-dropdown">
              {user ? (
                <>
                  <div className="dropdown-user-info">
                    <img 
                      src={user.photoURL || assets.user_icon} 
                      alt="user" 
                      className="dropdown-user-avatar"
                    />
                    <span className="dropdown-user-email">
                      {user.email || "User"}
                    </span>
                  </div>
                  <hr className="dropdown-divider" />
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  className="dropdown-item login-btn"
                  onClick={handleLogin}
                >
                  <span className="dropdown-icon">🔑</span>
                  Login
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Sidebar;