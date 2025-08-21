import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Building, Search, Star, LogOut } from 'lucide-react';

export default function WelcomeCompany() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
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
          <div className="w-24 h-24 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <Users className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-secondary bg-clip-text text-transparent">
            ¡Bienvenida, Empresa!
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tu cuenta empresarial ha sido creada exitosamente. Ahora puedes comenzar a buscar 
            y conectar con los mejores desarrolladores para tu equipo.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-secondary transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-2">
                <Building className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Perfil de Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Completa la información de tu empresa, sube tu logo y describe tu cultura.
              </p>
              <Button variant="accent" className="w-full">
                Completar Perfil
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-primary transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
                <Search className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Buscar Talento</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explora perfiles de desarrolladores y encuentra candidatos perfectos para tu equipo.
              </p>
              <Button variant="hero" className="w-full">
                Explorar Desarrolladores
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-secondary transition-all duration-300 hover:scale-105">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-hero rounded-lg flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Destacar Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Mejora la visibilidad de tu empresa y atrae a los mejores candidatos.
              </p>
              <Button variant="outline" className="w-full">
                Saber Más
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
            Encuentra el Talento que Necesitas
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <Card className="bg-gradient-primary text-white border-0">
              <CardContent className="p-6">
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-primary-foreground/90">Desarrolladores Activos</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-secondary text-white border-0">
              <CardContent className="p-6">
                <div className="text-3xl font-bold mb-2">50+</div>
                <div className="text-secondary-foreground/90">Tecnologías Representadas</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-hero text-white border-0">
              <CardContent className="p-6">
                <div className="text-3xl font-bold mb-2">95%</div>
                <div className="text-white/90">Tasa de Éxito</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-primary text-white border-0">
              <CardContent className="p-6">
                <div className="text-3xl font-bold mb-2">24h</div>
                <div className="text-primary-foreground/90">Tiempo Promedio de Respuesta</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-secondary bg-clip-text text-transparent">
            Cómo Funciona
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Completa tu perfil</h3>
                  <p className="text-muted-foreground text-sm">
                    Añade información de tu empresa, cultura y el tipo de talento que buscas.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Explora candidatos</h3>
                  <p className="text-muted-foreground text-sm">
                    Navega por perfiles detallados con habilidades, experiencia y portafolios.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Conecta directamente</h3>
                  <p className="text-muted-foreground text-sm">
                    Contacta a los candidatos que mejor se adapten a tus necesidades.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-secondary text-white border-0 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                ¿Listo para encontrar tu próximo gran talento?
              </h3>
              <p className="mb-6 text-secondary-foreground/90">
                Completa tu perfil de empresa y comienza a explorar los mejores desarrolladores disponibles.
              </p>
              <Button 
                variant="default" 
                size="lg"
                className="bg-white text-secondary hover:bg-white/90"
              >
                Completar Perfil de Empresa
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}