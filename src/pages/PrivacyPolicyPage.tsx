import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';

interface PageProps {
  onHomeClick: () => void;
  onLoginClick: () => void;
  onOwnersClick: () => void;
  onBlogClick: () => void;
  onAboutClick: () => void;
  onPrivacyClick: () => void;
  onTermsClick: () => void;
  onContactClick: () => void;
  onSilverClick?: () => void;
  onCalculadoraClick?: () => void;
  onAmbassadorsClick?: () => void;
  onReferFriendsClick?: () => void;
  onBlueprintClick?: () => void;
}

const PrivacyPolicyPage: React.FC<PageProps> = ({
    onHomeClick,
    onLoginClick,
    onOwnersClick,
    onBlogClick,
    onAboutClick,
    onPrivacyClick,
    onTermsClick,
    onContactClick,
    onSilverClick,
    onCalculadoraClick,
    onAmbassadorsClick,
    onReferFriendsClick,
    onBlueprintClick,
}) => {

    const footerProps = {
        onBlogClick,
        onAboutClick,
        onPrivacyClick,
        onTermsClick,
        onContactClick,
        onOwnersClick,
        onSilverClick,
        onAmbassadorsClick,
        onReferFriendsClick,
        onBlueprintClick,
    };

    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white flex flex-col">
            <Header
                onLoginClick={onLoginClick}
                onHomeClick={onHomeClick}
                onOwnersClick={onOwnersClick}
                onBlogClick={onBlogClick}
                onSilverClick={onSilverClick}
                onCalculadoraClick={onCalculadoraClick}
                onAmbassadorsClick={onAmbassadorsClick}
                onReferFriendsClick={onReferFriendsClick}
                onBlueprintClick={onBlueprintClick}
                pageContext="inquilino"
            />
            <main className="flex-grow py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <GlassCard>
                        <div className="prose prose-invert prose-lg max-w-none text-white/80">
                            <h1 className="text-white">Política de Privacidad</h1>
                            <p><em>Última actualización: 24 de julio de 2024</em></p>

                            <p>En MoOn, tu privacidad es fundamental. Esta Política de Privacidad describe cómo <strong>Moon Shared Living S.L.</strong> ("nosotros", "nuestro" o "MoOn") recopila, utiliza, comparte y protege tu información personal cuando utilizas nuestra plataforma web.</p>
                            
                            <h2 className="text-white">1. Responsable del Tratamiento</h2>
                            <p>El responsable del tratamiento de tus datos personales es:</p>
                            <ul>
                                <li><strong>Razón Social:</strong> Moon Shared Living S.L.</li>
                                <li><strong>CIF:</strong> B12345678</li>
                                <li><strong>Domicilio Social:</strong> Passeig de Gràcia 50, 08007 Barcelona, España.</li>
                                <li><strong>Email de Contacto:</strong> <a href="mailto:privacy@moonsharedliving.com" className="text-cyan-400 hover:underline">privacy@moonsharedliving.com</a></li>
                            </ul>

                            <h2 className="text-white">2. ¿Qué datos recopilamos?</h2>
                            <p>Recopilamos la siguiente información:</p>
                            <ul>
                                <li><strong>Datos de identificación y contacto:</strong> Nombre, apellidos, email, número de teléfono.</li>
                                <li><strong>Datos de perfil:</strong> Edad, ciudad, biografía, fotografías, vídeo de presentación, intereses, hábitos de vida (nivel de ruido, estilo de vida), objetivo de alquiler, etc.</li>
                                <li><strong>Datos de propiedades (para propietarios):</strong> Dirección, características del inmueble, fotografías, precio, condiciones.</li>
                                <li><strong>Datos de uso y técnicos:</strong> Dirección IP, tipo de navegador, interacciones con la plataforma (perfiles vistos, matches, mensajes).</li>
                            </ul>

                            <h2 className="text-white">3. Finalidad del tratamiento</h2>
                            <p>Utilizamos tus datos para las siguientes finalidades:</p>
                            <ul>
                                <li><strong>Prestar el servicio:</strong> Crear y gestionar tu cuenta, y permitir la búsqueda y conexión entre inquilinos y propietarios.</li>
                                <li><strong>Calcular la compatibilidad:</strong> Nuestro algoritmo utiliza tus datos de perfil para encontrar los "matches" más adecuados.</li>
                                <li><strong>Comunicación:</strong> Enviarte notificaciones sobre el servicio (nuevos matches, mensajes, alertas) y, si lo has consentido, comunicaciones comerciales.</li>
                                <li><strong>Seguridad y mejora:</strong> Prevenir el fraude, mejorar la seguridad de la plataforma y analizar el uso para optimizar nuestros servicios.</li>
                            </ul>

                            <h2 className="text-white">4. Legitimación</h2>
                            <p>La base legal para el tratamiento de tus datos es:</p>
                            <ul>
                                <li>La <strong>ejecución de un contrato</strong> (nuestros Términos de Servicio) para prestarte el servicio solicitado.</li>
                                <li>Tu <strong>consentimiento explícito</strong> para el tratamiento de datos sensibles (como hábitos de vida) y para el envío de comunicaciones de marketing.</li>
                                <li>Nuestro <strong>interés legítimo</strong> en garantizar la seguridad y mejorar nuestra plataforma.</li>
                            </ul>

                            <h2 className="text-white">5. ¿Con quién compartimos tus datos?</h2>
                            <p>Tus datos podrán ser compartidos con:</p>
                            <ul>
                                <li><strong>Otros usuarios de la plataforma:</strong> Tu perfil (sin datos de contacto directo como email o teléfono) será visible para otros usuarios con el fin de facilitar los "matches".</li>
                                <li><strong>Proveedores de servicios:</strong> Empresas que nos prestan servicios como alojamiento web, análisis de datos o pasarelas de pago, siempre bajo estrictos acuerdos de confidencialidad.</li>
                                <li><strong>Autoridades competentes:</strong> En caso de requerimiento legal.</li>
                            </ul>
                            <p>No vendemos tus datos personales a terceros.</p>
                            
                            <h2 className="text-white">6. Derechos del usuario</h2>
                            <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad de tus datos enviando un email a <a href="mailto:privacy@moonsharedliving.com" className="text-cyan-400 hover:underline">privacy@moonsharedliving.com</a>. También tienes derecho a retirar tu consentimiento en cualquier momento y a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD).</p>
                        </div>
                    </GlassCard>
                </div>
            </main>
            <Footer {...footerProps} />
        </div>
    );
};

export default PrivacyPolicyPage;
