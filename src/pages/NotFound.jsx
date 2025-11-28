import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-10 shadow-lg">
        <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />

        <h1 className="text-5xl font-bold mb-3">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">
          Oops! The page you’re looking for doesn’t exist.
        </p>

        <Link
          to="/"
          className="inline-block gradient-hero px-8 py-3 rounded-xl text-white font-semibold shadow-md hover:opacity-90 transition-all"
        >
          Return to Home
        </Link>

        <p className="text-xs text-muted-foreground mt-4">
          Route: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;
