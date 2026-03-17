import React, { useState, useEffect, useRef } from 'react';

const categories = [
  { id: 'all', label: 'Tất cả', icon: '🌐' },
  { id: 'business', label: 'Kinh doanh', icon: '💼' },
  { id: 'social', label: 'Xã hội', icon: '👥' },
  { id: 'hsk4', label: 'HSK 4', icon: '📗' },
  { id: 'hsk5', label: 'HSK 5', icon: '📘' },
  { id: 'hsk6', label: 'HSK 6', icon: '📕' },
];

function App() {
  const [direction, setDirection] = useState('zh-vi');
  const [activeCat, setActiveCat] = useState('all');
  const [question, setQuestion] = useState(null);
  const [showPinyin, setShowPinyin] = useState(false);
  const [userTrans, setUserTrans] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const topRef = useRef(null);

  // Hàm bổ trợ để sửa lỗi font tiếng Việt
  const fixFont = (text) => {
    if (!text) return "";
    return typeof text === 'string' ? text.normalize("NFC") : text;
  };

  const fetchQuestion = async (dir = direction, cat = activeCat) => {
    setLoading(true);
    setResult(null);
    setUserTrans("");
    try {
      const res = await fetch(`/api/question?direction=${dir}&category=${cat}`);
      if (!res.ok) { setQuestion(null); return; }
      const data = await res.json();
      
      // Sửa font cho câu hỏi
      data.content = fixFont(data.content);
      if(data.words) {
        data.words = data.words.map(w => ({...w, m: fixFont(w.m)}));
      }
      
      setQuestion(data);
    } catch (e) { setQuestion(null); }
    setLoading(false);
  };

  useEffect(() => { fetchQuestion(); }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (result && result.score >= 80) {
      setStreakCount(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else if (result && result.score < 60) {
      setStreakCount(0);
    }
  }, [result]);

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playAudio = (text) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = direction === 'zh-vi' ? 'zh-CN' : 'vi-VN';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleCheck = async () => {
    if (!userTrans.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: question.content,
          userTranslation: userTrans,
          direction: direction
        })
      });
      let data = await res.json();
      
      // Sửa font toàn bộ object kết quả trả về từ AI
      const cleanData = JSON.parse(JSON.stringify(data).normalize("NFC"));
      setResult(cleanData);
    } catch (e) { alert("AI đang bận, thử lại sau nhé!"); }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-emerald-400 to-emerald-600';
    if (score >= 70) return 'from-amber-400 to-orange-500';
    return 'from-rose-400 to-rose-600';
  };

  const getScoreEmoji = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🌟';
    if (score >= 70) return '👍';
    if (score >= 60) return '💪';
    return '📚';
  };

  return (
    <div ref={topRef} className={`min-h-screen transition-all duration-500 ${darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30'}`}>
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#5D5FEF', '#F59E0B', '#10B981', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}

      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-200/40'}`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl ${darkMode ? 'bg-purple-900/20' : 'bg-purple-200/40'}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl ${darkMode ? 'bg-slate-800/30' : 'bg-white/50'}`} />
      </div>

      <div className="relative z-10 p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-2xl">中</span>
              </div>
              <div>
                <h1 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  TransMaster
                </h1>
                <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Luyện dịch Trung - Việt</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Streak Counter */}
              {streakCount > 0 && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${darkMode ? 'bg-amber-900/30 border border-amber-700/50' : 'bg-amber-50 border border-amber-200'}`}>
                  <span className="text-lg">🔥</span>
                  <span className={`font-bold text-sm ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{streakCount}</span>
                </div>
              )}
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  darkMode 
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 shadow-lg shadow-slate-200/50'
                }`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </header>

          {/* Category Pills */}
          <div className={`p-2 rounded-3xl mb-8 backdrop-blur-xl ${darkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/70 shadow-xl shadow-slate-200/50 border border-white/50'}`}>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
              {categories.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => { setActiveCat(c.id); fetchQuestion(direction, c.id); }}
                  className={`group flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap font-semibold text-sm ${
                    activeCat === c.id 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
                      : darkMode 
                        ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200' 
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  <span className={`transition-transform duration-300 ${activeCat === c.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {c.icon}
                  </span>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direction Toggle */}
          <div className="flex justify-center mb-10">
            <div className={`p-1.5 rounded-2xl backdrop-blur-xl ${darkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/80 shadow-xl shadow-slate-200/50 border border-white/50'}`}>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setDirection('zh-vi'); fetchQuestion('zh-vi'); }}
                  className={`group relative px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden ${
                    direction === 'zh-vi' 
                      ? 'text-white' 
                      : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {direction === 'zh-vi' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 rounded-xl" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="text-lg">🇨🇳</span>
                    <span>→</span>
                    <span className="text-lg">🇻🇳</span>
                  </span>
                </button>
                <button 
                  onClick={() => { setDirection('vi-zh'); fetchQuestion('vi-zh'); }}
                  className={`group relative px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden ${
                    direction === 'vi-zh' 
                      ? 'text-white' 
                      : darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {direction === 'vi-zh' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl" />
                  )}
                  <span className="relative flex items-center gap-2">
                    <span className="text-lg">🇻🇳</span>
                    <span>→</span>
                    <span className="text-lg">🇨🇳</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Question Card */}
          <div className={`relative rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl transition-all duration-500 ${
            darkMode 
              ? 'bg-slate-800/50 border border-slate-700/50 shadow-2xl shadow-slate-900/50' 
              : 'bg-white/80 border border-white/50 shadow-2xl shadow-slate-200/50'
          }`}>
            
            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden rounded-tr-[2.5rem]">
              <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full ${darkMode ? 'bg-indigo-600/20' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`} />
            </div>

            {/* New Question Button */}
            <button 
              onClick={() => fetchQuestion()} 
              className={`absolute top-6 right-6 md:top-8 md:right-8 group flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-300 ${
                darkMode 
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-600' 
                  : 'bg-slate-50 text-slate-500 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600'
              }`}
            >
              <span className="transition-transform duration-300 group-hover:rotate-180">✨</span>
              <span className="hidden sm:inline">Câu mới</span>
            </button>

            {/* Question Label & Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${
                direction === 'zh-vi'
                  ? 'bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-rose-600 border border-rose-200'
                  : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 border border-emerald-200'
              } ${darkMode ? 'border-opacity-30' : ''}`}>
                <span>{direction === 'zh-vi' ? '🇨🇳' : '🇻🇳'}</span>
                {direction === 'zh-vi' ? 'Câu Tiếng Trung' : 'Câu Tiếng Việt'}
              </div>
              
              <div className="flex gap-2 ml-auto sm:ml-0">
                {direction === 'zh-vi' && (
                  <button 
                    onClick={() => setShowPinyin(!showPinyin)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                      showPinyin 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                        : darkMode 
                          ? 'bg-slate-700/50 text-slate-400 hover:text-slate-200 border border-slate-600' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    <span>拼</span>
                    Pinyin
                  </button>
                )}
                <button 
                  onClick={() => playAudio(question?.content)} 
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-600' 
                      : 'bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  🔊
                </button>
              </div>
            </div>

            {/* Question Content */}
            <div className="min-h-[140px] mb-10">
              {loading && !question ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                      <div 
                        key={i} 
                        className={`w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 animate-bounce`}
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : question ? (
                direction === 'zh-vi' ? (
                  <div className="flex flex-wrap items-end gap-x-1 gap-y-6">
                    {question.words?.map((item, i) => (
                      <div 
                        key={i} 
                        className="group relative cursor-pointer text-center transform transition-transform duration-200 hover:scale-110"
                      >
                        {showPinyin && (
                          <div className={`text-sm mb-2 font-medium tracking-wide ${darkMode ? 'text-indigo-400' : 'text-indigo-500'}`}>
                            {item.p}
                          </div>
                        )}
                        <div className={`text-4xl md:text-5xl lg:text-6xl font-serif transition-colors duration-200 ${
                          darkMode 
                            ? 'text-slate-100 hover:text-indigo-400' 
                            : 'text-slate-800 hover:text-indigo-600'
                        }`}>
                          {item.w}
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover:block z-50 animate-in zoom-in-95 fade-in duration-200">
                          <div className={`p-5 rounded-2xl shadow-2xl min-w-[160px] text-center ${
                            darkMode ? 'bg-slate-700 border border-slate-600' : 'bg-slate-900'
                          }`}>
                            <div className="text-2xl font-bold text-white border-b border-slate-600 pb-3 mb-3">
                              {item.w}
                            </div>
                            <div className="text-indigo-400 text-sm font-medium mb-2">{item.p}</div>
                            <div className="text-slate-200 text-sm leading-relaxed">{item.m}</div>
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent ${
                              darkMode ? 'border-t-slate-700' : 'border-t-slate-900'
                            }`} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-3xl md:text-4xl lg:text-5xl font-bold leading-relaxed ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    {fixFont(question.content)}
                  </div>
                )
              ) : (
                <div className={`text-center py-8 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  <span className="text-4xl mb-4 block">📚</span>
                  <p className="italic">Đang tải câu hỏi...</p>
                </div>
              )}
            </div>

            {/* Answer Section */}
            <div className={`border-t pt-8 ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">✏️</span>
                <h4 className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Bản dịch của bạn
                </h4>
              </div>
              
              <div className="relative">
                <textarea
                  className={`w-full rounded-2xl p-6 text-lg outline-none transition-all duration-300 h-36 resize-none ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-100 placeholder-slate-500 border-2 border-slate-600 focus:border-indigo-500' 
                      : 'bg-slate-50 text-slate-800 placeholder-slate-400 border-2 border-transparent focus:border-indigo-500 shadow-inner'
                  }`}
                  placeholder={direction === 'zh-vi' ? "Nhập bản dịch tiếng Việt của bạn..." : "Nhập bản dịch tiếng Trung của bạn..."}
                  value={userTrans}
                  onChange={(e) => setUserTrans(e.target.value)}
                />
                {userTrans && (
                  <div className={`absolute bottom-4 right-4 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {userTrans.length} ký tự
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleCheck} 
                disabled={loading || !userTrans.trim()} 
                className={`group relative w-full mt-6 py-5 rounded-2xl font-bold text-lg transition-all duration-300 overflow-hidden ${
                  loading || !userTrans.trim()
                    ? darkMode 
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-[0.98]'
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang chấm bài...
                    </>
                  ) : (
                    <>
                      <span className="transition-transform duration-300 group-hover:scale-125">🎯</span>
                      Kiểm tra kết quả
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
          
          {/* Results Section */}
          {result && (
            <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Score Card */}
              <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-10 ${
                darkMode 
                  ? 'bg-slate-800/50 border border-slate-700/50' 
                  : 'bg-white/80 border border-white/50 shadow-2xl shadow-slate-200/50'
              }`}>
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Score Circle */}
                  <div className="relative">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor(result.score)} p-1 shadow-2xl`}>
                      <div className={`w-full h-full rounded-full flex flex-col items-center justify-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                        <span className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                          {result.score}
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          điểm
                        </span>
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 text-4xl animate-bounce">
                      {getScoreEmoji(result.score)}
                    </div>
                  </div>
                  
                  {/* Teacher Message */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center gap-2 mb-3 justify-center md:justify-start">
                      <span className="text-2xl">👨‍🏫</span>
                      <h3 className={`font-bold text-xl ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        Nhận xét từ giáo viên
                      </h3>
                    </div>
                    <p className={`text-base leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {fixFont(result.teacher_message)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Section */}
              {result.analysis?.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      darkMode ? 'bg-amber-900/30' : 'bg-amber-100'
                    }`}>
                      <span className="text-xl">💡</span>
                    </div>
                    <div>
                      <h3 className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                        Các điểm cần lưu ý
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {result.analysis.length} điểm cần cải thiện
                      </p>
                    </div>
                  </div>
                  
                  {result.analysis?.map((item, i) => (
                    <div 
                      key={i} 
                      className={`rounded-[2rem] overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                        darkMode 
                          ? 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600' 
                          : 'bg-white/80 border border-white/50 shadow-xl shadow-slate-200/30 hover:shadow-2xl'
                      }`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="p-8">
                        {/* Original Part */}
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {i + 1}
                          </div>
                          <div>
                            <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              Cụm từ gốc
                            </div>
                            <div className={`text-xl font-bold font-serif ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                              {fixFont(item.part)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Comparison Grid */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                          {/* User Translation */}
                          <div className={`relative p-6 rounded-2xl ${
                            darkMode 
                              ? 'bg-rose-900/20 border border-rose-800/30' 
                              : 'bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100'
                          }`}>
                            <div className="absolute -top-3 left-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white">
                                <span>✕</span> Bạn dịch
                              </span>
                            </div>
                            <div className={`mt-2 text-base line-through decoration-2 ${
                              darkMode ? 'text-rose-300 decoration-rose-500/50' : 'text-rose-600 decoration-rose-300'
                            }`}>
                              {fixFont(item.user_work) || "(Trống)"}
                            </div>
                          </div>

                          {/* Suggested Translation */}
                          <div className={`relative p-6 rounded-2xl ${
                            darkMode 
                              ? 'bg-emerald-900/20 border border-emerald-800/30' 
                              : 'bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100'
                          }`}>
                            <div className="absolute -top-3 left-4">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">
                                <span>✓</span> Nên dịch
                              </span>
                            </div>
                            <div className={`mt-2 text-base font-semibold ${
                              darkMode ? 'text-emerald-300' : 'text-emerald-700'
                            }`}>
                              {fixFont(item.better_way)}
                            </div>
                          </div>
                        </div>

                        {/* Explanation */}
                        <div className={`p-6 rounded-2xl ${
                          darkMode 
                            ? 'bg-slate-700/30 border-l-4 border-indigo-500' 
                            : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-l-4 border-indigo-500'
                        }`}>
                          <div className="flex items-start gap-3">
                            <span className="text-xl">📝</span>
                            <div>
                              <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                Giải thích chi tiết
                              </div>
                              <p className={`leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                {fixFont(item.why)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Try Again Button */}
              <div className="flex justify-center pt-8 pb-20">
                <button
                  onClick={() => fetchQuestion()}
                  className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                    darkMode 
                      ? 'bg-slate-700/50 text-slate-200 hover:bg-indigo-600 border border-slate-600 hover:border-indigo-600' 
                      : 'bg-white text-slate-700 hover:bg-indigo-600 hover:text-white shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30'
                  }`}
                >
                  <span className="transition-transform duration-300 group-hover:rotate-180">🔄</span>
                  Luyện câu tiếp theo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in z-50 ${
            darkMode 
              ? 'bg-slate-700 text-slate-200 hover:bg-indigo-600 shadow-xl shadow-slate-900/50' 
              : 'bg-white text-slate-600 hover:bg-indigo-600 hover:text-white shadow-xl shadow-slate-300/50'
          }`}
        >
          <span className="text-xl">↑</span>
        </button>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .bg-size-200 {
          background-size: 200% 100%;
        }
        .bg-pos-0 {
          background-position: 0% 0%;
        }
        .bg-pos-100 {
          background-position: 100% 0%;
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .animate-confetti {
          width: 10px;
          height: 10px;
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default App;
