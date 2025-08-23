import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, ArrowLeft, LogOut, Eye, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Developer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  skills: string[] | null;
  github_link: string | null;
  linkedin_link: string | null;
}

export default function Developers() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  useEffect(() => {
    filterDevelopers();
  }, [searchTerm, skillFilter, developers]);

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('name');

      if (error) throw error;
      setDevelopers(data || []);
    } catch (error) {
      console.error('Error fetching developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDevelopers = () => {
    let filtered = developers;

    // Filter by name
    if (searchTerm) {
      filtered = filtered.filter(dev => 
        dev.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by skills
    if (skillFilter) {
      filtered = filtered.filter(dev =>
        dev.skills?.some(skill => 
          skill.toLowerCase().includes(skillFilter.toLowerCase())
        )
      );
    }

    setFilteredDevelopers(filtered);
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando desarrolladores...</p>
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
              onClick={() => navigate('/welcome/company')}
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
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Explora Desarrolladores
          </h1>
          <p className="text-xl text-muted-foreground">
            Encuentra el talento perfecto para tu equipo
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar por nombre</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtrar por habilidad</label>
                <Input
                  placeholder="Ej: React, JavaScript, Python..."
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Counter */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando {filteredDevelopers.length} de {developers.length} desarrolladores
          </p>
        </div>

        {/* Developers List */}
        <div className="space-y-4">
          {filteredDevelopers.map((developer) => (
            <Card key={developer.id} className="hover:shadow-primary transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={developer.avatar_url || ''} alt={developer.name || ''} />
                    <AvatarFallback className="bg-gradient-secondary text-white">
                      {getInitials(developer.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-1">
                      {developer.name || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {developer.email}
                    </p>
                    
                    {/* Skills */}
                    <div>
                      <div className="flex flex-wrap gap-2">
                        {developer.skills && developer.skills.length > 0 ? (
                          developer.skills.slice(0, 6).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Sin habilidades registradas
                          </Badge>
                        )}
                        {developer.skills && developer.skills.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{developer.skills.length - 6} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div className="flex-shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/developers/${developer.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredDevelopers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron desarrolladores</h3>
            <p className="text-muted-foreground">
              Prueba ajustando los filtros de búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}