import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { Card, CardContent } from '@/components/ui/card';
import { Code, Users, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-image.jpg';

export default function Landing() {
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
            <Link to="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link to="/register">
              <Button variant="hero">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8 animate-float">
            <img 
              src={heroImage}
              alt="Conectando talento con oportunidades"
              className="mx-auto rounded-2xl shadow-soft max-w-4xl w-full"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Conecta Talento
            <br />
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              con Oportunidades
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            La plataforma que une a los mejores desarrolladores con las empresas más innovadoras. 
            Encuentra tu próximo desafío profesional o descubre el talento que necesitas.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-primary bg-clip-text text-transparent">
            ¿Por qué elegir TalentUp?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-primary transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Code className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Para Desarrolladores</h3>
                <p className="text-muted-foreground mb-6">
                  Crea tu perfil profesional, muestra tus habilidades y conecta 
                  con empresas que valoran tu talento.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-secondary transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Para Empresas</h3>
                <p className="text-muted-foreground mb-6">
                  Encuentra a los desarrolladores perfectos para tu equipo. 
                  Revisa perfiles detallados y habilidades específicas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-primary transition-all duration-300 hover:scale-105 border-0 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Conexión Instantánea</h3>
                <p className="text-muted-foreground mb-6">
                  Algoritmos inteligentes que conectan el talento adecuado 
                  con las oportunidades perfectas en tiempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-background/10"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para conectar?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Únete a miles de desarrolladores y empresas que ya están construyendo el futuro juntos.
          </p>
          <Link to="/register">
            <Button 
              size="hero" 
              className="bg-white text-primary hover:bg-white/90 hover:scale-105 transform transition-all duration-200 shadow-soft"
            >
              Empezar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
              <Code className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
              TalentUp
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 TalentUp. Construyendo el futuro del reclutamiento tecnológico.
          </p>
        </div>
      </footer>
    </div>
  );
}