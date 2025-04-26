import { createContext } from 'react';

const AuthContext = createContext({
  currentUser: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  loading: true
});

export default AuthContext;
