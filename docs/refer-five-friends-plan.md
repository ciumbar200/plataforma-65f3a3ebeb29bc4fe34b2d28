# Campaña “Invita a 5 amigos y vive gratis”

## 1. Resumen
- **Landing**: `https://plataforma.app/refer`
- **Promesa**: invita a 5 amistades a unirse a la plataforma; al completar verificación + primer contrato, participas en el sorteo “Vive gratis un año”.
- **Mercados foco**: España, Portugal, Francia (fase 1).

## 2. Mecánica
1. Usuario genera link personal desde la app (`/referrals`).
2. Cada referido debe:
   - Registrarse y seleccionar rol principal.
   - Completar verificación (identidad/property si aplica).
   - Cerrar primer contrato de convivencia o alquiler a través de la plataforma.
3. Una vez se contabilizan 5 referidos válidos:
   - El usuario recibe recompensa inmediata (crédito 150 € en la plataforma).
   - Se obtiene un pase para el sorteo anual “Vive gratis un año” (cubrir alquiler hasta 12 000 €, usuario paga gastos).

## 3. Incentivos adicionales
- Bonos parciales: por cada referido que llegue a verificación → 20 € en créditos.
- Tabla de líderes mensual con premios secundarios (equipamiento hogar, suscripciones).
- Bonus “team”: permitir a embajadores invitar en grupo y compartir recompensas.

## 4. Cumplimiento legal y transparencia
- Reglas publicadas en landing + PDF descargable.
- Control de fraude (verificación IP, doc, supabase triggers).
- Sorteo certificado ante notario en España; comunicados previos y posteriores en blog + redes.
- Consentimiento para uso de imagen del/la ganador/a.

## 5. Flujo UX/UI
- Dashboard con contador: `Referidos verificados / 5`.
- Barra de progreso animada y celebraciones (copys motivacionales).
- Acceso a materiales listos para compartir (texto, imagen, stories, QR).
- Sección “Estado de tus amigos” con privacidad (solo etapas, sin datos sensibles).
- Notificaciones push/email cuando un referido avanza de etapa.

## 6. Arquitectura técnica
- Tabla `public.referral_links`: almacena código, owner, fecha.
- Tabla `public.referrals`: enlaza a usuarios invitados, estado, timestamp.
- Webhooks Supabase → colas (verifier) para actualizar estados.
- Jobs cron para validar condiciones y generar tickets del sorteo.
- Integración con CRM para seguimiento y comunicación.

## 7. Roadmap ejecución
| Semana | Acción | Owner |
| --- | --- | --- |
| S1 | Diseñar landing, modales, emails | Producto + Diseño |
| S1 | Crear tablas Supabase + funciones de tracking | Ingeniería Backend |
| S2 | Integrar front con API, test QA | Frontend |
| S2 | Redactar reglas legales y FAQ | Legal & Compliance |
| S3 | Lanzamiento beta (usuarios top) | Growth |
| S4 | Lanzamiento general + campaña paid | Marketing |
| S5 | Publicar tabla de líderes, optimizaciones | Growth & Datos |

## 8. Métricas clave
- 30% de usuarios activos generan ≥1 invitación.
- 12% de referidos cierran contrato en 60 días.
- CAC vía referidos 40% menor al promedio de paid.
- +10 puntos de NPS entre usuarios que participan.

## 9. Recursos listos
- Plantillas de email/social en `docs/assets/refer-kit/`.
- Script automatizado para seleccionar ganadores (`scripts/select-referral-winner.ts` TBD).
- Panel de métricas (Looker/Metabase) con filtros por país y cohorte.

