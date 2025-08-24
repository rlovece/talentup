import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { REQUIRE_EMAIL_CONFIRM_ON_CHANGE } from '@/config/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Building2, Mail, ArrowLeft, X, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmailChangeConfirmModal } from '@/components/EmailChangeConfirmModal';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';
import { AppHeader } from '@/components/AppHeader';

const companyProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contact_email: z.string().email('Email inválido'),
  description: z.string().optional().or(z.literal('')),
  sector: z.string().min(1, 'Selecciona al menos un sector').optional().or(z.literal(''))
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

interface Sector {
  id: string;
  name: string;
}

interface CompanyProfile {
  id: string;
  name: string | null;
  contact_email: string | null;
  description: string | null;
  sector: string | null;
  logo_url: string | null;
}

export default function CompanyProfile() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [availableSectors, setAvailableSectors] = useState<Sector[]>([]);
  const [sectorInput, setSectorInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState<any>(null);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: '',
      contact_email: '',
      description: '',
      sector: ''
    }
  });

  // Load profile data and available sectors
  useEffect(() => {
    if (user) {
      loadProfile();
      loadSectors();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setValue('name', data.name || '');
        setValue('contact_email', data.contact_email || '');
        setValue('description', data.description || '');
        setValue('sector', data.sector || '');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el perfil',
        variant: 'destructive'
      });
    }
  };

  const loadSectors = async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('name');

      if (error) throw error;
      setAvailableSectors(data || []);
    } catch (error: any) {
      console.error('Error loading sectors:', error);
    }
  };

  const addSector = async (sectorName: string) => {
    if (!sectorName.trim()) return;

    // Check if sector already exists
    const existingSector = availableSectors.find(s => 
      s.name.toLowerCase() === sectorName.toLowerCase()
    );

    if (existingSector) {
      // Set the sector directly (single selection)
      setValue('sector', existingSector.name);
    } else {
      // Create new sector
      try {
        const { data, error } = await supabase
          .from('sectors')
          .insert({ name: sectorName.trim() })
          .select()
          .single();

        if (error) throw error;

        setAvailableSectors(prev => [...prev, data]);
        setValue('sector', data.name);

        toast({
          title: 'Sector añadido',
          description: `"${data.name}" se ha añadido a la base de datos`
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudo añadir el sector',
          variant: 'destructive'
        });
      }
    }
    setSectorInput('');
  };

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    if (!user) throw new Error('No user found');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleLogoChange = async (file: File) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const logoUrl = await uploadFile(file, 'logos');
      
      // Update the profile in the database immediately
      const { error } = await supabase
        .from('companies')
        .update({
          user_id: user.id,
          logo_url: logoUrl,
          // Keep existing data
          name: profile?.name,
          contact_email: profile?.contact_email,
          description: profile?.description,
          sector: profile?.sector
        })
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, logo_url: logoUrl } : null);

      toast({
        title: 'Logo actualizado',
        description: 'Tu logo se ha guardado correctamente'
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo subir el logo',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: CompanyProfileFormData) => {
    if (!user) return;

    setLoading(true);

    try {
      // Check if email has changed
      const emailChanged = data.contact_email !== profile?.contact_email && data.contact_email !== user.email;

      if (emailChanged) {
        // Show confirmation modal before changing email
        setPendingEmailData(data);
        setShowEmailConfirm(true);
        setLoading(false);
        return;
      }

      // Update or create company profile
      const profileData = {
        user_id: user.id,
        name: data.name,
        contact_email: data.contact_email,
        description: data.description || null,
        sector: data.sector || null,
        logo_url: profile?.logo_url // Logo is updated separately
      };

      const { error } = await supabase
        .from('companies')
        .update(profileData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil se ha guardado correctamente'
      });

      // Reload profile
      loadProfile();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el perfil',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChangeConfirm = async () => {
    if (!pendingEmailData) return;
    
    setLoading(true);
    setShowEmailConfirm(false);
    
    try {
      if (REQUIRE_EMAIL_CONFIRM_ON_CHANGE) {
        const { error: authError } = await supabase.auth.updateUser({
          email: pendingEmailData.contact_email
        });
        if (authError) {
          throw new Error(`Error al actualizar email de autenticación: ${authError.message}`);
        }
      } else {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('update-user-email', {
          body: { newEmail: pendingEmailData.contact_email },
        });
        if (fnError) {
          throw new Error(fnError.message || 'No se pudo actualizar el email sin confirmación');
        }
      }

      toast({
        title: 'Email actualizado',
        description: REQUIRE_EMAIL_CONFIRM_ON_CHANGE
          ? 'Se ha enviado un email de confirmación a tu nueva dirección. Confirma el cambio para completar la actualización.'
          : 'Tu email de autenticación se actualizó inmediatamente.',
        duration: 5000
      });

      // Continue with the rest of the profile update
      await completeProfileUpdate(pendingEmailData);
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el email',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setPendingEmailData(null);
    }
  };

  const completeProfileUpdate = async (data: any) => {
    try {
      // Update or create company profile
      const profileData = {
        user_id: user.id,
        name: data.name,
        contact_email: data.contact_email,
        description: data.description || null,
        sector: data.sector || null,
        logo_url: profile?.logo_url // Logo is updated separately
      };

      const { error } = await supabase
        .from('companies')
        .update(profileData)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil se ha guardado correctamente'
      });

      // Reload profile
      loadProfile();
    } catch (error: any) {
      throw error;
    }
  };

  const filteredSectors = availableSectors.filter(sector =>
    sector.name.toLowerCase().includes(sectorInput.toLowerCase()) &&
    sector.name !== watch('sector')
  );

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-6 w-6 text-primary" />
                Perfil de Empresa
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/welcome/company')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Logo Section */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage 
                    src={profile?.logo_url || ''} 
                    alt="Logo" 
                  />
                  <AvatarFallback className="text-lg">
                    {watch('name')?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-center space-y-2">
                  <Label htmlFor="logo" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                      <Upload className="h-4 w-4" />
                      {uploading ? 'Subiendo...' : (profile?.logo_url ? 'Cambiar Logo' : 'Añadir Logo')}
                    </div>
                  </Label>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleLogoChange(file);
                      }
                    }}
                  />
                  {profile?.logo_url && (
                    <p className="text-xs text-muted-foreground text-center">
                      Haz clic para cambiar tu logo
                    </p>
                  )}
                </div>
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Nombre de la empresa
                  </Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder="Nombre de tu empresa"
                        className="mt-1"
                      />
                    )}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="contact_email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email de contacto
                  </Label>
                  <Controller
                    name="contact_email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="contact_email"
                        type="email"
                        placeholder="contacto@empresa.com"
                        className="mt-1"
                      />
                    )}
                  />
                  {errors.contact_email && (
                    <p className="text-sm text-destructive mt-1">{errors.contact_email.message}</p>
                  )}
                </div>
              </div>

              {/* Sector Section */}
              <div>
                <Label className="text-base font-medium">Sector</Label>
                
                {/* Current Sector */}
                {watch('sector') && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-4">
                    <Badge variant="secondary" className="px-3 py-1">
                      {watch('sector')}
                      <button
                        type="button"
                        onClick={() => setValue('sector', '')}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  </div>
                )}

                {/* Sector Input */}
                <div className="flex gap-2">
                  <Input
                    value={sectorInput}
                    onChange={(e) => setSectorInput(e.target.value)}
                    placeholder="Escribe un sector..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSector(sectorInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addSector(sectorInput)}
                    variant="outline"
                  >
                    Añadir
                  </Button>
                </div>

                {/* Sector Suggestions */}
                {sectorInput && (
                  <div className="mt-2">
                    <div className="max-h-32 overflow-y-auto border rounded-md bg-card">
                      {availableSectors
                        .filter(sector => 
                          sector.name.toLowerCase().includes(sectorInput.toLowerCase()) &&
                          sector.name !== watch('sector')
                        )
                        .slice(0, 10)
                        .map(sector => (
                        <button
                          key={sector.id}
                          type="button"
                          onClick={() => {
                            setValue('sector', sector.name);
                            setSectorInput('');
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                        >
                          {sector.name}
                        </button>
                      ))}
                      {sectorInput && !availableSectors.some(s => 
                        s.name.toLowerCase() === sectorInput.toLowerCase()
                      ) && (
                        <div className="px-3 py-2 text-sm text-muted-foreground border-t">
                          Presiona "Añadir" para crear "{sectorInput}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {errors.sector && (
                  <p className="text-sm text-destructive mt-1">{errors.sector.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">
                  Descripción de la empresa (opcional)
                </Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Describe tu empresa, sus servicios y valores..."
                      className="mt-1 min-h-[100px]"
                      rows={4}
                    />
                  )}
                />
              </div>

              {/* Security Section */}
              <div className="border-t pt-6">
                <Label className="text-base font-medium">Seguridad</Label>
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowChangePassword(true)}
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Cambiar contraseña
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={loading || uploading}
                  size="lg"
                >
                  {loading ? 'Guardando...' : 'Guardar Perfil'}
                </Button>
              </div>
            </form>

            <EmailChangeConfirmModal
              isOpen={showEmailConfirm}
              onClose={() => {
                setShowEmailConfirm(false);
                setPendingEmailData(null);
              }}
              onConfirm={handleEmailChangeConfirm}
              currentEmail={user?.email || ''}
              newEmail={pendingEmailData?.contact_email || ''}
            />

            <ChangePasswordModal
              isOpen={showChangePassword}
              onClose={() => setShowChangePassword(false)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

