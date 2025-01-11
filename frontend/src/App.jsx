import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import PopularMovies from './pages/PopularMovies'
import NewMovies from './pages/NewMovies'
import TopRatedMovies from './pages/TopRatedMovies'
import UpcomingMovies from './pages/UpcomingMovies'
import MovieDetails from './pages/MovieDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import Admin from './pages/Admin'
import { isAdmin } from './services/authService'

// Composant de protection des routes admin
const AdminRoute = ({ children }) => {
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<PopularMovies />} />
            <Route path="/nouveautes" element={<NewMovies />} />
            <Route path="/top-rated" element={<TopRatedMovies />} />
            <Route path="/a-venir" element={<UpcomingMovies />} />
            <Route path="/film/:id" element={<MovieDetails />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/inscription" element={<Register />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
