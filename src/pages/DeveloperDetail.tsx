import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { ContactDialog } from '@/components/ContactDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Users, 
  LogOut, 
  Mail, 
  MessageCircle, 
  ExternalLink,
  Github,
  Linkedin,
  FileText,
  User
} from 'lucide-react';

interface Developer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  skills: string[] | null;
  github_link: string | null;
  linkedin_link: string | null;
  cv_url: string | null;
}

export default function DeveloperDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDeveloper();
    }
  }, [id]);

  const fetchDeveloper = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDeveloper(data);
    } catch (error) {
      console.error('Error fetching developer:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando información del desarrollador...</p>
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Desarrollador no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            No se pudo encontrar la información del desarrollador solicitado.
          </p>
          <Button onClick={() => navigate('/developers')}>
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/developers')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-secondary bg-clip-text text-transparent">
                TalentUp
              </h1>
            </div>
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

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-32 h-32">
                <AvatarImage src={developer.avatar_url || ''} alt={developer.name || ''} />
                <AvatarFallback className="bg-gradient-secondary text-white text-2xl">
                  {getInitials(developer.name || '')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
                  {developer.name || 'Sin nombre'}
                </h1>
                
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{developer.email}</span>
                </div>

                {/* Contact Button */}
                <div className="mb-4">
                  <ContactDialog 
                    developerId={developer.id} 
                    developerName={developer.name || 'Desarrollador'}
                  />
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3">
                  {developer.github_link && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <a 
                        href={developer.github_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        GitHub
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  
                  {developer.linkedin_link && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <a 
                        href={developer.linkedin_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <Linkedin className="mr-2 h-4 w-4" />
                        LinkedIn
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  
                  {developer.cv_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                    >
                      <a 
                        href={developer.cv_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Ver CV
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Habilidades Técnicas</CardTitle>
          </CardHeader>
          <CardContent>
            {developer.skills && developer.skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {developer.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Este desarrollador aún no ha registrado sus habilidades técnicas.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Experiencia</h3>
                <p className="text-muted-foreground">
                  La información detallada de experiencia estará disponible próximamente.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Proyectos</h3>
                <p className="text-muted-foreground">
                  Los proyectos y portafolio estarán disponibles próximamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}