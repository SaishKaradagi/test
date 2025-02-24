import {
  UserButton,
  useUser,
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin, MessageSquare, Info, FileText } from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser(); // Check if user is signed in

  const navItems = [
    {
      name: "Roadmap",
      icon: <MapPin className="h-4 w-4 mr-2" />,
      href: "/roadmap",
    },
    {
      name: "Interview Prep",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
      href: "/interview",
    },
    {
      name: "Resume Builder",
      icon: <FileText className="h-4 w-4 mr-2" />,
      href: "/ResumeLanding", // Updated to match the new route
    },
    {
      name: "About",
      icon: <Info className="h-4 w-4 mr-2" />,
      href: "/AboutPage",
    },
    {
      name: "Community",
      icon: <Info className="h-4 w-4 mr-2" />,
      href: "/community",
    },
  ];

  return (
    <nav className="bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xl px-3 py-2 rounded-md">
                CareerAI
              </div>
              <span className="ml-2 text-lg font-semibold hidden sm:block">
                PathFinder
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-200"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Authentication Section */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }}
              />
            ) : (
              <div className="flex space-x-2">
                <SignInButton>
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
                <SignUpButton>
                  <Button variant="default">Sign Up</Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:bg-blue-100 hover:text-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
