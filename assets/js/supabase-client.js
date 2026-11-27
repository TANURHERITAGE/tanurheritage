/**
 * Supabase Client Integration for The Tanur Heritage
 * Handles cloud database storage for registrations and storage bucket for attached proposals.
 */

window.TANUR_SUPABASE_CONFIG = window.TANUR_SUPABASE_CONFIG || {
  url: 'https://njsyqosawayoqsftcfpk.supabase.co',
  anonKey: 'sb_publishable_yQv--nQGzo76VwHFkw2rww_CNcU_TQl',
  bucketName: 'proposals',
  tableName: 'carnival_registrations'
};

var _supabaseClientInstance = null;

function getSupabaseClient() {
  if (_supabaseClientInstance) return _supabaseClientInstance;
  var cfg = window.TANUR_SUPABASE_CONFIG || {};
  if (!cfg.url || !cfg.anonKey) {
    return null;
  }
  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    _supabaseClientInstance = window.supabase.createClient(cfg.url, cfg.anonKey);
    return _supabaseClientInstance;
  }
  return null;
}

/**
 * Upload an attached proposal file to Supabase Storage Bucket
 * @param {File} file
 * @param {string} prefix
 * @returns {Promise<{name: string, size: number, path: string, url: string}|null>}
 */
async function uploadProposalFileToSupabase(file, prefix) {
  var client = getSupabaseClient();
  if (!client || !file) return null;

  try {
    var bucket = (window.TANUR_SUPABASE_CONFIG && window.TANUR_SUPABASE_CONFIG.bucketName) || 'proposals';
    var cleanPrefix = (prefix || 'proposal').replace(/[^a-zA-Z0-9_-]/g, '_');
    var timestamp = Date.now();
    var safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    var filePath = cleanPrefix + '/' + timestamp + '_' + safeFileName;

    var uploadRes = await client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadRes.error) {
      console.warn('Supabase file upload error:', uploadRes.error.message);
      return null;
    }

    var publicUrlData = client.storage.from(bucket).getPublicUrl(filePath);
    var publicUrl = publicUrlData && publicUrlData.data ? publicUrlData.data.publicUrl : '';

    return {
      name: file.name,
      size: file.size,
      path: filePath,
      url: publicUrl
    };
  } catch (err) {
    console.warn('Supabase storage exception:', err);
    return null;
  }
}

/**
 * Save registration record to Supabase Database
 * @param {Object} regData
 * @returns {Promise<Object|null>}
 */
async function saveRegistrationToSupabase(regData) {
  var client = getSupabaseClient();
  if (!client) return null;

  try {
    var table = (window.TANUR_SUPABASE_CONFIG && window.TANUR_SUPABASE_CONFIG.tableName) || 'carnival_registrations';
    var payload = {
      type: regData.type || 'participant',
      programme: regData.programme || 'RESEARCH CONCLAVE',
      name: regData.name || '',
      whatsapp: regData.whatsapp || '',
      email: regData.email || '',
      institution: regData.institution || '',
      topic: regData.topic || null,
      proposal_files: regData.proposal_files || (regData.files ? regData.files : []),
      status: 'pending'
    };

    var res = await client.from(table).insert([payload]).select();
    if (res.error) {
      console.warn('Supabase insert error:', res.error.message);
      return null;
    }
    return res.data && res.data[0] ? res.data[0] : true;
  } catch (err) {
    console.warn('Supabase DB exception:', err);
    return null;
  }
}

/**
 * Fetch registrations from Supabase (for Admin Dashboard)
 * @returns {Promise<Array>}
 */
async function fetchSupabaseRegistrations() {
  var client = getSupabaseClient();
  if (!client) return [];

  try {
    var table = (window.TANUR_SUPABASE_CONFIG && window.TANUR_SUPABASE_CONFIG.tableName) || 'carnival_registrations';
    var res = await client
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (res.error) {
      console.warn('Supabase fetch error:', res.error.message);
      return [];
    }
    return res.data || [];
  } catch (err) {
    console.warn('Supabase fetch exception:', err);
    return [];
  }
}
