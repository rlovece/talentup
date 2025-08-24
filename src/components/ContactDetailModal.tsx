import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Calendar, Building2, MessageSquare, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

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

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead?: (contactId: string) => void;
}

export function ContactDetailModal({ contact, isOpen, onClose, onMarkAsRead }: ContactDetailModalProps) {
  useEffect(() => {
    if (contact && !contact.read && isOpen) {
      markAsRead();
    }
  }, [contact, isOpen]);

  const markAsRead = async () => {
    if (!contact) return;
    
    try {
      await supabase
        .from('contacts')
        .update({ read: true })
        .eq('id', contact.id);
      
      onMarkAsRead?.(contact.id);
    } catch (error) {
      console.error('Error marking contact as read:', error);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Detalle del Contacto</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                {contact.companies.logo_url ? (
                  <img 
                    src={contact.companies.logo_url} 
                    alt={`${contact.companies.name} logo`}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {contact.companies.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold">{contact.companies.name}</h3>
                    {!contact.read && (
                      <Badge variant="destructive" className="text-xs">
                        Nuevo
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{contact.companies.contact_email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      Enviado el {new Date(contact.created_at).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h4 className="text-lg font-semibold">Mensaje</h4>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {contact.message}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            <Button 
              variant="default"
              onClick={() => window.open(`mailto:${contact.companies.contact_email}`, '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Responder
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}