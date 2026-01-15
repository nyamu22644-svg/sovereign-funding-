import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How long does the evaluation take?",
    answer: "There is no minimum or maximum time limit. You can pass in as little as 5 days if all objectives are met."
  },
  {
    question: "What platforms can I use?",
    answer: "We currently support trading via Deriv. More platforms will be added in the future to provide flexibility for all trading styles."
  },
  {
    question: "When do I get paid?",
    answer: "Payouts are processed bi-weekly via crypto (USDT, BTC, ETH) or direct bank transfer once you are a funded trader. The first payout can be requested after 14 days of the first trade on the funded account."
  },
  {
    question: "Is the evaluation on a live account?",
    answer: "No, the evaluation phase (Phase 1 and Phase 2) is conducted on a simulated account with real market data. This allows us to assess your risk management without risking capital. Once funded, you will operate on live capital."
  },
  {
    question: "What happens if I breach a rule?",
    answer: "If a hard rule (like Max Daily Loss or Max Total Drawdown) is breached, the account is automatically closed to protect our capital. You are welcome to start a new evaluation by purchasing a new challenge at any time."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-darkbg pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern bg-[size:60px_60px] opacity-5 pointer-events-none"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.2)]">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-xl text-silver font-light max-w-2xl mx-auto">
            Everything you need to know about becoming a funded trader with Sovereign Funding.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4 mb-24">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className={`
                  rounded-xl border transition-all duration-300 overflow-hidden backdrop-blur-sm
                  ${isOpen 
                    ? 'bg-darkcard/60 border-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.1)]' 
                    : 'bg-darkcard/30 border-white/10 hover:border-neon/30'
                  }
                `}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none group"
                >
                  <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? 'text-gold' : 'text-white group-hover:text-neon'}`}>
                    {faq.question}
                  </span>
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${isOpen ? 'border-gold bg-gold/10 text-gold rotate-45' : 'border-silver/30 text-silver group-hover:border-neon group-hover:text-neon'}`}>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  </span>
                </button>
                
                <div 
                  className={`
                    transition-all duration-500 ease-in-out overflow-hidden
                    ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}
                  `}
                >
                  <div className="p-6 pt-0 text-silver border-t border-white/5 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Hub Section */}
        <div className="relative">
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gold tracking-wide mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.2)]">
                    NEED DIRECT ASSISTANCE?
                </h2>
                <p className="text-silver font-light">
                    Choose your preferred channel to reach our 24/7 support team.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Email Support */}
                <a 
                    href="mailto:support@sovereignfunding.com" 
                    className="group p-8 rounded-xl border border-neon/30 bg-neon/5 hover:bg-neon/10 hover:border-neon transition-all duration-300 hover:-translate-y-2 text-center backdrop-blur-sm neon-glow"
                >
                    <div className="w-14 h-14 mx-auto bg-neon/10 rounded-full flex items-center justify-center text-neon mb-6 border border-neon/30 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-neon transition-colors">Email Support</h3>
                    <p className="text-sm text-gray-400">For formal inquiries and detailed account assistance.</p>
                </a>

                {/* Column 2: WhatsApp Priority (Gold) */}
                <a 
                    href="https://wa.me/15551234567" 
                    className="group p-8 rounded-xl border border-gold/30 bg-gold/5 hover:bg-gold/10 hover:border-gold transition-all duration-300 hover:-translate-y-2 text-center backdrop-blur-sm gold-glow shadow-[0_0_15px_rgba(255,215,0,0.05)]"
                >
                    <div className="w-14 h-14 mx-auto bg-gold/10 rounded-full flex items-center justify-center text-gold mb-6 border border-gold/30 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-gold transition-colors">WhatsApp Priority</h3>
                    <p className="text-sm text-gray-400">Instant responses for quick questions.</p>
                </a>

                {/* Column 3: Community */}
                <a 
                    href="#" 
                    className="group p-8 rounded-xl border border-neon/30 bg-neon/5 hover:bg-neon/10 hover:border-neon transition-all duration-300 hover:-translate-y-2 text-center backdrop-blur-sm neon-glow"
                >
                    <div className="w-14 h-14 mx-auto bg-neon/10 rounded-full flex items-center justify-center text-neon mb-6 border border-neon/30 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2 group-hover:text-neon transition-colors">Discord Community</h3>
                    <p className="text-sm text-gray-400">Join other traders and get peer support.</p>
                </a>
            </div>
        </div>

      </div>
    </div>
  );
};

export default FAQ;