import "./inner-ai-orbital.css";

const LOGO_SRC =
  "data:image/svg+xml;utf8,%3Csvg%20width%3D%2287%22%20height%3D%2220%22%20viewBox%3D%220%200%2087%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M2.25352%2019.7183H0V0H2.25352V19.7183Z%22%20fill%3D%22white%22/%3E%3Cpath%20d%3D%22M5.35871%2019.7183V5.6338H7.1897L7.47139%207.1831H7.61223C7.98782%206.71362%208.5512%206.29108%209.30237%205.91549C10.0535%205.53991%2010.8986%205.35211%2011.8376%205.35211C12.908%205.35211%2013.8658%205.60563%2014.7108%206.11268C15.5747%206.60094%2016.2507%207.29577%2016.739%208.19718C17.2273%209.09859%2017.4714%2010.1221%2017.4714%2011.2676V19.7183H15.3587V11.2676C15.3587%2010.5352%2015.1897%209.86854%2014.8517%209.26761C14.5136%208.66667%2014.0535%208.19718%2013.4714%207.85915C12.8892%207.50235%2012.2507%207.32394%2011.5559%207.32394C10.8235%207.32394%2010.1381%207.51174%209.49956%207.88732C8.87984%208.24413%208.38219%208.723%208.0066%209.32394C7.64979%209.92488%207.47139%2010.5728%207.47139%2011.2676V19.7183H5.35871Z%22%20fill%3D%22white%22/%3E%3Cpath%20d%3D%22M20.2971%2019.7183V5.6338H22.1281L22.4098%207.1831H22.5506C22.9262%206.71362%2023.4896%206.29108%2024.2408%205.91549C24.9919%205.53991%2025.837%205.35211%2026.776%205.35211C27.8464%205.35211%2028.8041%205.60563%2029.6492%206.11268C30.5131%206.60094%2031.1891%207.29577%2031.6774%208.19718C32.1656%209.09859%2032.4098%2010.1221%2032.4098%2011.2676V19.7183H30.2971V11.2676C30.2971%2010.5352%2030.1281%209.86854%2029.79%209.26761C29.452%208.66667%2028.9919%208.19718%2028.4098%207.85915C27.8276%207.50235%2027.1891%207.32394%2026.4943%207.32394C25.7619%207.32394%2025.0764%207.51174%2024.4379%207.88732C23.8182%208.24413%2023.3206%208.723%2022.945%209.32394C22.5882%209.92488%2022.4098%2010.5728%2022.4098%2011.2676V19.7183H20.2971Z%22%20fill%3D%22white%22/%3E%3Cpath%20d%3D%22M41.151%2020C39.8927%2020%2038.7472%2019.6901%2037.7143%2019.0704C36.6815%2018.4507%2035.8646%2017.5869%2035.2636%2016.4789C34.6815%2015.3709%2034.3904%2014.1033%2034.3904%2012.6761C34.3904%2011.2488%2034.6815%209.98122%2035.2636%208.87324C35.8646%207.76526%2036.6815%206.90141%2037.7143%206.28169C38.7472%205.66197%2039.8927%205.35211%2041.151%205.35211C42.3528%205.35211%2043.4514%205.64319%2044.4467%206.22535C45.442%206.80751%2046.2214%207.61502%2046.7848%208.64789C47.3481%209.66197%2047.6298%2010.8169%2047.6298%2012.1127C47.6298%2012.8638%2047.5829%2013.3803%2047.489%2013.662H36.5031C36.6345%2014.9765%2037.1416%2016.0376%2038.0242%2016.8451C38.9068%2017.6338%2039.9491%2018.0282%2041.151%2018.0282C41.996%2018.0282%2042.7472%2017.831%2043.4045%2017.4366C44.0805%2017.0423%2044.597%2016.4883%2044.9538%2015.7746H47.2073C46.719%2017.1268%2045.9491%2018.169%2044.8974%2018.9014C43.8646%2019.6338%2042.6157%2020%2041.151%2020ZM45.5172%2011.6901C45.442%2010.4131%2044.9913%209.37089%2044.165%208.56338C43.3575%207.73709%2042.3528%207.32394%2041.151%207.32394C39.8927%207.32394%2038.8411%207.73709%2037.996%208.56338C37.151%209.37089%2036.6533%2010.4131%2036.5031%2011.6901H45.5172Z%22%20fill%3D%22white%22/%3E%3Cpath%20d%3D%22M49.5962%2019.7183V5.6338H51.4271L51.7088%207.04225H51.8497C52.1689%206.55399%2052.5163%206.19718%2052.8919%205.97183C53.2675%205.74648%2053.8121%205.6338%2054.5257%205.6338H56.9201V7.60564H54.8074C53.8309%207.60564%2053.0703%207.87793%2052.5257%208.42253C51.9811%208.94836%2051.7088%209.70892%2051.7088%2010.7042V19.7183H49.5962Z%22%20fill%3D%22white%22/%3E%3Cpath%20d%3D%22M81.8543%2019.7183H77.8825L76.3895%2015.3521H67.967L66.474%2019.7183H62.5022L69.5163%200H74.8402L81.8543%2019.7183ZM71.9107%203.88732L69.0937%2012.0845H75.2628L72.474%203.88732H71.9107Z%22%20fill%3D%22white%22/%3E%3Cpath%20d%3D%22M86.3801%2019.7183H82.7181V0H86.3801V19.7183Z%22%20fill%3D%22white%22/%3E%3C/svg%3E";

export const InnerAIOrbital = () => {
  return (
    <div className="inner-ai-orbital" aria-label="Componente animado Inner AI com fundo transparente">
      <div className="ia-stage">
        <div className="grid-glow" />
        <div className="ambient-halo" />

        <svg className="connections" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="energyGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="rgba(58,168,255,0)" />
              <stop offset=".45" stopColor="rgba(88,180,255,.98)" />
              <stop offset=".75" stopColor="rgba(164,97,255,.88)" />
              <stop offset="1" stopColor="rgba(164,97,255,0)" />
            </linearGradient>
          </defs>

          <path className="line-base" d="M0 215 H228 C315 215 362 215 362 286 C362 335 438 353 506 353" />
          <path className="line-base" d="M0 450 H495" />
          <path className="line-base" d="M0 685 H228 C315 685 362 685 362 614 C362 565 438 547 506 547" />
          <path className="line-base" d="M1600 215 H1372 C1285 215 1238 215 1238 286 C1238 335 1162 353 1094 353" />
          <path className="line-base" d="M1600 450 H1105" />
          <path className="line-base" d="M1600 685 H1372 C1285 685 1238 685 1238 614 C1238 565 1162 547 1094 547" />

          <path className="line-energy" d="M0 215 H228 C315 215 362 215 362 286 C362 335 438 353 506 353" />
          <path className="line-energy delay-1" d="M0 450 H495" />
          <path className="line-energy delay-2" d="M0 685 H228 C315 685 362 685 362 614 C362 565 438 547 506 547" />
          <path className="line-energy reverse delay-3" d="M1600 215 H1372 C1285 215 1238 215 1238 286 C1238 335 1162 353 1094 353" />
          <path className="line-energy reverse delay-4" d="M1600 450 H1105" />
          <path className="line-energy reverse delay-2" d="M1600 685 H1372 C1285 685 1238 685 1238 614 C1238 565 1162 547 1094 547" />

          <circle className="pulse-node purple" cx="228" cy="215" r="5" />
          <circle className="pulse-node" cx="362" cy="286" r="5" />
          <circle className="pulse-node" cx="495" cy="450" r="5" />
          <circle className="pulse-node purple" cx="362" cy="614" r="5" />
          <circle className="pulse-node purple" cx="1372" cy="215" r="5" />
          <circle className="pulse-node" cx="1238" cy="286" r="5" />
          <circle className="pulse-node" cx="1105" cy="450" r="5" />
          <circle className="pulse-node purple" cx="1238" cy="614" r="5" />
        </svg>

        <div className="node-wrap node-purple top-left" aria-hidden="true">
          <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"><path d="M50 16v68"/><path d="M16 50h68"/><path d="M26 26l48 48"/><path d="M74 26L26 74"/><path d="M50 16v68" transform="rotate(22.5 50 50)"/><path d="M50 16v68" transform="rotate(67.5 50 50)"/></g></svg>
        </div>
        <div className="node-wrap node-blue mid-left" aria-hidden="true">
          <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round"><path d="M50 15 78 31v38L50 85 22 69V31Z"/><path d="M22 31 50 47 78 31"/><path d="M50 47v38"/><path d="M36 39 24 47 36 55"/><path d="M64 39 76 47 64 55"/></g></svg>
        </div>
        <div className="node-wrap node-purple bottom-left" aria-hidden="true">
          <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round"><path d="M18 34 50 18 82 34 50 50Z"/><path d="M18 50 50 66 82 50"/><path d="M18 66 50 82 82 66"/></g></svg>
        </div>
        <div className="node-wrap node-purple top-right" aria-hidden="true">
          <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"><path d="M18 30 C32 18 42 42 56 30 C69 19 78 25 86 30"/><path d="M16 48 C31 36 42 60 57 48 C70 37 79 43 88 48"/><path d="M18 66 C32 54 44 78 60 66 C72 57 80 61 86 66"/></g></svg>
        </div>
        <div className="node-wrap node-white mid-right" aria-hidden="true">
          <svg viewBox="0 0 100 100"><path d="M50 14 C55 36 64 45 86 50 C64 55 55 64 50 86 C45 64 36 55 14 50 C36 45 45 36 50 14Z" fill="currentColor"/></svg>
        </div>
        <div className="node-wrap node-blue bottom-right" aria-hidden="true">
          <svg viewBox="0 0 100 100"><g fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"><circle cx="50" cy="50" r="33"/><path d="M17 50h66"/><path d="M50 17c-13 13-13 53 0 66"/><path d="M50 17c13 13 13 53 0 66"/><path d="M25 30c16 8 34 8 50 0"/><path d="M25 70c16-8 34-8 50 0"/></g></svg>
        </div>

        <div className="card-stack">
          <div className="card-back left" />
          <div className="card-back right" />
          <div className="card-front">
            <div className="orb-core-wrap">
              <div className="orbit-ring" />
              <div className="orb-core">
                <img className="inner-logo" src={LOGO_SRC} alt="Inner AI" />
              </div>
            </div>
            <div className="vertical-link" />
            <div className="bottom-node" />
            <div className="glass-sweep" />
          </div>
        </div>

        <span className="particle p1" />
        <span className="particle purple p2" />
        <span className="particle p3" />
        <span className="particle purple p4" />
        <span className="particle p5" />
        <span className="particle purple p6" />
      </div>
    </div>
  );
};

export default InnerAIOrbital;