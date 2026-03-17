// client/src/components/WordSpan.jsx
const WordSpan = ({ word, pinyin, mean, showPinyinGlobal }) => {
  return (
    <span className="relative group cursor-help mx-1 inline-block text-center">
      {/* Hiển thị Pinyin trên đầu từ nếu bật chế độ Pinyin toàn cục */}
      {showPinyinGlobal && (
        <div className="text-[10px] text-gray-400 leading-none mb-1">{pinyin}</div>
      )}
      
      <span className="text-2xl hover:text-indigo-600 transition-colors">
        {word}
      </span>

      {/* Tooltip khi hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl min-w-[120px]">
          <div className="font-bold border-b border-slate-700 pb-1 mb-1">{word}</div>
          <div className="text-[10px] text-indigo-300">{pinyin}</div>
          <div className="text-xs text-slate-200 mt-1">{mean}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
      </div>
    </span>
  );
};