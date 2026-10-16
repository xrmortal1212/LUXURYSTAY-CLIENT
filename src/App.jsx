import React from 'react'
import { Toaster } from 'react-hot-toast'
import Routing from './Config/Routing'
import CustomCursor from './Components/CustomCursor'
import { AuthProvider } from './Core/AuthContext'
import { ConfirmProvider } from './Pages/App/DashboardParts'

function App() {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <div>
          <CustomCursor />
          <Routing /> {/* ScrollToTop ko is Routing file ke andar <BrowserRouter> ke just baad rakhna hoga */}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'var(--font-body), sans-serif',
              fontSize: '13px',
              borderRadius: '8px'
            }
          }}
        />
      </ConfirmProvider>
    </AuthProvider>
  )
}

export default App;
