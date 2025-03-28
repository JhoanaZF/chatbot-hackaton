import './App.css'
import ChatInterface from './components/ChatInterface'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function App() {
  const queryClient = new QueryClient()

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <main className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md">
            <ChatInterface />
          </div>
        </main>
      </QueryClientProvider>
    </>
  )
}

export default App
