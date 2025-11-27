import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <header
      className="
      sticky top-0 z-50 
      backdrop-blur-xl 
      bg-black/20 
      border-b border-white/10
      shadow-[0_8px_32px_rgba(0,0,0,0.3)]
      "
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">GuardianBox</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {isLoggedIn && (
            <>
              {/* Dashboard */}
              <Button asChild variant="ghost">
                <Link to="/dashboard">Dashboard</Link>
              </Button>

              {/* Upload */}
              <Button asChild className="gradient-hero">
                <Link to="/upload">Share File</Link>
              </Button>

              {/* ⚡ UPGRADE BUTTON WITH NEON BORDER + SPARK PARTICLES */}
              <Button
                asChild
                className="
                  relative px-6 h-10 font-semibold rounded-xl
                  text-white bg-white/10 backdrop-blur-md 
                  border border-white/20 
                  overflow-hidden
                  shadow-[0_0_20px_rgba(255,0,255,0.3)]
                  hover:scale-105 
                  transition-all duration-300
                  flex items-center gap-2
                "
              >
                <Link to="/upgrade">

                  {/* Neon rotating border */}
                  <span
                    className="
                      absolute inset-0 rounded-xl pointer-events-none
                      before:absolute before:inset-[-4px] before:rounded-xl 
                      before:bg-gradient-to-r before:from-fuchsia-500 before:via-purple-500 before:to-blue-500
                      before:animate-neon before:blur-lg 
                      opacity-60
                    "
                  ></span>

                  {/* Spark particle 1 */}
                  <span
                    className="
                      absolute w-1.5 h-1.5 rounded-full bg-fuchsia-400
                      animate-spark opacity-70
                      left-4 top-6
                    "
                  ></span>

                  {/* Spark particle 2 */}
                  <span
                    className="
                      absolute w-1 h-1 rounded-full bg-purple-400
                      animate-spark2 opacity-70
                      right-5 top-3
                    "
                  ></span>

                  {/* Spark particle 3 */}
                  <span
                    className="
                      absolute w-1.5 h-1.5 rounded-full bg-blue-400
                      animate-spark3 opacity-70
                      left-1/2 top-8
                    "
                  ></span>

                  {/* Inner content */}
                  <span className="relative z-10 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-fuchsia-300 drop-shadow" />
                    Upgrade
                  </span>

                </Link>
              </Button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-2 hover:bg-white/10 backdrop-blur-lg">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="
                  w-40 bg-black/40 backdrop-blur-xl 
                  border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]
                  "
                >
                  <DropdownMenuLabel className="text-center">Account</DropdownMenuLabel>

                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/upload")}>
                    Upload File
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-red-400"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {!isLoggedIn && (
            <>
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>

              <Button asChild className="gradient-hero">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
