import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { ContactDetailModal } from '@/components/ContactDetailModal';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Code, User, FileText, Github, Linkedin, LogOut, Mail, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

interface Contact {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
  company_id: string;
  companies: {
    name: string;
    logo_url: string;
    contact_email: string;
  };
}

interface Developer {
  name: string;
}

export default function WelcomeDeveloper() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showContactDetail, setShowContactDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const contactsPerPage = 3;

  useEffect(() => {
    if (user) {
      fetchDeveloperAndContacts();
    }
  }, [user]);

  const fetchDeveloperAndContacts = async () => {
    try {
      // Fetch developer info
      const { data: devData } = await supabase
        .from('developers')
        .select('name')
        .eq('user_id', user?.id)
        .single();

      if (devData) {
        setDeveloper(devData);
      }

      // Fetch contacts with company info
      const { data: contactsData } = await supabase
        .from('contacts')
        .select(`
          id,
          message,
          read,
          created_at,
          company_id,
          companies!inner (
            name,
            logo_url,
            contact_email
          )
        `)
        .eq('developer_id', (await supabase
          .from('developers')
          .select('id')
          .eq('user_id', user?.id)
          .single()).data?.id)
        .order('created_at', { ascending: false });

      if (contactsData) {
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact);
    setShowContactDetail(true);
  };

  const handleMarkAsRead = (contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? { ...contact, read: true } : contact
    ));
  };

  // Pagination logic
  const totalPages = Math.ceil(contacts.length / contactsPerPage);
  const startIndex = (currentPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const currentContacts = contacts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
            {loading ? '¡Éxitos!' : `¡Éxitos ${developer?.name || ''}!`}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manten actualizado tu perfil para que las empresas se contacten contigo.
          </p>
        </div>

        {/* Contacts Section */}
        {contacts.length > 0 && (
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-6">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Contactos de Empresas</h2>
              {contacts.filter(c => !c.read).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {contacts.filter(c => !c.read).length} nuevos
                </Badge>
              )}
            </div>
            
            <div className="grid gap-4">
              {currentContacts.map((contact) => (
                <Card key={contact.id} className={`transition-all duration-300 hover:shadow-lg ${!contact.read ? 'ring-2 ring-primary/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {contact.companies.logo_url ? (
                          <img 
                            src={contact.companies.logo_url} 
                            alt={`${contact.companies.name} logo`}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {contact.companies.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{contact.companies.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(contact.created_at).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!contact.read && (
                          <Badge variant="secondary" className="text-xs">
                            Nuevo
                          </Badge>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewContact(contact)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}

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
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
              <Button 
                variant="hero" 
                className="px-8 py-4 text-lg transform transition-transform duration-200 hover:scale-105"
                onClick={() => navigate('/profile/developer')}
              >
                Ir a Mi Perfil
              </Button>
        </div>
      </div>
      
      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={showContactDetail}
        onClose={() => setShowContactDetail(false)}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}