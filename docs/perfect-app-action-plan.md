# Plan de Acción: Próximos Pasos Ejecutados

Este documento aterriza los cuatro pasos solicitados en el blueprint y los deja listos para ejecutar o socializar.

---

## 1. Validación de la visión y ajuste de OKRs
### Objetivo
Conseguir alineación transversal antes de arrancar el roadmap y capturar ajustes a la visión propuesta.

### Kit preparado
- **Resumen ejecutivo** (1 página):
  - Problemas a resolver por rol.
  - Pilares de la plataforma perfecta.
  - OKRs trimestrales propuestos (`O1` NPS, `O2` verificación, `O3` growth loops).
- **Agenda de workshop (90 min)**:
  1. Contexto y visión (15’)
  2. Revisión de OKRs propuestos (15’)
  3. Breakout por equipos (producto, growth, operaciones, comunidad) para feedback (30’)
  4. Synthesis y ajustes (20’)
  5. Acuerdos y próximos pasos (10’)
- **Plantilla de feedback** (Notion/Sheet):
  - ¿Qué crees que falta para tu rol?
  - Métricas críticas que debemos medir desde el día 1.
  - Riesgos principales y mitigaciones sugeridas.
- **Cadena de aprobación**:
  - Product Lead → Head of Ops → CEO → Consejo Asesor.

### Recomendación
- Enviar pre-read 48h antes.
- Recopilar feedback asíncrono y consolidarlo en la plantilla adjunta.
- Ajustar OKRs en sesión y publicarlos inmediatamente después del workshop.

---

## 2. Owners asignados por frente
| Frente | Owner propuesto | Roles de apoyo | Notas |
| --- | --- | --- | --- |
| Producto & UX | Head of Product | Lead Designer, PMs rol-específicos | Coordina blueprint y design system. |
| Growth & Comunidad | Growth Lead | Community Manager, CRM Specialist | Encargados de referidos, embajadores, PR. |
| Operaciones & Verificación | Ops Lead | Compliance Manager, Support Lead | Garantizan tiempos de verificación, soporte 24/7. |
| Datos & IA | Data Lead | Data Analysts, ML Engineer | Instrumentación, modelos predictivos, dashboards. |
| Expansión Europea | Expansion Manager | Country Leads, Legal Counsel | Localización, partnerships, regulación. |
| Programas Especiales | Strategic Partnerships Manager | Marketing, Embajadores | Sorteo “Vive gratis un año”, alianzas premium. |

### RACI (resumen)
- **Responsable (R)**: Owner del frente.
- **Aprobador (A)**: CEO / Consejo, según decisiones estratégicas.
- **Consultado (C)**: Producto, Legal, Finanzas, Comunidad.
- **Informado (I)**: Todo el equipo vía weekly update.

---

## 3. Backlog detallado listo para importar
### Formato sugerido
- Exportar/Importar a Linear/Jira via CSV con columnas: `Epic`, `Issue`, `Descripción`, `Impacto`, `Esfuerzo`, `Owner`, `Estado`.

### Epics y issues iniciales
| Epic | Issue | Descripción | Impacto | Esfuerzo (pts) | Owner |
| --- | --- | --- | --- | --- | --- |
| Design System 2.0 | DS-01 Tokens fundacionales | Definir tipografía, colores, spacing, estados IA | Alto | 5 | Lead Designer |
|  | DS-02 Librería de componentes | Buttons, cards, banners, modales cross-role | Alto | 8 | Lead Designer |
| Onboarding Premium | ONB-01 Journey Inquilino | Flujo quiz + narrativa, test moderado | Alto | 13 | PM Inquilinos |
|  | ONB-02 Journey Propietario | Checklist documentado, coaching legal | Alto | 8 | PM Propietarios |
| Verificación IA | VER-01 Integración KYC | Seleccionar proveedor + POC | Alto | 13 | Ops Lead |
|  | VER-02 Panel revisores | Timeline, chat interno, etiquetas | Medio | 8 | Ops Lead |
| Growth Loops | GRO-01 Referidos UX | Landing, tracking, modales de invitación (ver `docs/refer-five-friends-plan.md`) | Alto | 8 | Growth Lead |
|  | GRO-02 Sorteo anual | Reglas legales, automatización selección (ver `docs/refer-five-friends-plan.md`) | Medio | 5 | Strategic Partnerships |
|  | GRO-03 Programa Embajadores | Implementar beneficios, CRM y ranking (ver `docs/ambassador-program.md`) | Alto | 8 | Community Manager |
| Comunidad | COM-01 Hub convivencias | Foros, FAQs, moderación | Medio | 8 | Community Manager |
| Data & IA | DAT-01 Instrumentación | Event tracking por rol + dashboard base | Alto | 5 | Data Lead |
|  | DAT-02 Modelos scoring | Compatibilidad + riesgo impago MVP | Medio | 8 | ML Engineer |
| Expansión | EXP-01 Portugal go-live | Localización + partners + legal check | Alto | 13 | Expansion Manager |

*(Los valores son estimaciones iniciales para afinar en planning.)*

### Checklist antes de importar
- Confirmar owners y equipos disponibles.
- Ajustar esfuerzo con ingeniería/diseño.
- Definir criterios de aceptación por issue.
- Mapear dependencias (ej. design system antes de UI final).

---

## 4. Plan de research y medición
### Objetivos
- Validar hipótesis clave de la experiencia perfecta por rol.
- Medir baseline de satisfacción y fricciones actuales.
- Priorizar entregables de alto impacto.

### Metodología
| Actividad | Rol objetivo | Muestra | Formato | Objetivos |
| --- | --- | --- | --- | --- |
| Entrevistas en profundidad | Inquilino, Propietario, Anfitrión | 5 por rol (3 clientes, 2 prospectos) | 60 min, remoto | Motivaciones, bloqueos, deseos. |
| Test de usabilidad prototipo | Todos | 8 participantes (mezcla de roles) | Prototipo Figma + Maze | Validar flujos onboarding y dashboards. |
| Encuesta cuantitativa | Base actual | 200 respuestas | Survey online | NPS, verificación, features deseadas. |
| Diario de convivencia | 3 parejas roommate | 1 semana | Diary study en Notion | Comportamientos, conflictos, recursos usados. |
| Feedback embajadores beta | Hosts y Propietarios estrella | 10 | Panel cerrado + Slack | Evaluar programa embajadores y referidos. |

### Cronograma (S1-S6)
| Semana | Actividades | Entregables |
| --- | --- | --- |
| S1 | Reclutamiento, guiones, configuración herramientas | Screener, scripts, calendario |
| S2 | Entrevistas Inquilinos + Propietarios | Insights preliminares |
| S3 | Entrevistas Anfitriones + Admin, encuesta cuantitativa | Reporte encuesta, highlights |
| S4 | Test de usabilidad prototipo | Video clips, matriz de hallazgos |
| S5 | Diary study convivencia | Informe narrativo, oportunidades |
| S6 | Synthesis general + Prioritización | Mapa de insights → backlog |

### Infraestructura lista
- Herramientas: Figma + Maze, Typeform, Notion, Aircall (entrevistas), Looker/Metabase para dashboards.
- Carpeta compartida: `/research/2024-q2-perfect-app/`.
- Formulario de incentivos preparado (gift cards o crédito en plataforma).

### Métricas de éxito
- 90% de hallazgos integrados al backlog.
- ≥30% de participantes recomiendan la experiencia actual después de mejoras iniciales.
- OKRs ajustados respaldados por datos.

---

## Resumen
- Visión y OKRs listos para validar con formato de workshop y feedback estructurado.
- Owners definidos con tabla RACI y responsabilidades claras.
- Backlog inicial priorizado listo para importar a la herramienta de gestión.
- Plan de research con metodología, cronograma y objetivos para iniciar de inmediato.
