import { supabase } from '../api/supabase'

/**
 * Sube `file` al bucket `bucket` y devuelve la URL pública.
 * Lanza error si algo falla.
 */
export async function uploadAndGetUrl(bucket, file) {
  const filePath = `${Date.now()}_${file.name}`

  // 1️⃣ Subida
  const { error: uploadError } = await supabase
    .storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600' })
  if (uploadError) {
    console.error('storage.upload error:', uploadError)
    throw uploadError
  }

  // 2️⃣ Obtener URL pública
  const { data, error: urlError } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(filePath)
  if (urlError) {
    console.error('getPublicUrl error:', urlError)
    throw urlError
  }

  return data.publicUrl  
}
