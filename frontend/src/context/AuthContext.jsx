import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [product, setproduct] = useState([]);
  const [Outwards, setOutwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stock, setstocks] = useState([]);
  const api = import.meta.env.VITE_APP_URL_BACKEND;

  const ExistingUsers = async () => {
    await fetch(api + "/api/getUsers").then(async (res) => {
      const result = await res.json();
      setUsers(result);
    });
  };

  // ✅ Load user and latest outward list on startup
  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      // ✅ Combine roles for dual-role users
      if (
        parsedUser.role === 'inward_executive' ||
        parsedUser.role === 'outward_executive'
      ) {
        parsedUser.role = 'outward_executive_inward_executive';
      }

      setUser(parsedUser);

      // ✅ Fetch latest outward transactions
      OutwardTransaction();
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await fetch(api + "/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const foundUser = await response.json();

    if (response.ok) {
      const userData = { ...foundUser.data };

      // ✅ Combine roles here too
      if (
        userData.role === 'inward_executive' ||
        userData.role === 'outward_executive'
      ) {
        userData.role = 'outward_executive_inward_executive';
      }

      delete userData.password;
      setUser(userData);
      sessionStorage.setItem('currentUser', JSON.stringify(userData));

      // ✅ Fetch latest outward transactions immediately after login
      OutwardTransaction();
      AllProducts();
      getStocks();

      return { success: true };
    }

    return { success: foundUser.success, message: foundUser.message };
  };

  const getStocks = async () => {
    try {
      const response = await fetch(api + "/api/get_product_stock");
      if (response.ok) {
        const result = await response.json();
        setstocks(result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const AllProducts = async () => {
    try {
      const response = await fetch(api + "/api/get_product");
      const result = await response.json();
      if (response.ok) {
        setproduct(result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('currentUser');
  };

  const addUser = async (userData) => {
    try {
      const response = await fetch(api + "/api/addUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ ...userData })
      });
      if (response.ok) {
        ExistingUsers();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(api + "/api/deleteUsers", {
        method: "Delete",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: userId })
      });
      if (response.ok) {
        ExistingUsers();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateUserRole = (userId, newRole) => {
    setUsers(users.map(u =>
      u.id === userId ? { ...u, role: newRole } : u
    ));
  };

  // ✅ Outward transactions fetch (used on login + app load)
  const OutwardTransaction = async () => {
    try {
      const response = await fetch(api + "/api/outward_transactions");
      if (response.ok) {
        const result = await response.json();
        setOutwards(result);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const value = {
    user,
    users: users.filter(u => u.id !== user?.id),
    product,
    stock,
    Outwards, // ✅ outward list still available to all components
    getStocks,
    OutwardTransaction,
    login,
    ExistingUsers,
    AllProducts,
    logout,
    addUser,
    deleteUser,
    updateUserRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
