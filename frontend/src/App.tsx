import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './components/login';
import About from './components/about';
import Contact from './components/contact';
import FamilyMemberLog from './components/familymemberlog';
import AddVaccine from './components/addvaccine';
import ViewRecord from './components/viewrecord';


function App() {
  return (
    <BrowserRouter>
     <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/familyMemberLog" element={<FamilyMemberLog />} />
        <Route path="/addVaccine" element={<AddVaccine />} />
        <Route path="/viewRecord" element={<ViewRecord />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
