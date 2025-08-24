import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="text-center shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Icon and 404 */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                404
              </h1>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Página no encontrada
              </h2>
              <p className="text-muted-foreground">
                Lo sentimos, la página que buscas no existe o ha sido movida.
              </p>
            </div>

            {/* Current path */}
            <div className="mb-6 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Ruta solicitada: <code className="text-primary font-mono">{location.pathname}</code>
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={() => navigate('/')}
              >
                <Home className="mr-2 h-4 w-4" />
                Ir al Inicio
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver Atrás
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
