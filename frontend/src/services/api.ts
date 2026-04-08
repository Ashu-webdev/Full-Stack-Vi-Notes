export const registerUser = async (data: any) => {
  const res = await fetch("https://vi-notes-di2i.onrender.com/api/auth/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
};

export const loginUser = async (data: any) => {
  const res = await fetch("https://vi-notes-di2i.onrender.com/api/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
};

export const saveSession = async (data: any) => {
  const res = await fetch("https://vi-notes-di2i.onrender.com/api/session/save", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateSession = async (sessionId: string, data: any) => {
  const res = await fetch(`https://vi-notes-di2i.onrender.com/api/session/${sessionId}`, {
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });
  return res.json();
};

export const getUserSessions = async (userId: string, limit: number = 20, skip: number = 0) => {
  const res = await fetch(
    `https://vi-notes-di2i.onrender.com/api/session/user/${userId}?limit=${limit}&skip=${skip}`,
    {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    }
  );
  return res.json();
};

export const searchSessions = async (userId: string, query: string, limit: number = 20, skip: number = 0) => {
  const res = await fetch(
    `https://vi-notes-di2i.onrender.com/api/session/search/${userId}?query=${encodeURIComponent(query)}&limit=${limit}&skip=${skip}`,
    {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    }
  );
  return res.json();
};

export const getSessionStats = async (userId: string) => {
  const res = await fetch(
    `https://vi-notes-di2i.onrender.com/api/session/stats/${userId}`,
    {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    }
  );
  return res.json();
};

export const getSessionById = async (sessionId: string) => {
  const res = await fetch(
    `https://vi-notes-di2i.onrender.com/api/session/${sessionId}`,
    {
      method: "GET",
      headers: {"Content-Type": "application/json"}
    }
  );
  return res.json();
};

export const deleteSession = async (sessionId: string) => {
  const res = await fetch(
    `https://vi-notes-di2i.onrender.com/api/session/${sessionId}`,
    {
      method: "DELETE",
      headers: {"Content-Type": "application/json"}
    }
  );
  return res.json();
};