import React from 'react';
import Header from '../components/Header';
import GlowBackground from '../components/GlowBackground';
import Footer from '../components/Footer';
import GlassCard from '../components/GlassCard';
import { HeartIcon } from '../components/icons';
import { getSupabaseUrl } from '../constants';
import { useI18n } from '../i18n';

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

const TeamMemberCard: React.FC<{ imgSrc: string; name: string; title: string; }> = ({ imgSrc, name, title }) => (
    <div className="text-center">
        <img src={imgSrc} alt={name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white/20 object-cover"/>
        <h4 className="text-xl font-bold text-white">{name}</h4>
        <p className="text-indigo-300">{title}</p>
    </div>
);

const AboutPage: React.FC<PageProps> = ({
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
    const { scope } = useI18n();
    const copy = scope<{
        hero: { title: string; subtitle: string };
        mission: { title: string; paragraphs: string[]; imageAlt: string };
        team: { title: string; subtitle: string; members: { imgSrc: string; name: string; title: string }[] };
        cta: { title: string; subtitle: string; button: string };
    }>('about');
    
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
        <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
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
            
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 text-center overflow-hidden">
                    <GlowBackground />
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-5xl font-extrabold tracking-tight text-white">
                            {copy.hero.title}
                        </h1>
                        <p className="mt-6 text-xl max-w-3xl mx-auto text-white/80">
                           {copy.hero.subtitle}
                        </p>
                    </div>
                </section>
                
                {/* Our Mission */}
                <section className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-4">{copy.mission.title}</h2>
                            {copy.mission.paragraphs.map((paragraph, index) => (
                                <p key={index} className={`text-white/80 ${index === 0 ? 'mb-4' : ''}`}>
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                        <GlassCard>
                            <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop" alt={copy.mission.imageAlt} className="rounded-lg"/>
                        </GlassCard>
                    </div>
                </section>

                {/* Meet the team */}
                <section className="relative py-20 overflow-hidden">
                    <GlowBackground />
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold">{copy.team.title}</h2>
                            <p className="text-lg text-white/70 mt-2">{copy.team.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
                            {copy.team.members.map(member => (
                                <TeamMemberCard key={member.name} imgSrc={member.imgSrc} name={member.name} title={member.title} />
                            ))}
                        </div>
                    </div>
                </section>
                
                 {/* CTA Section */}
                <section className="relative py-20 bg-black/10 overflow-hidden">
                    <GlowBackground />
                    <div className="max-w-3xl mx-auto px-4 text-center">
                        <HeartIcon className="w-12 h-12 text-indigo-400 mx-auto mb-4"/>
                        <h2 className="text-4xl font-bold">{copy.cta.title}</h2>
                        <p className="text-lg text-white/70 mt-4 mb-8">
                            {copy.cta.subtitle}
                        </p>
                        <button onClick={onLoginClick} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg text-lg">
                            {copy.cta.button}
                        </button>
                    </div>
                </section>

            </main>
            
            <Footer {...footerProps} />
        </div>
    );
};

export default AboutPage;
