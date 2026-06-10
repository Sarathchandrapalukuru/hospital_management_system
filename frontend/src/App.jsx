import React from 'react'
import Admin from './pages/Admin'
import Doctor from './pages/Doctor'
import Patient from './pages/Patient'
import SignUp from './pages/Signup'
import HomePage, { TransferProvider }  from './pages/Index' 
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {
  return (
    <TransferProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<HomePage />} /> 
          <Route path='/index' element={<HomePage />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/doctor' element={<Doctor />} />
          <Route path='/patient' element={<Patient />} />
          <Route path='/signup' element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </TransferProvider>
  )
}

export default App