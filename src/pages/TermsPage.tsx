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
}

const TermsPage: React.FC<PageProps> = ({ onHomeClick, onLoginClick, onOwnersClick, onBlogClick, onAboutClick, onPrivacyClick, onTermsClick, onContactClick, onSilverClick }) => {

    const footerProps = { onBlogClick, onAboutClick, onPrivacyClick, onTermsClick, onContactClick, onSilverClick };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white flex flex-col">
            <Header onLoginClick={onLoginClick} onHomeClick={onHomeClick} onOwnersClick={onOwnersClick} pageContext="inquilino" />
            <main className="flex-grow py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <GlassCard>
                        <div className="prose prose-invert prose-lg max-w-none text-white/80">
                            <h1 className="text-white">Términos y Condiciones de Uso</h1>
                            <p><em>Última actualización: 24 de julio de 2024</em></p>

                            <p>Bienvenido a MoOn. Estos Términos y Condiciones ("Términos") rigen tu acceso y uso de la plataforma web y los servicios ofrecidos por <strong>Moon Shared Living S.L.</strong> ("MoOn", "nosotros"). Al registrarte o utilizar nuestros servicios, aceptas cumplir con estos Términos.</p>

                            <h2 className="text-white">1. Descripción del Servicio</h2>
                            <p>MoOn es una plataforma tecnológica que facilita la conexión entre personas que buscan alquilar una vivienda o habitación (Inquilinos) y personas que ofrecen dichas propiedades (Propietarios). Nuestro servicio incluye un algoritmo de compatibilidad para sugerir perfiles afines, pero no actuamos como intermediarios inmobiliarios ni formamos parte de ningún contrato de alquiler.</p>

                            <h2 className="text-white">2. Cuentas de Usuario</h2>
                            <ul>
                                <li>Debes ser mayor de 18 años para crear una cuenta.</li>
                                <li>Te comprometes a proporcionar información veraz, precisa y actualizada en tu perfil. Eres el único responsable de la información que publicas.</li>
                                <li>Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra en tu cuenta.</li>
                            </ul>

                            <h2 className="text-white">3. Obligaciones de los Usuarios</h2>
                            <p>Como usuario de MoOn, te comprometes a:</p>
                            <ul>
                                <li>Utilizar la plataforma de manera lícita y respetuosa.</li>
                                <li>No publicar contenido falso, engañoso, difamatorio, ilegal o que infrinja los derechos de terceros.</li>
                                <li>No utilizar la plataforma para fines comerciales no autorizados, spam o acoso.</li>
                                <li><strong>Para Inquilinos:</strong> Ser honesto en la información de tu perfil para asegurar el correcto funcionamiento del algoritmo de compatibilidad.</li>
                                <li><strong>Para Propietarios:</strong> Asegurar que las propiedades listadas son precisas, están disponibles y cumples con toda la normativa local de alquiler.</li>
                            </ul>

                             <h2 className="text-white">4. Propiedad Intelectual</h2>
                            <p>Todo el contenido de la plataforma, incluyendo el software, diseño, textos, gráficos y logotipos, es propiedad exclusiva de Moon Shared Living S.L. o sus licenciantes. No está permitida su reproducción o distribución sin nuestro consentimiento explícito.</p>
                            
                            <h2 className="text-white">5. Limitación de Responsabilidad</h2>
                            <p>MoOn es una plataforma de conexión. No verificamos personalmente a todos los usuarios ni inspeccionamos las propiedades. Por lo tanto, no nos hacemos responsables de:</p>
                            <ul>
                                <li>La veracidad de la información proporcionada por los usuarios.</li>
                                <li>El comportamiento de los usuarios fuera de la plataforma.</li>
                                <li>Disputas, daños o pérdidas que puedan surgir de los acuerdos de alquiler entre usuarios.</li>
                            </ul>
                            <p>Recomendamos siempre tomar precauciones razonables al conocer a otros usuarios y al formalizar cualquier contrato de alquiler.</p>

                            <h2 className="text-white">6. Modificación y Terminación</h2>
                            <p>Nos reservamos el derecho de modificar estos Términos en cualquier momento. Te notificaremos de los cambios importantes. El uso continuado del servicio después de una modificación constituye tu aceptación de los nuevos Términos.</p>
                            <p>Podemos suspender o cancelar tu cuenta si infringes gravemente estos Términos, sin previo aviso.</p>
                            
                            <h2 className="text-white">7. Ley Aplicable y Jurisdicción</h2>
                            <p>Estos Términos se regirán por la legislación española. Para cualquier disputa, las partes se someten a la jurisdicción de los tribunales de Barcelona, España.</p>
                        </div>
                    </GlassCard>
                </div>
            </main>
            <Footer {...footerProps} />
        </div>
    );
};

export default TermsPage;
