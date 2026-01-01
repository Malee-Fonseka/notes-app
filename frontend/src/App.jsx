import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Home from './pages/Home/Home.jsx'
import Login from './pages/Login/Login.jsx'
import SignUp from './pages/SignUp/SignUp.jsx'


function App() {
  return (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" exact element={<Home />} />
      <Route path="/login" exact element={<Login />} />
      <Route path="/signup" exact element={<SignUp />} />
    </Routes>
  </Router>  
  )
}

export default App
