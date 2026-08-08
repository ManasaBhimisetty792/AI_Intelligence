import { supabase, isSupabaseConfigured } from './supabaseClient';

export const storageService = {
  async uploadFile(bucket, path, file) {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
      return publicData.publicUrl;
    }
    return URL.createObjectURL(file);
  },

  async deleteFile(bucket, path) {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw error;
    }
    return true;
  },
};

export default storageService;
