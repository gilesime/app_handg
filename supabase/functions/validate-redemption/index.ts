// supabase/functions/validate-redemption/index.ts
// Called by the business POS system to validate and consume a QR redemption token.
// Auth: API Key (from businesses.api_key column, passed as X-API-Key header)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // ── Authenticate business via API key ─────────────────────────────────────
    const apiKey = req.headers.get('X-API-Key')
    if (!apiKey) throw new Error('API key requerida')

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, is_active')
      .eq('api_key', apiKey)
      .single()

    if (bizError || !business || !business.is_active) {
      throw new Error('API key inválida o negocio inactivo')
    }

    // ── Parse request ─────────────────────────────────────────────────────────
    const { qr_code } = await req.json()
    if (!qr_code) throw new Error('qr_code requerido')

    // ── Find transaction ──────────────────────────────────────────────────────
    const { data: transaction, error: txError } = await supabase
      .from('reward_transactions')
      .select(`
        *,
        offer:business_offers(
          id, title, discount_value, discount_type, business_id, points_cost, xp_cost
        )
      `)
      .eq('qr_code', qr_code)
      .single()

    if (txError || !transaction) throw new Error('Código QR no encontrado')

    // ── Validate status ───────────────────────────────────────────────────────
    if (transaction.status === 'redeemed') {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'Este código ya fue canjeado',
          redeemed_at: transaction.redeemed_at,
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (transaction.status === 'expired' || new Date(transaction.expires_at) < new Date()) {
      // Mark as expired if not already
      await supabase
        .from('reward_transactions')
        .update({ status: 'expired' })
        .eq('id', transaction.id)

      return new Response(
        JSON.stringify({ valid: false, reason: 'El código ha expirado' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Verify the offer belongs to this business ─────────────────────────────
    if (transaction.offer.business_id !== business.id) {
      throw new Error('Este código no pertenece a tu negocio')
    }

    // ── Mark as redeemed (atomic update with status check) ────────────────────
    const { data: updated, error: updateError } = await supabase
      .from('reward_transactions')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', transaction.id)
      .eq('status', 'pending') // Only succeed if still pending (race-condition safe)
      .select()
      .single()

    if (updateError || !updated) {
      throw new Error('No se pudo procesar el canje (posible uso concurrente)')
    }

    // ── Increment offer redemption count ──────────────────────────────────────
    await supabase.rpc('increment_offer_redemptions', { p_offer_id: transaction.offer.id })

    // ── Deduct XP/points from user ────────────────────────────────────────────
    if (transaction.offer.xp_cost) {
      await supabase.rpc('deduct_user_xp', {
        p_user_id: transaction.user_id,
        p_xp: transaction.offer.xp_cost
      })
    }

    return new Response(
      JSON.stringify({
        valid: true,
        transaction_id: transaction.id,
        offer_title: transaction.offer.title,
        discount_value: transaction.offer.discount_value,
        discount_type: transaction.offer.discount_type,
        user_id: transaction.user_id,
        redeemed_at: updated.redeemed_at,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
