import React, { useEffect, useState } from "react";
import Sidebar from "./Components/Sidebar/Sidebar";
import Main from "./Components/Main/Main";
import Login from "./pages/Login/Login";

import { onAuthChange } from "./firebase";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!user) return <Login />;

  return (
  <div className="app-layout">
    <Sidebar />
    <Main user={user} />
  </div>
);
};

export default App;