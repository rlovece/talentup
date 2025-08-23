import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Send } from 'lucide-react';

interface ContactDialogProps {
  developerId: string;
  developerName: string;
  children?: React.ReactNode;
}

export function ContactDialog({ developerId, developerName, children }: ContactDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Por favor, escribe un mensaje.",
        variant: "destructive",
      });
      return;
    }

    if (!user || !profile || profile.role !== 'company') {
      toast({
        title: "Error",
        description: "Solo las empresas pueden enviar contactos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, get the company ID
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (companyError) throw companyError;

      // Insert the contact
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          developer_id: developerId,
          company_id: companyData.id,
          message: message.trim(),
        });

      if (contactError) throw contactError;

      toast({
        title: "Contacto enviado",
        description: `Tu mensaje ha sido enviado a ${developerName}.`,
      });

      setMessage('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending contact:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el contacto. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show nothing if user is not a company
  if (!user || !profile || profile.role !== 'company') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="hero" size="lg">
            <MessageCircle className="mr-2 h-5 w-5" />
            Contactar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contactar a {developerName}</DialogTitle>
          <DialogDescription>
            Envía un mensaje personalizado para expresar tu interés en este desarrollador.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensaje</Label>
            <Textarea
              id="message"
              placeholder="Escribe tu mensaje aquí... Por ejemplo: ¡Hola! Me interesa tu perfil para una posición de desarrollador en nuestra empresa. ¿Te gustaría saber más sobre la oportunidad?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              disabled={isLoading}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Contacto
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}