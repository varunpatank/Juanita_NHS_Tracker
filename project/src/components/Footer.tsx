import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const bgPattern = `bg-[url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]`;

  return (
    <footer className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className={`absolute inset-0 ${bgPattern} opacity-50`} />
      
      <div className="relative max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span
                className="relative block h-12 w-12 shrink-0"
                role="img"
                aria-label="Juanita High School raven crest"
              >
                <span
                  className="absolute inset-0 block"
                  style={{
                    WebkitMaskImage: 'url(/Raven_Head_-_Blue_Outline.png)',
                    maskImage: 'url(/Raven_Head_-_Blue_Outline.png)',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    background:
                      'linear-gradient(160deg, #f7e6a6 0%, #e6ae22 44%, #93640a 100%)',
                  }}
                />
                <img
                  src="/Raven_Head_-_Blue_Outline.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-contain"
                  style={{
                    filter: 'grayscale(1) contrast(1.35)',
                    mixBlendMode: 'multiply',
                    opacity: 0.85,
                  }}
                />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight">Juanita NHS</h3>
                <p className="text-sm text-blue-200">National Honor Society</p>
              </div>
            </div>
            <p className="text-blue-100 leading-relaxed">
              Empowering students through scholarship, service, leadership, and character 
              to create lasting positive change in our community and beyond.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Home
                </a>
              </li>
              <li>
                <a href="/volunteering" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Service Opportunities
                </a>
              </li>
              <li>
                <a href="/submit-hours" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Submit Service Hours
                </a>
              </li>
              <li>
                <a href="/my-hours" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  My Hours
                </a>
              </li>
              <li>
                <a href="/hours-tracker" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Leaderboard
                </a>
              </li>
              <li>
                <a href="mailto:1060801@lwsd.org" className="text-blue-200 hover:text-white transition-colors flex items-center">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-3"></span>
                  Member Resources
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-white">Connect With Us</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 flex-shrink-0 bg-amber-500 rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="text-blue-200 break-words">10601 NE 132nd St, Kirkland, WA 98034</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gold-300 font-medium">NHS Advisor</p>
                  <a href="mailto:1060801@lwsd.org" className="text-blue-200 hover:text-white transition-colors text-sm">
                    1060801@lwsd.org
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gold-300 font-medium">School Office</p>
                  <span className="text-blue-200 text-sm">(206) 584-9115</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center">
          <p className="text-gold-200">
            © 2025 Juanita High School National Honor Society. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}