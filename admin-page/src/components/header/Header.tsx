import { Bell, Search } from "lucide-react"
import { Input } from "../../components/ui/input.tsx"
import { Button } from "../../components/ui/button.tsx"
import { ModeToggle } from "../../components/mode-toggle"
import { SidebarTrigger } from "../../components/ui/sidebar.tsx"

const Header = () => {
    return (
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <SidebarTrigger className="md:hidden" />

            <div className="relative hidden md:flex md:w-64 lg:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="w-full bg-background pl-8 md:w-64 lg:w-80" />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
                </Button>
                <ModeToggle />
            </div>
        </header>
    )
}

export default Header