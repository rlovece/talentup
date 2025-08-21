import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Code, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<'developer' | 'company' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) return;
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    
    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.name,
      selectedRole
    );

    setLoading(false);

    if (!error) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TalentUp
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <DarkModeToggle />
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {!selectedRole ? (
            // Role Selection
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
                Únete a TalentUp
              </h1>
              <p className="text-xl text-muted-foreground mb-12">
                ¿Cómo te gustaría usar la plataforma?
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                <Card 
                  className="cursor-pointer hover:shadow-primary transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50"
                  onClick={() => setSelectedRole('developer')}
                >
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Code className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">Soy Desarrollador</h3>
                    <p className="text-muted-foreground">
                      Quiero mostrar mis habilidades y conectar con empresas que buscan mi talento.
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-secondary transition-all duration-300 hover:scale-105 border-2 hover:border-secondary/50"
                  onClick={() => setSelectedRole('company')}
                >
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">Soy Empresa</h3>
                    <p className="text-muted-foreground">
                      Quiero encontrar y conectar con los mejores desarrolladores para mi equipo.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Registration Form
            <div className="max-w-md mx-auto">
              <Card className="shadow-soft">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${selectedRole === 'developer' ? 'bg-gradient-primary' : 'bg-gradient-secondary'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {selectedRole === 'developer' ? (
                      <Code className="h-8 w-8 text-white" />
                    ) : (
                      <Users className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <CardTitle className="text-2xl">
                    Registro como {selectedRole === 'developer' ? 'Desarrollador' : 'Empresa'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">
                        {selectedRole === 'developer' ? 'Nombre completo' : 'Nombre de la empresa'}
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        minLength={6}
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        minLength={6}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setSelectedRole(null)}
                        className="flex-1"
                      >
                        Atrás
                      </Button>
                      <Button 
                        type="submit" 
                        variant={selectedRole === 'developer' ? 'hero' : 'accent'}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Registrarse
                      </Button>
                    </div>
                  </form>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Link to="/login" className="text-primary hover:underline">
                      Inicia sesión aquí
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}