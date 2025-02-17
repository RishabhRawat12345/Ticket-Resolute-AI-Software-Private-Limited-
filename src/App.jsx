// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Dashboard from "./Components/Dashboard";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import AdminDashboard from "./Components/Admindashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Signup/>}/>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/admindashboard" element={<AdminDashboard/>}/>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;
