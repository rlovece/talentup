import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Building2, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const companyProfileSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  contact_email: z.string().email('Email inválido'),
  description: z.string().optional().or(z.literal('')),
  sector: z.string().optional().or(z.literal(''))
});

type CompanyProfileFormData = z.infer<typeof companyProfileSchema>;

interface CompanyProfile {
  id: string;
  name: string | null;
  contact_email: string | null;
  description: string | null;
  sector: string | null;
  logo_url: string | null;
}

export default function CompanyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [uploading, setUploading] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: '',
      contact_email: '',
      description: '',
      sector: ''
    }
  });

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile();
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

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
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

              {/* Sector */}
              <div>
                <Label htmlFor="sector">
                  Sector (opcional)
                </Label>
                <Controller
                  name="sector"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="sector"
                      placeholder="ej: Tecnología, Finanzas, Salud..."
                      className="mt-1"
                    />
                  )}
                />
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
