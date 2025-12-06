
import React from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, Coins, Briefcase, BarChart3, Wallet, PieChart, Building2, Mail } from 'lucide-react';

interface CapitalizationPlanProps {
  onBack: () => void;
}

const CapitalizationPlan: React.FC<CapitalizationPlanProps> = ({ onBack }) => {
  
  const handleScrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans overflow-y-auto">
      
      {/* NAVIGATION HEADER */}
      <div className="bg-[#061325] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} />
                <span className="font-medium">Back to Exchange</span>
            </button>
            <div className="text-white font-bold text-lg hidden sm:block">UST Inc. Investor Relations</div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="relative bg-[#061325] text-white overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
             <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad1)" />
             <defs>
               <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                 <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
               </linearGradient>
             </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-blue-900/50 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-700 mb-6">
              <TrendingUp className="text-[#10b981] w-4 h-4" />
              <span className="text-sm font-medium text-blue-100">Стратегия 2045</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Группа компаний UST Inc.: <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                План финансирования и оценка капитализации
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-200 mb-10 leading-relaxed max-w-2xl">
              Компания, специализирующаяся на прорывных транспортно-инфраструктурных комплексах, представляет детальный план расходов, прогнозы доходности и стратегию выхода на капитализацию в $400 млрд.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => handleScrollTo('investment-plan')}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-[#061325] bg-white hover:bg-blue-50 transition-colors duration-300"
              >
                Смотреть план инвестиций
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button 
                onClick={() => handleScrollTo('capitalization')}
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-500 text-base font-medium rounded-lg text-white hover:bg-blue-800/50 backdrop-blur-sm transition-colors duration-300"
              >
                Прогноз капитализации
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INVESTMENT PLAN SECTION */}
      <section id="investment-plan" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-blue-100 mb-4">
               <Coins className="text-[#061325] w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#061325] mb-4">
              Инвестиционный план до 2027 года
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Минимальный необходимый объём инвестиций для достижения ключевых показателей эффективности и выхода на самоокупаемость.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f0f4f8] border-b border-slate-200">
                    <th className="px-6 py-4 text-sm font-semibold text-[#102a43] uppercase tracking-wider w-1/5 min-w-[200px]">Статья расходов</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#102a43] uppercase tracking-wider w-1/6 min-w-[150px]">Сумма (ежемесячно)</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#102a43] uppercase tracking-wider w-1/4 min-w-[250px]">Спецификация работ</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#102a43] uppercase tracking-wider w-1/4 min-w-[250px]">Ожидаемый результат (2027)</th>
                    <th className="px-6 py-4 text-sm font-semibold text-[#102a43] uppercase tracking-wider w-1/6 min-w-[150px]">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { title: "Фонд оплаты труда (ФОТ)", amount: "$500,000", spec: "Содержание штата инженеров, конструкторов, административного персонала (до 300 чел)", result: "Сформированная команда высококвалифицированных специалистов", roi: "База для создания IP" },
                    { title: "НИОКР и Сертификация", amount: "$600,000", spec: "Разработка новых узлов, испытания подвижного состава, международная сертификация", result: "Сертифицированные транспортные комплексы (грузовой и пассажирский)", roi: "Рост стоимости нематериальных активов" },
                    { title: "Строительство и эксплуатация", amount: "$500,000", spec: "Содержание тестовых полигонов, строительство демонстрационных трасс", result: "Действующие демонстрационные участки в 2-х регионах", roi: "Демонстрация технологии заказчикам" },
                    { title: "Маркетинг и Представительские", amount: "$200,000", spec: "Участие в выставках (InnoTrans, EXPO), содержание зарубежных офисов", result: "Подписанные контракты на адресные проекты (общая сумма > $1 млрд)", roi: "Приток авансовых платежей" },
                    { title: "Административные расходы", amount: "$100,000", spec: "Аренда, ПО, юридическое сопровождение, патентование", result: "Защищенная интеллектуальная собственность (более 100 патентов)", roi: "Юридическая безопасность бизнеса" }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#061325]">{row.title}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#334e68] whitespace-nowrap">{row.amount}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.spec}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{row.result}</td>
                      <td className="px-6 py-4 text-sm text-emerald-600 font-medium">{row.roi}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#061325] text-white">
                   <tr>
                      <td className="px-6 py-5 font-bold text-lg">ИТОГО</td>
                      <td className="px-6 py-5 font-bold text-2xl text-[#10b981] whitespace-nowrap">$1,900,000</td>
                      <td colSpan={3} className="px-6 py-5 text-sm text-blue-200 italic hidden md:table-cell">
                        Ежемесячный объем финансирования для поддержания темпов развития
                      </td>
                   </tr>
                </tfoot>
              </table>
            </div>
            <div className="md:hidden bg-[#061325] p-4 text-white text-center">
              <p className="text-sm opacity-80 mb-1">Итого ежемесячно:</p>
              <p className="text-2xl font-bold text-[#10b981]">$1,900,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECT RETURNS SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-[#059669] font-semibold tracking-wide uppercase text-sm">Доходность</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#061325] mt-2 mb-4">
              Прогноз доходности и вознаграждение
            </h2>
            <p className="text-slate-600 max-w-3xl">
              Анализ эффективности коммерческих проектов и планируемые выплаты инвесторам в период с 2025 по 2045 год.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Project 1 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#10b981] hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold text-[#061325] mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-slate-400" />
                Адресный проект №1 (ОАЭ)
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Предварительная стоимость:</span>
                  <span className="font-semibold text-[#102a43]">$150,000,000</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Доходность (2025-2027):</span>
                  <span className="font-semibold text-emerald-600 text-right text-sm sm:text-base">2025: $5M | 2026: $10M | 2027: $15M</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2 bg-slate-50 p-2 rounded">
                  <span className="text-[#061325] font-medium">Суммарный доход (3 года):</span>
                  <span className="font-bold text-[#061325]">$30,000,000</span>
                </div>
                 <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-slate-500">Мин. выплата инвесторам (2027):</span>
                  <span className="font-bold text-[#059669]">$25,500,000</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                   <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Потенциальная годовая доходность (до 2045)</p>
                   <p className="text-lg font-bold text-[#102a43]">15-25%</p>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#10b981] hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-bold text-[#061325] mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-slate-400" />
                Адресный проект №2 (Индия)
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Предварительная стоимость:</span>
                  <span className="font-semibold text-[#102a43]">$80,000,000</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Доходность (2025-2027):</span>
                  <span className="font-semibold text-emerald-600 text-right text-sm sm:text-base">2026: $5M | 2027: $10M</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2 bg-slate-50 p-2 rounded">
                  <span className="text-[#061325] font-medium">Суммарный доход (3 года):</span>
                  <span className="font-bold text-[#061325]">$15,000,000</span>
                </div>
                 <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-slate-500">Мин. выплата инвесторам (2027):</span>
                  <span className="font-bold text-[#059669]">$12,750,000</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100">
                   <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Потенциальная годовая доходность (до 2045)</p>
                   <p className="text-lg font-bold text-[#102a43]">18-30%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Totals Summary Block */}
          <div className="bg-[#061325] rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#10b981] opacity-10"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start mb-4 text-blue-300">
                  <BarChart3 className="w-6 h-6 mr-2" />
                  <span className="text-sm font-medium uppercase tracking-wider">Общая прибыль 2025-2027</span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">$45 млн</p>
                <p className="text-sm text-blue-200">Прогнозируемый доход от всех коммерческих проектов</p>
              </div>
              
              <div className="md:border-l md:border-white/20 md:pl-8">
                <div className="flex items-center justify-center md:justify-start mb-4 text-emerald-300">
                  <Wallet className="w-6 h-6 mr-2" />
                  <span className="text-sm font-medium uppercase tracking-wider">Выплаты инвесторам</span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-[#34d399] mb-2">$38.25 млн</p>
                <p className="text-sm text-blue-200">Общий объем вознаграждения до конца 2027 года</p>
              </div>

               <div className="md:border-l md:border-white/20 md:pl-8">
                <div className="flex items-center justify-center md:justify-start mb-4 text-purple-300">
                  <PieChart className="w-6 h-6 mr-2" />
                  <span className="text-sm font-medium uppercase tracking-wider">Дивиденды на 1 долю</span>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">до $0.075</p>
                <p className="text-sm text-blue-200">Прогнозируемое вознаграждение к 2045 году</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CAPITALIZATION COMPARISON SECTION */}
      <section id="capitalization" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex justify-center items-center w-12 h-12 rounded-full bg-blue-50 mb-4">
               <Building2 className="text-[#061325] w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#061325] mb-4">
              Прогноз капитализации и рынок
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Сравнение потенциала UST Inc. с текущими лидерами индустрии транспортного машиностроения (CRRC, Siemens, Alstom).
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">Компания</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">Среднегодовая прибыль</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">P/E Ratio</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">Капитализация (Прогноз)</th>
                  <th className="px-6 py-5 text-sm font-semibold text-slate-500 uppercase tracking-wider">Стоимость акции/доли</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5"><span className="font-medium text-slate-700 text-base">CRRC (Китай)</span></td>
                  <td className="px-6 py-5 text-sm text-slate-600">$11.3 млрд</td>
                  <td className="px-6 py-5 text-sm text-slate-600">12.5</td>
                  <td className="px-6 py-5"><span className="font-medium text-slate-700 text-base">$140 млрд</span></td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">$0.75 - $1.20</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5"><span className="font-medium text-slate-700 text-base">Siemens Mobility (Германия)</span></td>
                  <td className="px-6 py-5 text-sm text-slate-600">$9.5 млрд</td>
                  <td className="px-6 py-5 text-sm text-slate-600">14.2</td>
                  <td className="px-6 py-5"><span className="font-medium text-slate-700 text-base">$135 млрд</span></td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">$140 - $160</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5"><span className="font-medium text-slate-700 text-base">Alstom (Франция)</span></td>
                  <td className="px-6 py-5 text-sm text-slate-600">$3.2 млрд</td>
                  <td className="px-6 py-5 text-sm text-slate-600">18.0</td>
                  <td className="px-6 py-5"><span className="font-medium text-slate-700 text-base">$12 млрд</span></td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">$25 - $35</td>
                </tr>
                <tr className="bg-blue-50/50 border-l-4 border-l-blue-600 transition-colors">
                  <td className="px-6 py-5">
                    <span className="font-bold text-[#061325] text-lg">UST Inc.</span>
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Мы</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">Высокий потенциал роста</td>
                  <td className="px-6 py-5 text-sm text-slate-600">N/A (Pre-IPO)</td>
                  <td className="px-6 py-5"><span className="font-bold text-emerald-700 text-base">$400 млрд</span></td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-700">До $0.75 за долю*</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-12 bg-gradient-to-r from-[#102a43] to-[#061325] rounded-2xl p-8 sm:p-12 text-center text-white shadow-2xl transform hover:scale-[1.01] transition-transform duration-500">
            <h3 className="text-2xl md:text-3xl font-light mb-4 text-blue-100">Целевой показатель к моменту IPO</h3>
            <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 mb-6 tracking-tight">
              $400 000 000 000
            </div>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Прогнозируемая рыночная капитализация группы компаний UST Inc. при реализации стратегического плана развития до 2045 года.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
            <div className="col-span-1 lg:col-span-2">
              <h3 className="text-2xl font-bold text-[#061325] mb-4">UST Inc.</h3>
              <p className="text-slate-600 mb-6 max-w-md">
                Инновационные транспортные решения для устойчивого развития городов и регионов. Инвестируйте в технологии, которые меняют мир.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#061325] mb-4">Контакты</h4>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>denshow7@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
            &copy; 2024 UST Inc. All rights reserved. Данные носят прогнозный характер.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default CapitalizationPlan;
