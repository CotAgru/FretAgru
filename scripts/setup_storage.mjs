import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '../frontend/.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  console.log('🔧 Configurando Supabase Storage para romaneios-img...\n')

  try {
    // Verificar se bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError)
      return
    }

    const bucketExists = buckets.some(b => b.name === 'romaneios-img')
    
    if (!bucketExists) {
      console.log('📦 Criando bucket romaneios-img...')
      const { error: createError } = await supabase.storage.createBucket('romaneios-img', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      })
      
      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError)
        return
      }
      console.log('✅ Bucket criado com sucesso!')
    } else {
      console.log('✅ Bucket romaneios-img já existe')
      
      // Atualizar configuração para público
      console.log('🔧 Garantindo que bucket seja público...')
      const { error: updateError } = await supabase.storage.updateBucket('romaneios-img', {
        public: true
      })
      
      if (updateError) {
        console.log('⚠️ Aviso ao atualizar bucket:', updateError.message)
      } else {
        console.log('✅ Bucket configurado como público')
      }
    }

    console.log('\n✅ Configuração concluída!')
    console.log('\n📌 IMPORTANTE:')
    console.log('1. Acesse o painel do Supabase Storage')
    console.log('2. Verifique se o bucket "romaneios-img" está marcado como PÚBLICO')
    console.log('3. Verifique as políticas de acesso (RLS) se necessário')
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err)
  }
}

setupStorage()
