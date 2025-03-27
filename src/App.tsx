import './App.css'
import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <>
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md">
          <ChatInterface />
        </div>
      </main>
    </>
  )
}

export default App
