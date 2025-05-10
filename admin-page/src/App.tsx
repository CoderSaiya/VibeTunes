import { BrowserRouter as Router } from "react-router-dom"
import { Toaster } from "sonner"
import {AuthProvider} from "./context/AuthContext.tsx";
import AppRoutes from "./routes";

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
                <Toaster />
            </Router>
        </AuthProvider>
    )
}

export default App