import { supabase } from '../services/supabase';

export const getClinics = async (orgId: string) => {
  const { data, error } = await supabase
    .from('clinics')
    .select('*, practitioners:profiles(count), scans:analyses(count)')
    .eq('org_id', orgId);

  if (error) throw error;
  return data;
};

export const createClinic = async (orgId: string, name: string, location: string) => {
  const { data, error } = await supabase
    .from('clinics')
    .insert({ org_id: orgId, name, location })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getPractitionersByClinic = async (clinicId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('clinic_id', clinicId);

  if (error) throw error;
  return data;
};

export const searchPractitioner = async (licenseIdOrEmail: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`dental_license_student_id.eq.${licenseIdOrEmail},email_id.eq.${licenseIdOrEmail}`)
    .single();

  if (error) throw error;
  return data;
};

export const assignPractitionerToClinic = async (practitionerId: string, clinicId: string, orgId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ clinic_id: clinicId, org_id: orgId })
    .eq('id', practitionerId);

  if (error) throw error;
};

export const getMaturityTrends = async (orgId: string) => {
  const { data, error } = await supabase
    .from('population_maturity_trends')
    .select('*')
    .in('clinic_id', (await supabase.from('clinics').select('id').eq('org_id', orgId)).data?.map(c => c.id) || []);

  if (error) throw error;
  return data;
};
