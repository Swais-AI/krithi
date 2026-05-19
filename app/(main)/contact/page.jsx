export default function ContactPage() {
  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full animate-fadeIn">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
        <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto rounded-full mb-6"></div>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Saraf Worldsphere AI Services (SWAIS)</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="glass-card rounded-2xl p-8 flex items-start gap-5 group">
             <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
               <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
             </div>
             <div>
               <h3 className="text-2xl font-semibold text-white mb-3">Head Office</h3>
               <p className="text-slate-400 leading-relaxed text-lg">Plot No. 199, Srinivasanagar<br/>Opposite Sun School<br/>Vizianagaram – 535002<br/>Andhra Pradesh, India</p>
             </div>
          </div>
          
          <div className="glass-card rounded-2xl p-8 flex items-start gap-5 group">
             <div className="p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
               <svg className="w-7 h-7 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             </div>
  <h3 className="text-2xl font-semibold text-white mb-3">Branches</h3>
  
  {/* Delhi Branch */}
  <p className="text-slate-400 leading-relaxed text-lg">
    10-A Prithviraj Road<br/>
    New Delhi - 110011<br/>
    India
  </p>
  
  {/* Garividi Branch */}
  <p className="text-slate-400 leading-relaxed text-lg mt-6">
    Saraf Worldsphere AI Services Private Limited<br/>
    c/o. SDS College<br/>
    Shreeram nagar<br/>
    Garividi<br/>
    Vizianagaram - 535101<br/>
    A.P, India
  </p>
</div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-5 group">
             <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
               <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
             </div>
             <div className="text-center md:text-left">
               <h3 className="text-xl font-semibold text-white mb-1">Email</h3>
               <a href="mailto:murty.varanasi@swais.in" className="text-cyan-400 hover:text-cyan-300 transition-colors text-lg font-medium">murty.varanasi@swais.in</a>
             </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-5 group">
             <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
               <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
             </div>
             <div className="text-center md:text-left">
               <h3 className="text-xl font-semibold text-white mb-1">Phone</h3>
               <p className="text-slate-400 text-lg font-medium">+91 9346508985</p>
             </div>
          </div>

          <div className="glass-card rounded-2xl p-8 border-l-2 border-l-cyan-500 mt-8">
            <h3 className="text-2xl font-semibold text-white mb-6">Enquiries</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-300 text-lg">
                <span className="text-cyan-400 font-bold">&#10003;</span> Business Enquiries
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-lg">
                <span className="text-cyan-400 font-bold">&#10003;</span> Technology Partnerships
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-lg">
                <span className="text-cyan-400 font-bold">&#10003;</span> Training Programs
              </li>
              <li className="flex items-center gap-3 text-slate-300 text-lg">
                <span className="text-cyan-400 font-bold">&#10003;</span> Institutional Collaborations
              </li>
            </ul>
          </div>
        </div>
      </div>
  );
}
