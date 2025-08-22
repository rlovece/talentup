import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Code, User, FileText, Github, Linkedin, LogOut } from 'lucide-react';

export default function WelcomeDeveloper() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
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

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <Code className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            ¡Bienvenido, Desarrollador!
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tu cuenta ha sido creada exitosamente. Ahora puedes comenzar a completar tu perfil 
            profesional y conectar con las mejores empresas.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-primary transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
                <User className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Completa tu Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Añade tu información personal, foto de perfil y datos de contacto.
              </p>
              <Button 
                variant="hero" 
                className="w-full"
                onClick={() => navigate('/profile/developer')}
              >
                Ir a Mi Perfil
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-secondary transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Sube tu CV</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Comparte tu currículum para que las empresas conozcan tu experiencia.
              </p>
              <Button variant="accent" className="w-full">
                Subir CV
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-primary transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-2">
                <Github className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Conecta Redes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Vincula tus perfiles de GitHub y LinkedIn para mostrar tu trabajo.
              </p>
              <Button variant="outline" className="w-full">
                Conectar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-secondary bg-clip-text text-transparent">
            Próximos Pasos
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Completa tu perfil</h3>
                  <p className="text-muted-foreground text-sm">
                    Añade toda tu información profesional y habilidades técnicas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Explora oportunidades</h3>
                  <p className="text-muted-foreground text-sm">
                    Las empresas podrán ver tu perfil y contactarte directamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Conecta y crece</h3>
                  <p className="text-muted-foreground text-sm">
                    Encuentra tu próximo desafío profesional y desarrolla tu carrera.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-hero text-white border-0 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                ¿Listo para comenzar tu viaje?
              </h3>
              <p className="mb-6 text-white/90">
                Completa tu perfil ahora y empieza a recibir oportunidades de las mejores empresas.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => navigate('/profile/developer')}
              >
                Ir a Mi Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}