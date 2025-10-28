


import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import GlowBackground from '../components/GlowBackground';
import Footer from '../components/Footer';
import { BlogPost } from '../types';
import GlassCard from '../components/GlassCard';
import { ChevronLeftIcon } from '../components/icons';
import { useI18n } from '../i18n';

interface BlogPageProps {
  posts: BlogPost[];
  onHomeClick: () => void;
  onLoginClick: () => void;
  onOwnersClick: () => void;
  onRegisterClick: () => void;
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

const BlogCard: React.FC<{ post: BlogPost; onClick: () => void; dateLocale: string }> = ({ post, onClick, dateLocale }) => (
  <GlassCard onClick={onClick} className="cursor-pointer transition-all hover:border-indigo-400/50 hover:scale-105 !p-0 overflow-hidden flex flex-col">
    <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
      <p className="text-white/70 mb-4 text-sm flex-grow">{post.excerpt}</p>
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
        <img src={post.author_image_url} alt={post.author} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="font-semibold text-sm">{post.author}</p>
          <p className="text-xs text-white/60">{new Date(post.publish_date).toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>
    </div>
  </GlassCard>
);

const BlogPage: React.FC<BlogPageProps> = ({
  posts,
  onHomeClick,
  onLoginClick,
  onOwnersClick,
  onRegisterClick,
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
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { language, scope } = useI18n();
  const copy = scope<{ hero: { title: string; subtitle: string }; back: string }>('blog');
  const locale = language === 'en' ? 'en-GB' : language === 'ca' ? 'ca-ES' : 'es-ES';

  const footerProps = {
    onBlogClick: () => {},
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

  useEffect(() => {
    if (!selectedPost) return;
    const container = document.getElementById('blog-article-content');
    if (!container) return;

    const handleLinkClick = (event: Event) => {
      const target = (event.target as HTMLElement).closest('[data-page-target]');
      if (!target) return;
      event.preventDefault();
      const destination = target.getAttribute('data-page-target');
      switch (destination) {
        case 'register':
          onRegisterClick();
          break;
        case 'owners':
          onOwnersClick();
          break;
        case 'login':
          onLoginClick();
          break;
        case 'contact':
          onContactClick();
          break;
        case 'silver':
          onSilverClick?.();
          break;
        default:
          break;
      }
    };

    container.addEventListener('click', handleLinkClick);
    return () => {
      container.removeEventListener('click', handleLinkClick);
    };
  }, [selectedPost, onRegisterClick, onOwnersClick, onLoginClick, onContactClick, onSilverClick]);

  if (selectedPost) {
    return (
      <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
        <Header
          onLoginClick={onLoginClick}
          onHomeClick={onHomeClick}
          onOwnersClick={onOwnersClick}
          onBlogClick={() => setSelectedPost(null)}
          onSilverClick={onSilverClick}
          onCalculadoraClick={onCalculadoraClick}
          onAmbassadorsClick={onAmbassadorsClick}
          onReferFriendsClick={onReferFriendsClick}
          onBlueprintClick={onBlueprintClick}
          pageContext="inquilino"
        />
        <main className="relative flex-grow py-12 px-4">
          <GlowBackground />
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              <ChevronLeftIcon className="w-5 h-5" />
              <span>{copy.back}</span>
            </button>
            <GlassCard>
              <h1 className="text-4xl font-extrabold text-white mb-4">{selectedPost.title}</h1>
              <div className="flex items-center gap-4 mb-8 border-b border-t border-white/10 py-4">
                <img src={selectedPost.author_image_url} alt={selectedPost.author} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{selectedPost.author}</p>
                  <p className="text-sm text-white/60">{new Date(selectedPost.publish_date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <img src={selectedPost.image_url} alt={selectedPost.title} className="w-full h-auto max-h-[500px] object-cover rounded-xl mb-8" />
              <div id="blog-article-content" className="prose prose-invert prose-lg max-w-none text-white/90" dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
            </GlassCard>
          </div>
        </main>
        <Footer {...footerProps} />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-[#0b1220] via-[#151c3a] to-[#221a3e] text-white flex flex-col">
      <Header
        onLoginClick={onLoginClick}
        onHomeClick={onHomeClick}
        onOwnersClick={onOwnersClick}
        onBlogClick={() => setSelectedPost(null)}
        onSilverClick={onSilverClick}
        onCalculadoraClick={onCalculadoraClick}
        onAmbassadorsClick={onAmbassadorsClick}
        onReferFriendsClick={onReferFriendsClick}
        onBlueprintClick={onBlueprintClick}
        pageContext="inquilino"
      />
      <main className="flex-grow">
        <section className="relative py-20 overflow-hidden">
          <GlowBackground />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-extrabold text-white">{copy.hero.title}</h1>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">{copy.hero.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <BlogCard key={post.id} post={post} onClick={() => setSelectedPost(post)} dateLocale={locale} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer {...footerProps} />
    </div>
  );
};
export default BlogPage;
