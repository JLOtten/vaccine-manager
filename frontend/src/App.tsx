import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import About from "./components/About";
import Contact from "./components/Contact";
import FamilyMemberLog from "./components/FamilyMemberLog";
import AddVaccine from "./components/AddVaccine";
import ViewRecord from "./components/ViewRecord";
import Home from "./components/Home";
import ResponsiveAppBar from "./components/ResponsiveAppBar";

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
        <Route path="/home" element={<Home />} />
        <Route path="/responsiveAppBar" element={<ResponsiveAppBar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
