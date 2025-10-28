# 🌙 MoOn – Verificación manual (modo fácil)

¡Hola! Aquí tienes los pasos super sencillos para probar el MVP de verificación manual sin gastar nada extra.

---

## 🧩 Paso 1 – Lo necesario

1. **Node.js 18+** instalado.
2. **Cuenta Supabase** con:
   - Proyecto creado.
   - Tablas `profiles` y `properties` ya existentes (vienen del proyecto).
3. **Bucket privado** en Storage llamado `verifications`.

---

## ⚙️ Paso 2 – Variables mágicas

Coloca estos valores en un archivo `.env.local` en la raíz:

```bash
VITE_SUPABASE_URL=tu-url-de-supabase
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

En Supabase (Project → Settings → API) copia los valores reales.

---

## ✉️ Configura las notificaciones con SendGrid

En Supabase → Edge Functions → Settings → Environment variables añade:

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME` *(opcional)*
- `SENDGRID_TEMPLATE_ID_INQUILINO`
- `SENDGRID_TEMPLATE_ID_PROPIETARIO`
- `SENDGRID_TEMPLATE_ID_MATCH`
- `SENDGRID_ADMIN_TO_EMAIL` → pon `hello@moonsharedliving.com`
- `SENDGRID_TEMPLATE_ID_ADMIN_NEW_TENANT`
- `SENDGRID_TEMPLATE_ID_ADMIN_NEW_PROPERTY`

Con estas variables las funciones enviarán el email de bienvenida, el aviso de match y las nuevas alertas internas para inquilinos y propiedades públicas.

---

## 💾 Paso 3 – Tablas y políticas

1. Abre Supabase → SQL Editor.
2. Copia todo el contenido de `supabase/schema.sql`.
3. Ejecuta la consulta (esto crea la tabla `verifications` y las políticas RLS).
4. En Storage → bucket `verifications` → Policies, pega las dos reglas que ves comentadas en ese mismo archivo.

---

## 📦 Paso 4 – Modelos (para más adelante)

En `public/models/faceapi/README_MODELS.txt` te recordamos dónde irían los modelos si más adelante quieres reconocimiento facial. Por ahora no necesitas descargar nada.

---

## 🧪 Paso 5 – Probar en local

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Arranca la app:
   ```bash
   npm run dev
   ```
3. Entra con un usuario de prueba.
4. Ve a **Perfil** para identidad y a **Propiedades** (detalle de cada propiedad) para justificar titularidad:
   - En Perfil ➝ “Verificar identidad”: documento + selfie.
   - En Propiedades ➝ abre una propiedad ➝ tarjeta “Verificar propiedad”: dirección + justificante.
5. En Supabase revisa `profiles` y marca `verification_status = 'approved'` cuando quieras mostrar el check.

---

## 🔐 Recordatorio RGPD

- ✅ Pide consentimiento (ya está en los formularios).
- ✅ Archivos en bucket privado.
- 🗑️ Borra los ficheros pasados 90 días / cuando termines la verificación.
- 🔒 Solo el equipo autorizado debería verlos (panel Supabase con service role).

---

¡Listo! Con esto tienes un flujo manual, rápido y sin servicios externos. Cuando quieras añadir OCR o reconocimiento, podrás reutilizar esta base. 😊

---

## ✨ Quiz de convivencia “Mi Vibra MoOn”

Para que el algoritmo entienda mejor a cada persona y los matches sean más deseados, añadimos un onboarding tipo test de 15 preguntas + foto obligatoria.

### Qué hace el nuevo flujo

- Solicita una foto de perfil cálida antes de empezar (se guarda en Supabase Storage).
- Muestra 15 tarjetas con preguntas de convivencia y 4 respuestas muy visuales.
- Registra cada answer en la tabla `profile_quiz_answers` y genera un `convivencia_persona` con los hashtags dominantes.
- Cuando se completa, marca el perfil con `convivencia_quiz_completed = true` y muestra la vibra en el dashboard de inquilinos y en las tarjetas de candidatos para propietarios/anfitriones.

### Pasos para activarlo

1. **Supabase – Storage**: crea un bucket privado llamado `profile-photos` y añade una policy de lectura pública (o usa la UI para marcar el bucket como público). Ejemplo rápido:
   ```sql
   -- Storage → Policies
   create policy "Public read profile photos"
     on storage.objects for select
     using (bucket_id = 'profile-photos');
   ```
2. **Supabase – SQL**: vuelve a ejecutar `supabase/schema.sql` o, como mínimo, estos bloques nuevos:
   - Nuevas columnas en `profiles` (`convivencia_quiz_completed`, `convivencia_quiz_version`, `convivencia_quiz_completed_at`, `convivencia_persona`).
   - Tabla `profile_quiz_answers` con su constraint única `(user_id, question_id)` y políticas RLS.
3. **Variables de entorno (opcional)**: nada nuevo, pero asegúrate de tener `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` configurados en `.env.local`.
4. **Despliegue**: vuelve a ejecutar `npm run build` y sube la nueva versión a Vercel. No requiere configuración adicional.

### Cómo se muestra

- El quiz aparece automáticamente tras iniciar sesión si el usuario no lo ha completado (roles inquilino, anfitrión o propietario).
- Se puede posponer y vuelve a mostrarse más tarde (se guarda un “snooze” de 12 h en `localStorage`).
- Los propietarios ven los hashtags/summary del grupo en su panel para entender la vibra antes de invitarles.

> TIP: si quieres resetear el quiz de algún usuario basta con poner `convivencia_quiz_completed = false` y borrar sus filas en `profile_quiz_answers`. Al volver a entrar verá el wizard otra vez.

---

## 🚀 Onboarding por roles

Cada rol tiene ahora un onboarding guiado, con progreso guardado paso a paso:

- **Inquilinos** (ruta `tenant-onboarding`): resumen de expectativas, compromisos y acceso directo al quiz.
- **Propietarios** (ruta `owner-onboarding`): definen el inquilino ideal, checklist de documentación y CTA para publicar rápido.
- **Hosts** (ruta `host-onboarding`): ayudan a describir la habitación y establecer reglas básicas antes de mostrarla.

### Qué necesitas configurar

1. Ejecuta de nuevo `supabase/schema.sql` para crear la tabla `onboarding_progress` y los campos `onboarding_status`, `onboarding_step` en `profiles`.
2. Despliega la web (`npm run build` + Vercel) para activar las nuevas páginas.
3. Si tenías usuarios demo, marca manualmente `onboarding_status = 'completed'` si no quieres que vuelvan a ver el wizard.

---

## 🔔 Centro de notificaciones

- Se añadió la tabla `public.notifications` con RLS para que cada rol reciba avisos (nuevos matches, pendientes, recordatorios).
- En cada dashboard aparece una campana con los 5 últimos eventos y contador de no leídos.
- Usa `loadNotifications` (ya incluído en `App.tsx`) para refrescar cuando envíes notificaciones desde un cron/edge function.
- Para marcar una notificación como leída desde la consola basta con actualizar la columna `read_at`.

---

## 📊 Analytics & CRM

- Se agregó `src/lib/analytics.ts` con un wrapper simple que detecta `window.posthog` o `window.gtag`. Solo tienes que inyectar el snippet correspondiente en Vercel para empezar a trackear eventos (`quiz_completed`, `onboarding_step_saved`, `profile_photo_uploaded`).
- FluentCRM sigue sincronizándose al completar perfil; revisa el hook `syncFluentContact` si quieres añadir tags específicos por onboarding.

---

## 🧭 Nuevos “Próximos pasos” en dashboards

- Inquilinos, propietarios y anfitriones verán tarjetas con recomendaciones dinámicas (hacer el quiz, completar perfil, revisar notificaciones, publicar primeras habitaciones…).
- Estas tarjetas se alimentan de los nuevos campos de onboarding, las notificaciones y el estado de cada rol.

---

## Checklist de despliegue (rol por rol)

1. **Supabase**
   - Ejecuta `supabase/schema.sql` (cubre quiz, onboarding y notificaciones).
   - Crea los buckets `verifications` y `profile-photos` con las policies sugeridas.
2. **Variables**
   - `.env.local`: confirma Supabase, y añade tu PostHog `PH_PROJECT_API_KEY` si vas a usar analytics (se puede exponer vía `VITE_POSTHOG_KEY`).
3. **Vercel**
   - `npm run build` → `vercel --prod` (o push a main).
   - Añade PostHog/GA snippet en Settings → Analytics si lo necesitas.
4. **QA manual**
   - Nuevo inquilino → onboarding + quiz, revisar dashboard (next steps + notificaciones).
   - Propietario → onboarding + publicación (ver cards en dashboard, invitaciones con tags de vibra).
   - Host → onboarding + galería, comprobar modal “ver detalle”.
   - Admin → que pueda ver notificaciones en tabla `notifications`.
5. **CRM**
   - Confirma en FluentCRM que los contactos reciben el tag correcto tras completar onboarding/quiz.

Con esto tendrás la experiencia completa adaptada a los tres roles y la base para escalar métricas y nurturing. Si necesitas scripts de carga inicial de notificaciones o automatizar envíos, avísame y los añadimos. 💜

---

## 🔌 Supabase Edge Functions relevantes

- `send-welcome-email`: envía email de bienvenida según rol.
- `veriff-webhook`: valida firma y actualiza verificación.
- `mark-referral-contracted` (nuevo):
  - Método: POST
  - Auth: Bearer JWT de usuario ADMIN (se valida vía RPC `admin_mark_referral_contracted`).
  - Body: `{ "referee_user_id": "<uuid>" }`
  - Efecto: marca `public.referrals` como `contracted`.
- `ambassador-codes` (nuevo):
  - GET: lista códigos paginado (`?page=0&limit=50`) – requiere ADMIN (RLS).
  - POST: crea códigos `{ count?: number, expires_at?: ISO, invited_email?: string }` – requiere ADMIN (RLS).

## ⏰ Cron de automatización (Vercel)

- Añadí un cron cada 5 minutos en `vercel.json` que llama a `/api/automation/trigger`.
- Configura estas variables en Vercel → Project → Settings → Environment Variables:
  - `SUPABASE_FUNCTION_AUTOMATION_URL` → URL pública de tu función `automation-runner` (Supabase)
  - `AUTOMATION_RUNNER_SECRET` → el mismo secreto que usas en la edge function (cabecera `x-automation-secret`)
  - `AUTOMATION_TRIGGER_TOKEN` (opcional) → si quieres proteger el endpoint de Vercel con `x-automation-trigger`
- Si prefieres programarlo en Supabase en lugar de Vercel, crea un Scheduled Function apuntando a `automation-runner` con esa cabecera.

### Utilidad: generar y propagar AUTOMATION_RUNNER_SECRET

Usa el script para generar un secreto fuerte y (opcionalmente) setearlo en Supabase y escribirlo en tu `.env.local`:

```
npm run setup:automation-secret -- --set-supabase --update-local-env --env-file .env.local
```

Opciones útiles:
- `--length 32` y `--encoding base64|hex` para personalizar el formato.
- `--set-supabase` intentará ejecutar `supabase functions secrets set AUTOMATION_RUNNER_SECRET=...` (requiere CLI logueada).
- `--set-vercel` no escribe en Vercel automáticamente, pero imprime el comando CLI: `echo "$SECRET" | vercel env add AUTOMATION_RUNNER_SECRET production`.

Después del secreto:
- Despliega la función si no está: `supabase functions deploy automation-runner`.
- En Vercel añade `SUPABASE_FUNCTION_AUTOMATION_URL` con la URL pública de la función y `AUTOMATION_RUNNER_SECRET` con el mismo valor.

## 🧱 Tablas y RPC de referidos/embajadores

- Tablas: `public.referral_links`, `public.referrals`, `public.ambassador_invites` (RLS activado).
- RPC:
  - `ensure_referral_link(uid)` → crea/devuelve código personal.
  - `attribute_referral(p_code, p_email)` → atribuye referido tras registro.
  - `validate_ambassador_code(p_code)` → valida acceso invite-only.
  - `admin_mark_referral_contracted(p_referee)` → marca como contratado (solo admin).
