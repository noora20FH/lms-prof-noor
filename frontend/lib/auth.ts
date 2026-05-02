export const getToken = () => localStorage.getItem("token");
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logout = async () => {
  const token = getToken();
  if (token) {
    await fetch("http://127.0.0.1:8000/api/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  localStorage.clear();
  window.location.href = "/login";
};