import React, { useEffect } from 'react';
import styles from './styles.module.css';
import { captureReferralFromURL } from './referral';

const benefits = [
  {
    title: 'Comisiones recurrentes',
    body: 'Recibe 2€ por cada pago confirmado de tus referidos mientras sigan activos en MoOn.'
  },
  {
    title: 'Enlace único',
    body: 'Comparte tu enlace personal en redes, newsletters o mensajes privados sin restricciones.'
  },
  {
    title: 'Ventana de 90 días',
    body: 'Atribuimos el primer click durante 90 días con cookie y almacenamiento local.'
  }
];

const steps = [
  'Solicita acceso iniciando sesión y generando tu enlace personal.',
  'Comparte tu enlace o código con potenciales usuarios de MoOn.',
  'Gana comisiones automáticas cuando tus referidos completan pagos.'
];

function AffiliatesLanding() {
  useEffect(() => {
    captureReferralFromURL();
  }, []);

  return (
    <div className={styles.wrap}>
      <section className={styles.hero}>
        <div className={styles.badge}>Programa de Afiliados</div>
        <h1 className={styles.h1}>Impulsa MoOn y gana comisiones sostenibles</h1>
        <p className={styles.p}>
          Comparte MoOn con tu comunidad y obtén ingresos recurrentes por cada suscripción activa que
          llegue gracias a ti. Sin mínimos ni permanencias.
        </p>
        <a className={styles.btn} href="/affiliate/portal">
          Entrar al portal de afiliados
        </a>
      </section>

      <section className={`${styles.grid} ${styles.cols3}`}>
        {benefits.map(item => (
          <article key={item.title} className={styles.card}>
            <h3>{item.title}</h3>
            <p className={styles.p}>{item.body}</p>
          </article>
        ))}
      </section>

      <section className={`${styles.grid} ${styles.cols2}`}>
        <article className={styles.card}>
          <h3>Cómo funciona</h3>
          <ol className={styles.p}>
            {steps.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>
        <article className={styles.card}>
          <h3>Preguntas frecuentes</h3>
          <p className={styles.p}>
            ¿Cómo puedo ver mis resultados? Inicia sesión y accede al portal para ver tus referidos,
            pagos confirmados y comisiones calculadas cada mes.
          </p>
          <p className={`${styles.p} ${styles.small}`}>
            ¿Necesito activar algo? No. Esta funcionalidad es opt-in y solo se habilita con el flag
            correspondiente en tu despliegue.
          </p>
        </article>
      </section>
    </div>
  );
}

export default AffiliatesLanding;
