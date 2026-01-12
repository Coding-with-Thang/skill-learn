import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function TopNav({ collapsed }) {
  return (
    <header
      className={`fixed top-0 right-0 z-30 transition-all duration-300 h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 ${collapsed ? "left-20" : "left-64"
        }`}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search tenants, users, or settings..."
          className="pl-10 bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/20 transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-4">
        <ThemeSwitcher />

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
          <Bell size={20} />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-[10px]">
            3
          </Badge>
        </Button>

        <div className="h-8 w-[1px] bg-border mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
                <AvatarImage src="/avatars/01.png" alt="@admin" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">SA</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Super Admin</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@eduflow.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
