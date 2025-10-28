import React from 'react';
import { TwitterIcon, InstagramIcon, LinkedinIcon } from './icons';
import Logo from './Logo';
import { useI18n } from '../i18n';

interface FooterProps {
    onBlogClick?: () => void;
    onAboutClick?: () => void;
    onPrivacyClick?: () => void;
    onTermsClick?: () => void;
    onContactClick?: () => void;
    onOwnersClick?: () => void;
    onSilverClick?: () => void;
    onAmbassadorsClick?: () => void;
    onReferFriendsClick?: () => void;
    onBlueprintClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({
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
}) => {
    const { t } = useI18n();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-black/20 backdrop-blur-lg border-t border-white/10 text-white w-full">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center flex-col sm:flex-row gap-y-6">
                    <Logo />
                    <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-center">
                        {onOwnersClick && (
                            <a
                                href="/owners"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onOwnersClick();
                                }}
                                className="text-sm text-white/70 hover:text-white transition-colors"
                            >
                                {t('footer.links.owners')}
                            </a>
                        )}
                        <a
                            href="/silver"
                            onClick={(e) => {
                                if (!onSilverClick) return;
                                e.preventDefault();
                                onSilverClick();
                            }}
                            className="text-sm text-white/70 hover:text-white transition-colors"
                        >
                            {t('footer.links.silver')}
                        </a>
                        {/* Ambassadors and Referrals intentionally hidden from public footer */}
                        {onBlueprintClick && (
                            <a
                                href="/plan"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onBlueprintClick();
                                }}
                                className="text-sm text-white/70 hover:text-white transition-colors"
                            >
                                {t('footer.links.roadmap')}
                            </a>
                        )}
                        {onAboutClick && <a href="#" onClick={(e) => { e.preventDefault(); onAboutClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">{t('footer.links.about')}</a>}
                        {onBlogClick && <a href="#" onClick={(e) => { e.preventDefault(); onBlogClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">{t('footer.links.blog')}</a>}
                        {onContactClick && <a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">{t('footer.links.contact')}</a>}
                        {onPrivacyClick && <a href="#" onClick={(e) => { e.preventDefault(); onPrivacyClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">{t('footer.links.privacy')}</a>}
                        {onTermsClick && <a href="#" onClick={(e) => { e.preventDefault(); onTermsClick(); }} className="text-sm text-white/70 hover:text-white transition-colors">{t('footer.links.terms')}</a>}
                    </nav>
                    <div className="flex gap-5">
                        <a href="#" aria-label="Twitter" className="text-white/70 hover:text-white transition-colors"><TwitterIcon className="w-5 h-5" /></a>
                        <a href="#" aria-label="Instagram" className="text-white/70 hover:text-white transition-colors"><InstagramIcon className="w-5 h-5" /></a>
                        <a href="#" aria-label="LinkedIn" className="text-white/70 hover:text-white transition-colors"><LinkedinIcon className="w-5 h-5" /></a>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/50">
                    &copy; {currentYear} MoOn. {t('footer.copy.rights')}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
