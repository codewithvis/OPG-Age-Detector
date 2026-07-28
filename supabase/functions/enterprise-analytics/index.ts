import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { org_id } = await req.json();

    // Fetch aggregate trends for the entire organization
    const { data: trends, error: trendError } = await supabase
      .from('population_maturity_trends')
      .select('*')
      .in('clinic_id', (await supabase.from('clinics').select('id').eq('org_id', org_id)).data?.map(c => c.id) || []);

    // Fetch clinic-wise performance
    const { data: clinicPerformance } = await supabase
      .from('analyses')
      .select('clinic_id, ai_confidence, dental_age')
      .in('clinic_id', (await supabase.from('clinics').select('id').eq('org_id', org_id)).data?.map(c => c.id) || []);

    return new Response(JSON.stringify({
      trends,
      stats: {
        total_cases: clinicPerformance?.length,
        avg_confidence: clinicPerformance?.reduce((acc, curr) => acc + curr.ai_confidence, 0) / (clinicPerformance?.length || 1)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
