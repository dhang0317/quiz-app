// 多元情境離線語料庫：提供職場、日常生活、學術科技、社交旅遊等符合語境之模板與文章
export interface CorpusTemplate {
  id: string;
  theme: 'business' | 'daily' | 'technology' | 'academic';
  themeName: string;
  title: string;
  text: string;
  translation: string;
}

export const corpusBank: CorpusTemplate[] = [
  {
    id: 'corp-biz-1',
    theme: 'business',
    themeName: '職場商務與策略',
    title: '跨國團隊專案執行與協商',
    text: `During our quarterly strategic review, the executive committee decided to implement several progressive operational methods. To overcome bottlenecks, product managers and software engineers were encouraged to collaborate on agile sprints. The primary goal was to foster an innovative working environment while ensuring all milestone targets remained realistic and feasible. Adopting a fresh customer-centric perspective enabled the team to optimize key workflow stages, producing a substantial reduction in operational friction. Ahead of next quarter, directors will negotiate new vendor agreements to solidify these gains.`,
    translation: `在我們的季度策略審查期間，執行委員會決定實施幾種漸進式的營運方法。為了解決瓶頸，產品經理和軟體工程師被鼓勵在敏捷衝刺中緊密合作。首要目標是營造創新的工作環境，同時確保所有里程碑目標依然現實且切實可行。採用以客戶為中心的全新視角使團隊能夠優化關鍵工作流程階段，從而在消除營運摩擦方面取得了實質性進展。在下個季度之前，總監們將協商談判新的供應商協議，以鞏固這些成果。`
  },
  {
    id: 'corp-tech-2',
    theme: 'technology',
    themeName: '數位科技與未來趨勢',
    title: '人工智慧與雲端架構演進',
    text: `Modern software development demands organizations to rapidly implement automated deployment pipelines. Cross-disciplinary specialists now collaborate seamlessly across continents using distributed platforms. With innovative cloud solutions, architects can test whether expanding into edge computing is technologically feasible. Furthermore, analyzing telemetry data from a holistic perspective allows engineers to optimize memory allocation and resource usage. This ongoing transformation has triggered substantial performance improvements, allowing startups to negotiate better SLA commitments with global partners.`,
    translation: `現代軟體開發要求組織迅速實施自動化部署流程。跨領域專家現在使用分散式平台跨大洲無縫協作。借助創新的雲端解決方案，架構師可以測試擴展到邊緣運算在技術上是否可行。此外，從全域視角分析遙測數據可讓工程師優化記憶體配置和資源利用率。這種持續的轉變帶來了實質性的效能提升，使新創公司能與全球合作夥伴談判協商出更優質的 SLA 服務承諾。`
  },
  {
    id: 'corp-daily-3',
    theme: 'daily',
    themeName: '日常生活與目標管理',
    title: '自我精進與生活平衡',
    text: `To achieve genuine work-life harmony, individuals must consciously implement healthy daily habits and routines. It is equally important to collaborate with family members and mentors when facing unexpected life pressures. Exploring an innovative hobby or creative outlet can keep the mind active and cheerful. Always ask yourself whether your ambitious long-term goals are truly feasible within your current timeline. Shifting your mental perspective can turn everyday obstacles into growth opportunities. By taking small steps to optimize daily time management, you will experience a substantial boost in personal well-being, making it easier to negotiate compromises calmly.`,
    translation: `為了實現真正的工作與生活平衡，個人必須有意識地實施健康的生活習慣與日常作息。面對意想不到的生活壓力時，與家人和導師相互協同配合也同樣重要。探索創新的愛好或創造性途徑可以讓心智保持活躍與愉悅。時常捫心自問，在當前時間框架下你雄心勃勃的長期目標是否真正切實可行。轉變你的心理視角，可以將日常障礙轉化為成長機會。藉由採取微小行動優化日常時間管理，你將在個人幸福感上獲得實質性的提升，也能在日常妥協中更從容地協商溝通。`
  }
];
