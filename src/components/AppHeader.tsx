import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Code, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AppHeader() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TalentUp
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <DarkModeToggle />
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  );
}