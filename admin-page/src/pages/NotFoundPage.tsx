import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { AlertTriangle } from "lucide-react"

const NotFoundPage = () => {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <AlertTriangle className="h-16 w-16 text-muted-foreground" />
            <h1 className="mt-6 text-4xl font-bold">404 - Page Not Found</h1>
            <p className="mt-4 max-w-md text-muted-foreground">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <div className="mt-8 flex gap-4">
                <Button asChild>
                    <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link to="/login">Go to Login</Link>
                </Button>
            </div>
        </div>
    )
}

export default NotFoundPage