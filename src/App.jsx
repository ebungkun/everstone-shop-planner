import { useEffect, useState, useMemo } from 'react';

// --- 아이콘 SVG 컴포넌트들 ---
const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const LinkIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
    </svg>
);

const GiftIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A3.375 3.375 0 0 0 8.625 8.25H15.375A3.375 3.375 0 0 0 12 4.875Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12v9M12 12H4.5m7.5 0H21m-9-7.5h.008v.008H12V4.5Z" />
    </svg>
);

const CheckCircleIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const ArrowUturnLeftIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
);


// --- 상단 고정 헤더 컴포넌트 (수정됨) ---
const StickyHeader = ({ totalCost, hasSelection, onReset, onShare }) => (
  <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-md z-20 lg:hidden">
    <div className="container mx-auto px-4 sm:px-6 md:px-8 h-16 flex justify-between items-center">
      <div>
        <span className="text-sm text-zinc-500 block">총 예상 비용</span>
        <span className="text-lg font-bold text-sky-600">{totalCost.toLocaleString()} 에버스톤</span>
      </div>
      {hasSelection && (
        <div className="flex items-center gap-2">
          <button onClick={onReset} className="flex items-center justify-center p-2.5 bg-zinc-600 text-white font-semibold rounded-lg hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600 transition-colors">
              <ArrowUturnLeftIcon className="w-5 h-5" />
          </button>
          <button onClick={onShare} className="flex items-center justify-center p-2.5 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">
              <LinkIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  </div>
);

// +++ 추가된 컴포넌트: 토스트 알림 +++
const Toast = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300 animate-fade-in-out">
      {message}
    </div>
  );
};


function App() {
  const [items, setItems] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(''); // copySuccess를 대체할 새로운 상태

  // 범용 CSV 파싱 함수
  const parseCSV = (text) => {
    if (!text) return [];
    const lines = text.trim().split('\n');
    const header = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map((line) => {
      const values = line.split(',').map(v => v.trim());
      return header.reduce((obj, key, i) => {
        obj[key] = values[i];
        return obj;
      }, {});
    });
  };
  
  // +++ 추가된 함수: 토스트 메시지 표시 +++
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 2500); // 2.5초 후에 메시지 사라짐
  };

  // 데이터 로딩 (아이템 목록 + 누적 보상 목록)
  useEffect(() => {
    // Vite의 환경 변수를 사용하여 올바른 기본 경로를 설정합니다.
    const baseUrl = import.meta.env.BASE_URL;

    Promise.all([
      fetch(`${baseUrl}item_list.csv`).then(res => res.ok ? res.text() : Promise.reject(new Error('아이템 목록 파일(item_list.csv)을 찾을 수 없습니다.'))),
      fetch(`${baseUrl}reward_list.csv`).then(res => res.ok ? res.text() : Promise.reject(new Error('누적 보상 파일(reward_list.csv)을 찾을 수 없습니다.')))
    ])
    .then(([itemCsvText, rewardCsvText]) => {
      // 아이템 데이터 처리
      const parsedItems = parseCSV(itemCsvText);
      let enhancedItems = parsedItems.map((item, index) => ({
        ...item,
        id: `item-${index}`,
        isPurchased: false,
        판매개수: parseInt(item.판매개수, 10) || 0,
        판매가격: parseInt(item.판매가격, 10) || 0,
      }));

      // URL에서 상태 복원
      const urlParams = new URLSearchParams(window.location.search);
      const selectionParam = urlParams.get('s');
      if (selectionParam) {
        try {
          const decodedString = atob(selectionParam);
          if (decodedString.length === enhancedItems.length) {
            enhancedItems = enhancedItems.map((item, index) => ({
              ...item,
              isPurchased: decodedString[index] === '1',
            }));
          }
        } catch (e) { console.error("URL 상태 복원 실패:", e); }
      }
      setItems(enhancedItems);

      // 누적 보상 데이터 처리
      const parsedRewards = parseCSV(rewardCsvText);
      const enhancedRewards = parsedRewards.map(reward => ({
        ...reward,
        '누적 소모 에버스톤': parseInt(reward['누적 소모 에버스톤'], 10) || 0,
        '지급 수량': parseInt(reward['지급 수량'], 10) || 1,
      }));
      setRewards(enhancedRewards);
    })
    .catch(error => {
      console.error('데이터 파일을 불러오는 중 에러 발생:', error);
      setError(error.message);
    });
  }, []);

  // URL 업데이트 useEffect
  useEffect(() => {
    if (items.length === 0) return;
    const selectionString = items.map(item => item.isPurchased ? '1' : '0').join('');
    if (selectionString.includes('1')) {
        const encodedSelection = btoa(selectionString);
        const newUrl = `${window.location.pathname}?s=${encodedSelection}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
    } else {
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
    }
  }, [items]);

  // 아이템 그룹화 useMemo
  const groupedItems = useMemo(() => {
    return items.reduce((acc, item) => {
      const group = acc[item.아이템명] || { itemList: [], totalQuantity: 0, totalPrice: 0 };
      group.itemList.push(item);
      group.totalQuantity += item.판매개수;
      group.totalPrice += item.판매가격;
      acc[item.아이템명] = group;
      return acc;
    }, {});
  }, [items]);

  // 장바구니 요약 정보 계산 useMemo
  const cartSummary = useMemo(() => {
    const selectedItems = items.filter(item => item.isPurchased);
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.판매가격, 0);
    const details = selectedItems.reduce((acc, item) => {
        if (!acc[item.아이템명]) { acc[item.아이템명] = { quantity: 0, price: 0 }; }
        acc[item.아이템명].quantity += item.판매개수;
        acc[item.아이템명].price += item.판매가격;
        return acc;
    }, {});
    return { totalPrice, details: Object.entries(details) };
  }, [items]);

  // 핸들러 함수들
  const handleGroupToggle = (groupName, shouldBePurchased) => setItems(prev => prev.map(item => item.아이템명 === groupName ? { ...item, isPurchased: shouldBePurchased } : item));
  const handleItemToggle = (itemId) => setItems(prev => prev.map(item => item.id === itemId ? { ...item, isPurchased: !item.isPurchased } : item));
  const toggleGroupExpansion = (groupName) => setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  
  // 핸들러 함수 수정: 토스트 사용
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
        showToast('URL이 클립보드에 복사되었습니다.');
    }, () => showToast('복사에 실패했습니다.'));
  };

  const handleResetSelection = () => {
    setItems(prev => prev.map(item => ({ ...item, isPurchased: false })));
    showToast('모든 선택이 초기화되었습니다.');
  };

  // 파스텔 색상 팔레트
  const pastelColors = useMemo(() => [
    { bg: 'bg-[#9FB3DF]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#8DA2CC]' },
    { bg: 'bg-[#9EC6F3]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#8DB5E0]' },
    { bg: 'bg-[#BDDDE4]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#AECDD4]' },
    { bg: 'bg-[#FFF1D5]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#EEDFC2]' },
    { bg: 'bg-[#727D73]', text: 'text-zinc-100', subText: 'text-zinc-300', border: 'border-zinc-200', accent: 'text-zinc-100', hoverBg: 'hover:bg-[#616C62]' },
    { bg: 'bg-[#AAB99A]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#99A889]' },
    { bg: 'bg-[#D0DDD0]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#BDCBB2]' },
    { bg: 'bg-[#F0F0D7]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#DBDBC4]' },
    { bg: 'bg-[#FFCDB2]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#E6B99F]' },
    { bg: 'bg-[#FFB4A2]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#E6A191]' },
    { bg: 'bg-[#E5989B]', text: 'text-zinc-800', subText: 'text-zinc-600', border: 'border-zinc-200', accent: 'text-zinc-800', hoverBg: 'hover:bg-[#CC888B]' },
    { bg: 'bg-[#B5828C]', text: 'text-zinc-100', subText: 'text-zinc-300', border: 'border-zinc-200', accent: 'text-zinc-100', hoverBg: 'hover:bg-[#A3737C]' },
  ], []);

  return (
    <div className="bg-neutral-100 text-neutral-800 min-h-screen font-sans">
      <StickyHeader
        totalCost={cartSummary.totalPrice}
        hasSelection={cartSummary.details.length > 0}
        onReset={handleResetSelection}
        onShare={handleCopyUrl}
      />
      <main className="container mx-auto p-4 sm:p-6 md:p-8 pt-24 lg:pt-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900">에버스톤 상점 구매 플래너</h1>
          <p className="text-neutral-700 mt-4 text-2xl font-semibold">2.5주년 전야제 특별상점 (2025.07)</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">오류: </strong>
            <span>{error}</span>
          </div>
        )}

        <div className="lg:flex lg:gap-8">
          {/* 아이템 목록 섹션 */}
          <div className="lg:w-2/3">
            <div className="space-y-3">
              {Object.entries(groupedItems).map(([groupName, groupData], index) => {
                const isAllSelected = groupData.itemList.every(item => item.isPurchased);
                const isExpanded = !!expandedGroups[groupName];
                const theme = pastelColors[index % pastelColors.length];

                return (
                  <div key={groupName} className={`${theme.bg} ${theme.text} rounded-lg shadow-md transition-all duration-300 ${theme.hoverBg}`}>
                    <div className="flex items-center p-4 cursor-pointer" onClick={() => toggleGroupExpansion(groupName)}>
                      <input type="checkbox" className={`h-5 w-5 rounded bg-white border-zinc-300 ${theme.accent} focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`} checked={isAllSelected} onChange={(e) => { e.stopPropagation(); handleGroupToggle(groupName, e.target.checked); }} />
                      <div className="flex-1 ml-4">
                        <p className="font-semibold text-lg">{groupName}</p>
                        <p className={`text-sm ${theme.subText}`}>총 {groupData.totalQuantity.toLocaleString()}개 / {groupData.totalPrice.toLocaleString()} 에버스톤</p>
                      </div>
                      <ChevronDownIcon className={`w-6 h-6 ${theme.subText} transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                    {isExpanded && (
                      <div className={`border-t ${theme.border} px-4 py-2`}>
                        <ul className="space-y-1">
                          {groupData.itemList.map(item => (
                            <li key={item.id} className={`flex items-center p-2 rounded-md ${theme.hoverBg}`}>
                              <input type="checkbox" className={`h-4 w-4 rounded bg-white border-zinc-300 ${theme.accent} focus:ring-2 focus:ring-offset-2 focus:ring-offset-white`} checked={item.isPurchased} onChange={() => handleItemToggle(item.id)} />
                              <div className="flex-1 ml-4 text-sm"><span className={`${theme.subText} mr-3`}>{item.일자}</span><span>{item.판매개수.toLocaleString()}개</span></div>
                              <span className={`font-mono ${theme.accent}`}>{item.판매가격.toLocaleString()} 에버스톤</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- 오른쪽 사이드바 --- */}
          <div className="lg:w-1/3 mt-8 lg:mt-0">
            <div className="sticky top-24 lg:top-8 bg-white rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold p-6 border-b border-zinc-200 text-zinc-800">구매 계획 요약</h2>
              {/* --- 수정된 부분: max-h-[40vh] overflow-y-auto 클래스 제거 --- */}
              <div className="p-6 space-y-3">
                {cartSummary.details.length > 0 ? (
                  cartSummary.details.map(([name, data]) => (
                    <div key={name} className="flex justify-between items-center text-base">
                      <div><p className="text-zinc-700">{name}</p><p className="text-sm text-zinc-500">{data.quantity.toLocaleString()}개</p></div>
                      <span className="font-mono text-zinc-600">{data.price.toLocaleString()}</span>
                    </div>
                  ))
                ) : (<p className="text-zinc-400 text-center py-10">선택된 아이템이 없습니다.</p>)}
              </div>
              {cartSummary.details.length > 0 && (
                <div className="p-6 border-t border-zinc-200 space-y-4">
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-semibold text-zinc-800">총 예상 비용:</span>
                      <span className="font-bold text-sky-600">{cartSummary.totalPrice.toLocaleString()} 에버스톤</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleResetSelection} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-600 text-white font-semibold rounded-lg hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600 transition-colors">
                            <ArrowUturnLeftIcon className="w-5 h-5" />
                            <span>선택 초기화</span>
                        </button>
                    <button onClick={handleCopyUrl} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors">
                        <LinkIcon className="w-5 h-5" />
                        <span>공유하기</span>
                    </button>
                    </div>
                </div>
              )}
              
              {rewards.length > 0 && (
                <div className="border-t border-zinc-200">
                    <h2 className="text-2xl font-bold p-6 text-zinc-800">누적 구매 보상</h2>
                    <div className="px-6 pb-6 space-y-5">
                        {rewards.map(reward => {
                            const required = reward['누적 소모 에버스톤'];
                            const progress = Math.min((cartSummary.totalPrice / required) * 100, 100);
                            const isAchieved = cartSummary.totalPrice >= required;
                            
                            return (
                                <div key={reward['보상 아이템']}>
                                    <div className="flex items-center justify-between mb-1">
                                        <div className={`flex items-center gap-2 ${isAchieved ? 'text-green-600' : 'text-zinc-600'}`}>
                                            {isAchieved ? <CheckCircleIcon className="w-5 h-5" /> : <GiftIcon className="w-5 h-5" />}
                                            <span className="font-semibold">
                                                {reward['보상 아이템']} ({reward['지급 수량']}개)
                                            </span>
                                        </div>
                                        <span className={`text-sm font-medium ${isAchieved ? 'text-green-600' : 'text-zinc-500'}`}>
                                            {required.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-zinc-200 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full ${isAchieved ? 'bg-green-500' : 'bg-sky-500'}`} style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-zinc-500 text-sm mt-10">
        <p>제작자: 에붕소울 (아카라이브 에버소울 채널)</p>
      </footer>
      {/* 토스트 컴포넌트 렌더링 */}
      <Toast message={toastMessage} isVisible={!!toastMessage} />
    </div>
  );
}

export default App;
