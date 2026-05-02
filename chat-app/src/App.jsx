import {useContext} from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Homepage from './Pages/Homepage'
import Loginpage from './Pages/Loginpage'
import Profilepage from './Pages/Profilepage'
import { Toaster } from 'react-hot-toast'
import {AuthContext} from '../context/AuthContext'


const App = () => {

  const{authUser} = useContext(AuthContext)

  return (
    <div className="bg-[url('./src/assets/bgImage.svg')]">
      <Toaster/>
      <Routes>
        <Route path="/" element={authUser ? <Homepage/> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <Loginpage/> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <Profilepage/> : <Navigate to="/login" />} />
      </Routes>
    </div>
  )
}

export default App