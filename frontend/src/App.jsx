import React from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import PopularMovies from './pages/PopularMovies'

function App() {
  return (
    <div className="app">
      <Header />
      <main>
        <PopularMovies />
      </main>
      <Footer />
    </div>
  )
}

export default App
