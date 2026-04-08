import { useState } from "react";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Editor from "./pages/Editor";
import Sessions from "./pages/Sessions";

function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  if (user) {
    if (page === "sessions") {
      return (
        <>
          <div className="breadcrumb-nav">
            <span className="breadcrumb-item active">📍 home / login / sessions</span>
          </div>
          <Sessions user={user} setPage={setPage} setUser={setUser} />
        </>
      );
    }

    return (
      <>
        <div className="breadcrumb-nav">
          <span className="breadcrumb-item active">📍 home / login / editor</span>
        </div>
        <Editor user={user} setUser={setUser} setPage={setPage} />
      </>
    );
  }

  const getPageLabel = () => {
    if (page === "login") return "home / login";
    if (page === "register") return "home / register";
    return "home";
  };

  return (
    <>
      <div className="breadcrumb-nav">
        <span className="breadcrumb-item active">📍 {getPageLabel()}</span>
      </div>
      
      <div className="navbar">
        <h2>Vi-Notes</h2>
      </div>

      {page === "home" && <Home setPage={setPage} />}
      {page === "login" && <Login setUser={setUser} setPage={setPage} />}
      {page === "register" && <Register setPage={setPage} />}
    </>
  );
}

export default App;