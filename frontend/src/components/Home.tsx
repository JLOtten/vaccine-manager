import React from "react";
import ResponsiveAppBar from "./ResponsiveAppBar";

function Home() {
   
        return (
        <div>
          <nav>
            <ResponsiveAppBar />
          </nav>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent: 'center' }}>
            <h1>Hi Username!</h1>
            <h1>Welcome to your vaccine manager!</h1>
            <h2>Choose an option below:</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent: 'center' }}>
            <li>Enter New Family Member</li>
            <li>View Vaccine Record</li>
            <li>Record New Vaccine</li>
          </div>
        </div>
        );
    }
  


export default Home;


  


