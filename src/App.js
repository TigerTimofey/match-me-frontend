import "./App.css";
import Login from "./auth/login/Login";
import MainComponent from "./pages/MainComponent";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/me" element={<MainComponent />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
