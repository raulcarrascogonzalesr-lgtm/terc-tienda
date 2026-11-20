// Dibujos de la página de empresas (generados desde la vista previa aprobada por Raúl el 20-11-2026).
// Todo es SVG: el fondo de cada escena es fijo y lleva trazo de tinta; a Terqui lo mueve lib/terqui-anim/empresas.js.
// Los equipos con ficha son <a class="emp-dev" data-p="…">: la página les pone el enlace al producto real.

export const DEFS = `<svg class="emp-defs" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
<defs>
  <linearGradient id="e-g-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <linearGradient id="e-g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--i-skyA)"/><stop offset="1" stop-color="var(--i-skyB)"/></linearGradient>
  <linearGradient id="e-g-hall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7e0d9"/><stop offset="1" stop-color="#c3cec6"/></linearGradient>
  <radialGradient id="e-g-glow"><stop offset="0" stop-color="var(--i-light)" stop-opacity=".75"/><stop offset="1" stop-color="var(--i-light)" stop-opacity="0"/></radialGradient>
  <radialGradient id="e-g-contact"><stop offset="0" stop-color="#1c2c28" stop-opacity=".32"/><stop offset="1" stop-color="#1c2c28" stop-opacity="0"/></radialGradient>
  <linearGradient id="e-g-pot" x1="0" x2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset=".56" stop-color="#000" stop-opacity=".12"/></linearGradient>

  <!-- Pantallas (contenido de apps claras, como en una oficina de verdad): 190 x 110 -->
  <symbol id="e-scr-dash" viewBox="0 0 190 110" preserveAspectRatio="none">
    <rect width="190" height="110" fill="var(--i-app)"/>
    <rect width="190" height="11" fill="var(--i-brand)"/><circle cx="8" cy="5.5" r="2.4" fill="#fff" opacity=".9"/><rect x="14" y="4" width="24" height="3" rx="1.5" fill="#fff" opacity=".7"/>
    <rect y="11" width="34" height="99" fill="var(--i-app2)"/>
    <g fill="var(--i-app-line)"><rect x="6" y="20" width="20" height="3" rx="1.5" fill="var(--i-brand)"/><rect x="6" y="29" width="16" height="3" rx="1.5"/><rect x="6" y="38" width="22" height="3" rx="1.5"/><rect x="6" y="47" width="14" height="3" rx="1.5"/></g>
    <g><rect x="42" y="18" width="42" height="22" rx="3" fill="#fff"/><rect x="47" y="23" width="16" height="2.6" rx="1.3" fill="var(--i-app-line)"/><rect x="47" y="30" width="26" height="5" rx="1.5" fill="var(--i-pine)"/>
       <rect x="90" y="18" width="42" height="22" rx="3" fill="#fff"/><rect x="95" y="23" width="18" height="2.6" rx="1.3" fill="var(--i-app-line)"/><rect x="95" y="30" width="22" height="5" rx="1.5" fill="var(--i-mustard)"/>
       <rect x="138" y="18" width="44" height="22" rx="3" fill="#fff"/><rect x="143" y="23" width="14" height="2.6" rx="1.3" fill="var(--i-app-line)"/><rect x="143" y="30" width="28" height="5" rx="1.5" fill="var(--i-coral)"/></g>
    <rect x="42" y="46" width="140" height="56" rx="3" fill="#fff"/>
    <path d="M48 62 H176 M48 74 H176 M48 86 H176" stroke="var(--i-app2)" stroke-width="1"/>
    <path d="M48 92 L64 84 L78 87 L94 74 L110 78 L126 64 L142 68 L158 56 L176 60 V96 H48 Z" fill="var(--i-brand-l)" opacity=".55"/>
    <path d="M48 92 L64 84 L78 87 L94 74 L110 78 L126 64 L142 68 L158 56 L176 60" stroke="var(--i-brand)" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <circle cx="158" cy="56" r="2.6" fill="#fff" stroke="var(--i-brand)" stroke-width="1.5"/>
  </symbol>
  <symbol id="e-scr-sheet" viewBox="0 0 190 110" preserveAspectRatio="none">
    <rect width="190" height="110" fill="#fff"/>
    <rect width="190" height="10" fill="#1f7a4f"/><rect x="5" y="3.5" width="20" height="3" rx="1.5" fill="#fff" opacity=".8"/>
    <rect y="10" width="190" height="9" fill="var(--i-app)"/><g fill="var(--i-app-line)"><rect x="5" y="13" width="10" height="3" rx="1"/><rect x="20" y="13" width="10" height="3" rx="1"/><rect x="35" y="13" width="10" height="3" rx="1"/></g>
    <rect y="19" width="190" height="8" fill="var(--i-app2)"/>
    <g stroke="var(--i-app2)" stroke-width=".8"><path d="M0 35 H190 M0 43 H190 M0 51 H190 M0 59 H190 M0 67 H190 M0 75 H190 M0 83 H190 M0 91 H190 M0 99 H190"/><path d="M14 19 V110 M54 19 V110 M86 19 V110 M114 19 V110"/></g>
    <rect x="54" y="43" width="32" height="8" fill="#d8efe3"/><rect x="54" y="43" width="32" height="8" fill="none" stroke="#1f7a4f" stroke-width="1.4"/>
    <g fill="var(--i-app-line)"><rect x="18" y="30" width="26" height="2.6" rx="1"/><rect x="18" y="38" width="30" height="2.6" rx="1"/><rect x="18" y="46" width="22" height="2.6" rx="1"/><rect x="18" y="54" width="28" height="2.6" rx="1"/><rect x="18" y="62" width="24" height="2.6" rx="1"/><rect x="18" y="70" width="30" height="2.6" rx="1"/>
      <rect x="62" y="30" width="18" height="2.6" rx="1"/><rect x="62" y="38" width="16" height="2.6" rx="1"/><rect x="62" y="54" width="20" height="2.6" rx="1"/><rect x="62" y="62" width="14" height="2.6" rx="1"/><rect x="62" y="70" width="18" height="2.6" rx="1"/>
      <rect x="92" y="30" width="16" height="2.6" rx="1"/><rect x="92" y="38" width="14" height="2.6" rx="1"/><rect x="92" y="46" width="18" height="2.6" rx="1"/><rect x="92" y="54" width="12" height="2.6" rx="1"/><rect x="92" y="62" width="16" height="2.6" rx="1"/></g>
    <rect x="122" y="30" width="62" height="54" rx="2" fill="var(--i-app)"/>
    <g><rect x="130" y="62" width="8" height="16" fill="var(--i-brand)"/><rect x="142" y="52" width="8" height="26" fill="var(--i-brand)"/><rect x="154" y="58" width="8" height="20" fill="var(--i-mustard)"/><rect x="166" y="44" width="8" height="34" fill="var(--i-brand)"/></g>
    <rect x="128" y="36" width="30" height="3" rx="1.5" fill="var(--i-app-line)"/>
  </symbol>
  <symbol id="e-scr-mail" viewBox="0 0 190 110" preserveAspectRatio="none">
    <rect width="190" height="110" fill="#fff"/>
    <rect width="190" height="11" fill="var(--i-app2)"/><rect x="50" y="3" width="90" height="5" rx="2.5" fill="#fff"/>
    <rect y="11" width="74" height="99" fill="var(--i-app)"/>
    <g><rect x="0" y="22" width="74" height="15" fill="#e3f3ea"/>
      <circle cx="9" cy="18" r="0" fill="none"/>
      <circle cx="10" cy="29.5" r="4.5" fill="var(--i-coral)"/><rect x="18" y="26" width="34" height="2.6" rx="1.2" fill="var(--i-pine)"/><rect x="18" y="31" width="46" height="2.2" rx="1.1" fill="var(--i-app-line)"/>
      <circle cx="10" cy="45" r="4.5" fill="var(--i-mustard)"/><rect x="18" y="41.5" width="28" height="2.6" rx="1.2" fill="var(--i-app-line)"/><rect x="18" y="46.5" width="44" height="2.2" rx="1.1" fill="var(--i-app-line)"/>
      <circle cx="10" cy="60.5" r="4.5" fill="var(--i-sky)"/><rect x="18" y="57" width="38" height="2.6" rx="1.2" fill="var(--i-app-line)"/><rect x="18" y="62" width="40" height="2.2" rx="1.1" fill="var(--i-app-line)"/>
      <circle cx="10" cy="76" r="4.5" fill="var(--i-brand)"/><rect x="18" y="72.5" width="30" height="2.6" rx="1.2" fill="var(--i-app-line)"/><rect x="18" y="77.5" width="46" height="2.2" rx="1.1" fill="var(--i-app-line)"/>
      <circle cx="10" cy="91.5" r="4.5" fill="var(--i-terra)"/><rect x="18" y="88" width="36" height="2.6" rx="1.2" fill="var(--i-app-line)"/><rect x="18" y="93" width="42" height="2.2" rx="1.1" fill="var(--i-app-line)"/></g>
    <rect x="84" y="20" width="60" height="4" rx="2" fill="var(--i-pine)"/>
    <g fill="var(--i-app-line)"><rect x="84" y="32" width="96" height="2.4" rx="1.2"/><rect x="84" y="38" width="90" height="2.4" rx="1.2"/><rect x="84" y="44" width="94" height="2.4" rx="1.2"/><rect x="84" y="50" width="70" height="2.4" rx="1.2"/><rect x="84" y="62" width="92" height="2.4" rx="1.2"/><rect x="84" y="68" width="80" height="2.4" rx="1.2"/></g>
    <rect x="84" y="82" width="34" height="11" rx="5.5" fill="var(--i-brand)"/>
  </symbol>
  <symbol id="e-scr-cal" viewBox="0 0 190 110" preserveAspectRatio="none">
    <rect width="190" height="110" fill="#fff"/>
    <rect width="190" height="12" fill="var(--i-app2)"/><rect x="6" y="4" width="34" height="4" rx="2" fill="var(--i-pine)"/>
    <g stroke="var(--i-app2)" stroke-width=".8"><path d="M20 12 V110 M54 12 V110 M88 12 V110 M122 12 V110 M156 12 V110"/><path d="M20 30 H190 M20 50 H190 M20 70 H190 M20 90 H190"/></g>
    <g fill="var(--i-app-line)"><rect x="4" y="28" width="10" height="2.4" rx="1"/><rect x="4" y="48" width="10" height="2.4" rx="1"/><rect x="4" y="68" width="10" height="2.4" rx="1"/><rect x="4" y="88" width="10" height="2.4" rx="1"/></g>
    <g fill="var(--i-app)"><rect x="20" y="12" width="34" height="10"/></g>
    <rect x="23" y="32" width="28" height="16" rx="2" fill="#d6efe2"/><rect x="23" y="32" width="2.4" height="16" fill="var(--i-brand)"/>
    <rect x="57" y="52" width="28" height="30" rx="2" fill="#f7e6c4"/><rect x="57" y="52" width="2.4" height="30" fill="var(--i-mustard)"/>
    <rect x="91" y="34" width="28" height="14" rx="2" fill="#f6d9d3"/><rect x="91" y="34" width="2.4" height="14" fill="var(--i-coral)"/>
    <rect x="125" y="62" width="28" height="22" rx="2" fill="#d9e9ef"/><rect x="125" y="62" width="2.4" height="22" fill="var(--i-sky)"/>
    <rect x="159" y="40" width="28" height="20" rx="2" fill="#d6efe2"/><rect x="159" y="40" width="2.4" height="20" fill="var(--i-brand)"/>
    <path d="M20 58 H190" stroke="var(--i-coral)" stroke-width="1.2"/><circle cx="20" cy="58" r="2.2" fill="var(--i-coral)"/>
  </symbol>
  <symbol id="e-scr-video" viewBox="0 0 190 110" preserveAspectRatio="none">
    <rect width="190" height="110" fill="#203432"/>
    <g>
      <rect x="4" y="4" width="89" height="46" rx="3" fill="#d9e6df"/><circle cx="48.5" cy="22" r="8" fill="#b9805e"/><path d="M30 50 Q48.5 30 67 50 Z" fill="var(--i-pine)"/><path d="M40.5 18 Q48.5 8 56.5 18 Q52 14 40.5 18 Z" fill="#3b2a22"/>
      <rect x="97" y="4" width="89" height="46" rx="3" fill="#ece3d2"/><circle cx="141.5" cy="22" r="8" fill="#e2b393"/><path d="M123 50 Q141.5 30 160 50 Z" fill="var(--i-coral)"/><path d="M132 20 Q134 9 145 11 Q152 13 151 22 Q147 15 132 20 Z" fill="#8a5a3b"/>
      <rect x="4" y="54" width="89" height="46" rx="3" fill="#e5ecf0"/><circle cx="48.5" cy="72" r="8" fill="#cf9a76"/><path d="M30 100 Q48.5 80 67 100 Z" fill="var(--i-mustard)"/><path d="M40 70 Q41 60 49 61 Q57 61 57 70 Q50 64 40 70 Z" fill="#2b2522"/>
      <rect x="97" y="54" width="89" height="46" rx="3" fill="#dfeee7"/>
      <g transform="translate(130 58) scale(.13)"><rect x="70" y="58" width="60" height="118" rx="13" fill="#0a2a2a"/><rect x="75.5" y="69" width="49" height="96" rx="7" fill="#eaf5f0"/><path d="M100 58 C100 46 96 36 90 30 M100 52 C112 40 124 38 134 40 C126 52 114 56 100 52 Z M100 50 C88 38 76 36 66 38 C74 50 86 54 100 50 Z" fill="#288868" stroke="#288868" stroke-width="3"/><circle cx="90" cy="110" r="4" fill="#0a2a2a"/><circle cx="110" cy="110" r="4" fill="#0a2a2a"/><path d="M90 126 Q100 134 110 126" stroke="#0a2a2a" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>
    </g>
    <g fill="#fff" opacity=".85"><rect x="8" y="44" width="22" height="3" rx="1.5"/><rect x="101" y="44" width="18" height="3" rx="1.5"/><rect x="8" y="94" width="20" height="3" rx="1.5"/><rect x="101" y="94" width="26" height="3" rx="1.5"/></g>
    <circle cx="95" cy="105.5" r="3.2" fill="#e05a4f"/>
  </symbol>

  <!-- All-in-One: 200 x 175 (pantalla en x7 y6, 186 x 108) -->
  <symbol id="e-aio" viewBox="0 0 200 175">
    <path d="M60 168 Q100 158 140 168 L138 174 H62 Z" fill="var(--i-metal)"/>
    <path d="M88 126 H112 L117 166 H83 Z" fill="var(--i-metal-l)"/>
    <path d="M100 126 H112 L117 166 H100 Z" fill="var(--i-metal)" opacity=".45"/>
    <rect x="0" y="0" width="200" height="134" rx="6" fill="var(--i-dev)"/>
    <rect x="96" y="1.6" width="8" height="2.6" rx="1.3" fill="var(--i-dev2)"/>
    <path d="M0 116 H200 V128 Q200 134 194 134 H6 Q0 134 0 128 Z" fill="var(--i-metal-l)"/>
    <path d="M0 116 H200 V119 H0 Z" fill="var(--i-metal)" opacity=".5"/>
    <rect x="94" y="123" width="12" height="2.4" rx="1.2" fill="var(--i-metal)"/>
    <rect x="196" y="6" width="4" height="108" fill="#000" opacity=".18"/>
  </symbol>
  <symbol id="e-glare" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M58 0 H78 L42 100 H22 Z" fill="#fff" opacity=".1"/><path d="M84 0 H90 L54 100 H48 Z" fill="#fff" opacity=".08"/></symbol>
  <symbol id="e-aio-dash" viewBox="0 0 200 175"><use href="#e-aio"/><use href="#e-scr-dash" x="7" y="6" width="186" height="108"/><use href="#e-glare" x="7" y="6" width="186" height="108"/></symbol>
  <symbol id="e-aio-cal" viewBox="0 0 200 175"><use href="#e-aio"/><use href="#e-scr-cal" x="7" y="6" width="186" height="108"/><use href="#e-glare" x="7" y="6" width="186" height="108"/></symbol>
  <symbol id="e-aio-sheet" viewBox="0 0 200 175"><use href="#e-aio"/><use href="#e-scr-sheet" x="7" y="6" width="186" height="108"/><use href="#e-glare" x="7" y="6" width="186" height="108"/></symbol>
  <!-- All-in-One Lenovo (barra inferior oscura y pie distinto) -->
  <symbol id="e-aio-len" viewBox="0 0 200 175">
    <path d="M70 164 H130 L134 174 H66 Z" fill="var(--i-dev2)"/>
    <path d="M94 128 H106 L112 166 H88 Z" fill="var(--i-dev2)"/>
    <rect x="0" y="0" width="200" height="132" rx="4" fill="var(--i-dev)"/>
    <rect x="0" y="114" width="200" height="18" rx="0" fill="var(--i-dev2)"/><rect x="0" y="128" width="200" height="4" rx="2" fill="var(--i-dev2)"/>
    <rect x="90" y="121" width="20" height="3" rx="1.5" fill="var(--i-metal)"/>
    <use href="#e-scr-dash" x="6" y="6" width="188" height="106"/><use href="#e-glare" x="6" y="6" width="188" height="106"/>
  </symbol>

  <!-- Notebook abierto: 200 x 120 (pantalla x32 y6, 136 x 82) -->
  <symbol id="e-nb" viewBox="0 0 200 120">
    <path d="M32 0 H168 Q174 0 174 6 V92 H26 V6 Q26 0 32 0 Z" fill="var(--i-dev)"/>
    <path d="M14 92 H186 L198 109 Q199 115 193 115 H7 Q1 115 2 109 Z" fill="var(--i-metal-l)"/>
    <path d="M30 95 H170 L175 105 H25 Z" fill="var(--i-metal)"/>
    <path d="M29 98.4 H171 M27 101.8 H173" stroke="var(--i-metal-l)" stroke-width=".8" opacity=".7"/>
    <rect x="84" y="107" width="32" height="5" rx="1.5" fill="var(--i-metal)" opacity=".55"/>
    <path d="M2 111 Q100 119 198 111 V113 Q199 118 193 118 H7 Q1 118 2 113 Z" fill="var(--i-metal)" opacity=".7"/>
  </symbol>
  <symbol id="e-nb-mail" viewBox="0 0 200 120"><use href="#e-nb"/><use href="#e-scr-mail" x="32" y="6" width="136" height="82"/><use href="#e-glare" x="32" y="6" width="136" height="82"/></symbol>
  <symbol id="e-nb-video" viewBox="0 0 200 120"><use href="#e-nb"/><use href="#e-scr-video" x="32" y="6" width="136" height="82"/><use href="#e-glare" x="32" y="6" width="136" height="82"/></symbol>
  <symbol id="e-nb-sheet" viewBox="0 0 200 120"><use href="#e-nb"/><use href="#e-scr-sheet" x="32" y="6" width="136" height="82"/><use href="#e-glare" x="32" y="6" width="136" height="82"/></symbol>

  <!-- Monitor: 200 x 165 (pantalla x4 y4, 192 x 104) -->
  <symbol id="e-mon" viewBox="0 0 200 165">
    <path d="M64 158 Q100 152 136 158 L134 164 H66 Z" fill="var(--i-metal)"/>
    <rect x="92" y="110" width="16" height="48" rx="2" fill="var(--i-metal-l)"/><rect x="100" y="110" width="8" height="48" fill="var(--i-metal)" opacity=".4"/>
    <rect x="0" y="0" width="200" height="114" rx="4" fill="var(--i-dev)"/>
    <rect x="0" y="108" width="200" height="6" rx="2" fill="var(--i-dev2)"/><circle cx="188" cy="111" r="1.2" fill="var(--i-brand-l)"/>
  </symbol>
  <symbol id="e-mon-sheet" viewBox="0 0 200 165"><use href="#e-mon"/><use href="#e-scr-sheet" x="4" y="4" width="192" height="104"/><use href="#e-glare" x="4" y="4" width="192" height="104"/></symbol>
  <symbol id="e-mon-mail" viewBox="0 0 200 165"><use href="#e-mon"/><use href="#e-scr-mail" x="4" y="4" width="192" height="104"/><use href="#e-glare" x="4" y="4" width="192" height="104"/></symbol>

  <!-- PC SFF acostado: 160 x 40 -->
  <symbol id="e-sff" viewBox="0 0 160 40">
    <rect x="0" y="2" width="160" height="36" rx="3" fill="var(--i-dev2)"/>
    <rect x="0" y="2" width="160" height="4" rx="2" fill="var(--i-metal)" opacity=".5"/>
    <rect x="0" y="2" width="36" height="36" rx="3" fill="var(--i-dev)"/>
    <circle cx="18" cy="13" r="3.6" fill="none" stroke="var(--i-metal-l)" stroke-width="1.2"/><circle cx="18" cy="13" r="1.1" fill="var(--i-brand-l)"/>
    <rect x="9" y="23" width="7" height="3" rx=".6" fill="var(--i-metal)"/><rect x="20" y="23" width="7" height="3" rx=".6" fill="var(--i-metal)"/><circle cx="12" cy="31" r="1.4" fill="var(--i-metal)"/>
    <g fill="var(--i-dev)" opacity=".7"><rect x="46" y="12" width="2" height="18"/><rect x="51" y="12" width="2" height="18"/><rect x="56" y="12" width="2" height="18"/><rect x="61" y="12" width="2" height="18"/><rect x="66" y="12" width="2" height="18"/><rect x="71" y="12" width="2" height="18"/></g>
    <rect x="138" y="14" width="14" height="4" rx="1" fill="var(--i-metal)" opacity=".5"/>
    <rect x="0" y="35" width="160" height="3" fill="#000" opacity=".2"/>
  </symbol>
  <!-- Mini PC (Micro): 70 x 22 -->
  <symbol id="e-mini" viewBox="0 0 70 22">
    <rect x="0" y="2" width="70" height="18" rx="2.5" fill="var(--i-dev2)"/>
    <rect x="0" y="2" width="70" height="3" rx="1.5" fill="var(--i-metal)" opacity=".5"/>
    <g fill="var(--i-dev)"><rect x="6" y="9" width="2" height="7"/><rect x="10" y="9" width="2" height="7"/><rect x="14" y="9" width="2" height="7"/><rect x="18" y="9" width="2" height="7"/><rect x="22" y="9" width="2" height="7"/></g>
    <circle cx="61" cy="11" r="2.4" fill="none" stroke="var(--i-metal-l)" stroke-width="1"/><circle cx="61" cy="11" r=".8" fill="var(--i-brand-l)"/>
    <rect x="48" y="10" width="5" height="2.4" rx=".5" fill="var(--i-metal)"/>
  </symbol>
  <!-- Teclado + mouse: 150 x 16 -->
  <symbol id="e-kb" viewBox="0 0 150 16">
    <path d="M5 4 H111 L115 13 H1 Z" fill="var(--i-metal-l)"/><path d="M1 13 H115 V15 H1 Z" fill="var(--i-metal)"/>
    <path d="M7 6.6 H110 M5 9 H112 M3.6 11.2 H113" stroke="var(--i-metal)" stroke-width=".8" opacity=".8"/>
    <rect x="126" y="9" width="22" height="6" rx="1.5" fill="var(--i-pine)" opacity=".9"/>
    <ellipse cx="137" cy="10" rx="6.5" ry="3.6" fill="var(--i-metal-l)"/><path d="M137 6.6 V8.8" stroke="var(--i-metal)" stroke-width=".9"/>
  </symbol>
  <!-- Silla: 90 x 140 (colores con --c1 y --c2) -->
  <symbol id="e-chair" viewBox="0 0 90 140">
    <rect x="16" y="0" width="58" height="64" rx="16" fill="var(--c1)"/>
    <path d="M45 0 H58 Q74 0 74 16 V48 Q74 64 58 64 H45 Z" fill="#000" opacity=".1"/>
    <rect x="41" y="60" width="8" height="10" fill="var(--i-metal)"/>
    <rect x="4" y="66" width="82" height="17" rx="8.5" fill="var(--c1)"/><rect x="4" y="76" width="82" height="7" rx="3.5" fill="var(--c2)"/>
    <rect x="0" y="54" width="8" height="22" rx="4" fill="var(--c2)"/><rect x="82" y="54" width="8" height="22" rx="4" fill="var(--c2)"/>
    <rect x="41.5" y="83" width="7" height="32" fill="var(--i-metal)"/><rect x="45" y="83" width="3.5" height="32" fill="var(--i-dev2)" opacity=".3"/>
    <path d="M45 115 L10 127 M45 115 L80 127 M45 115 L27 131 M45 115 L63 131" stroke="var(--i-dev2)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="10" cy="131" r="5" fill="var(--i-dev)"/><circle cx="80" cy="131" r="5" fill="var(--i-dev)"/><circle cx="27" cy="135" r="5" fill="var(--i-dev)"/><circle cx="63" cy="135" r="5" fill="var(--i-dev)"/>
  </symbol>
  <!-- Planta grande en macetero: 90 x 150 -->
  <symbol id="e-plant" viewBox="0 0 90 150">
    <g>
      <path d="M45 104 C40 86 26 72 8 66 C18 82 30 94 45 102 Z" fill="var(--i-l1)"/>
      <path d="M45 104 C50 80 66 62 86 54 C78 74 62 92 45 102 Z" fill="var(--i-l2)"/>
      <path d="M45 102 C38 70 40 38 54 8 C62 40 56 72 45 102 Z" fill="var(--i-l1)"/>
      <path d="M54 8 C50 40 48 70 45 100" stroke="var(--i-l3)" stroke-width="1.2" fill="none" opacity=".6"/>
      <path d="M45 102 C30 72 22 46 26 24 C40 44 46 72 45 102 Z" fill="var(--i-l2)"/>
      <path d="M45 104 C56 88 70 84 82 80 C70 76 56 82 45 98 Z" fill="var(--i-l3)"/>
      <path d="M45 104 C34 92 20 90 4 92 C16 98 30 102 45 104 Z" fill="var(--i-l2)"/>
      <path d="M26 24 C34 46 42 72 45 100" stroke="var(--i-l1)" stroke-width="1" fill="none" opacity=".5"/>
    </g>
    <path d="M20 100 H70 L64 148 H26 Z" fill="var(--p1)"/>
    <path d="M20 100 H70 L64 148 H26 Z" fill="url(#e-g-pot)"/>
    <rect x="17" y="98" width="56" height="8" rx="2" fill="var(--p1)"/><rect x="17" y="104" width="56" height="2" fill="#000" opacity=".1"/>
  </symbol>
  <!-- Planta colgante (potus) para repisa: 70 x 90 -->
  <symbol id="e-pothos" viewBox="0 0 70 90">
    <path d="M22 4 H48 L45 24 H25 Z" fill="var(--i-cream)"/><path d="M35 4 H48 L45 24 H35 Z" fill="var(--i-cream-d)"/>
    <g>
      <path d="M26 20 C18 34 16 54 20 84" stroke="var(--i-l1)" stroke-width="1.4" fill="none"/>
      <path d="M44 20 C52 36 50 52 54 70" stroke="var(--i-l1)" stroke-width="1.4" fill="none"/>
      <g fill="var(--i-l2)"><ellipse cx="18" cy="34" rx="6" ry="4" transform="rotate(-30 18 34)"/><ellipse cx="22" cy="50" rx="6" ry="4" transform="rotate(25 22 50)"/><ellipse cx="17" cy="64" rx="5.5" ry="3.6" transform="rotate(-20 17 64)"/><ellipse cx="22" cy="80" rx="5" ry="3.4" transform="rotate(20 22 80)"/>
      <ellipse cx="52" cy="36" rx="6" ry="4" transform="rotate(30 52 36)"/><ellipse cx="48" cy="54" rx="5.5" ry="3.8" transform="rotate(-25 48 54)"/><ellipse cx="56" cy="68" rx="5" ry="3.4" transform="rotate(20 56 68)"/></g>
      <g fill="var(--i-l1)"><ellipse cx="28" cy="12" rx="7" ry="4.6" transform="rotate(-35 28 12)"/><ellipse cx="42" cy="11" rx="7" ry="4.6" transform="rotate(30 42 11)"/><ellipse cx="35" cy="6" rx="6" ry="4" /></g>
    </g>
  </symbol>
  <!-- Suculenta de escritorio: 40 x 50 -->
  <symbol id="e-succ" viewBox="0 0 40 50">
    <path d="M20 31 C10 27 6 17 8 11 C16 15 20 23 20 31 Z" fill="var(--i-l2)"/>
    <path d="M20 31 C30 27 34 17 32 11 C24 15 20 23 20 31 Z" fill="var(--i-l1)"/>
    <path d="M20 31 C16 21 17 11 20 4 C23 11 24 21 20 31 Z" fill="var(--i-l3)"/>
    <path d="M10 30 H30 L28 48 H12 Z" fill="var(--i-terra)"/><path d="M20 30 H30 L28 48 H20 Z" fill="var(--i-terra-d)"/><rect x="9" y="29" width="22" height="3" rx="1" fill="var(--i-terra)"/>
  </symbol>
  <!-- Lámpara de escritorio: 60 x 90 -->
  <symbol id="e-lamp" viewBox="0 0 60 90">
    <ellipse cx="18" cy="86" rx="15" ry="3.6" fill="var(--i-pine)"/><rect x="3" y="82" width="30" height="4" rx="2" fill="var(--i-pine)"/>
    <path d="M18 83 L10 46 L40 24" stroke="var(--i-pine)" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="10" cy="46" r="3.4" fill="var(--i-pine-d)"/>
    <path d="M34 16 L58 31 L48 41 L26 25 Z" fill="var(--i-pine)"/><path d="M50 37 L58 31 L48 41 Z" fill="var(--i-light)"/>
  </symbol>
  <!-- Taza con vapor: 26 x 40 -->
  <symbol id="e-mug" viewBox="0 0 26 40">
    <path d="M2 16 H20 V34 Q20 39 15 39 H7 Q2 39 2 34 Z" fill="var(--m1,var(--i-paper))"/>
    <path d="M20 21 Q26 21 26 26 Q26 31 20 31" stroke="var(--m1,var(--i-paper))" stroke-width="3" fill="none"/>
    <path d="M12 16 H20 V34 Q20 39 15 39 H12 Z" fill="#000" opacity=".07"/>
    <ellipse cx="11" cy="16" rx="9" ry="2" fill="#6b4a2e"/>
  </symbol>
  <!-- Ventana alta con ciudad y persiana: 200 x 220 -->
  <symbol id="e-window" viewBox="0 0 200 220">
    <rect x="0" y="0" width="200" height="212" rx="2" fill="var(--i-trim)"/>
    <rect x="10" y="10" width="180" height="192" fill="url(#e-g-sky)"/>
    <g fill="var(--i-city)"><rect x="14" y="120" width="28" height="82"/><rect x="46" y="96" width="24" height="106"/><rect x="74" y="132" width="20" height="70"/><rect x="108" y="84" width="22" height="118"/><path d="M112 84 L119 70 L126 84 Z"/><rect x="134" y="116" width="30" height="86"/><rect x="166" y="138" width="22" height="64"/></g>
    <g fill="var(--i-city2)"><rect x="30" y="150" width="34" height="52"/><rect x="120" y="150" width="40" height="52"/></g>
    <g fill="#fff" opacity=".5"><rect x="50" y="104" width="4" height="5"/><rect x="58" y="104" width="4" height="5"/><rect x="50" y="116" width="4" height="5"/><rect x="58" y="128" width="4" height="5"/><rect x="112" y="94" width="4" height="5"/><rect x="120" y="106" width="4" height="5"/><rect x="112" y="122" width="4" height="5"/><rect x="140" y="124" width="4" height="5"/><rect x="150" y="136" width="4" height="5"/><rect x="18" y="130" width="4" height="5"/></g>
    <path d="M150 40 q6 -4 12 0 q6 -4 12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
    <rect x="96" y="10" width="8" height="192" fill="var(--i-trim)"/>
    <rect x="10" y="10" width="180" height="58" fill="#f3efe4"/>
    <path d="M10 18 H190 M10 26 H190 M10 34 H190 M10 42 H190 M10 50 H190 M10 58 H190" stroke="#e1dbcb" stroke-width="1.4"/>
    <rect x="10" y="64" width="180" height="5" rx="1.5" fill="#d9d1bc"/>
    <path d="M180 69 V112" stroke="#cfc6ae" stroke-width="1"/><circle cx="180" cy="114" r="2" fill="#cfc6ae"/>
    <rect x="10" y="10" width="180" height="192" fill="url(#e-g-glass)"/>
    <rect x="-8" y="204" width="216" height="9" rx="2" fill="var(--i-trim)"/><rect x="-8" y="211" width="216" height="3" fill="#000" opacity=".06"/>
  </symbol>
  <!-- Lámpara colgante: 60 x 120 -->
  <symbol id="e-pendant" viewBox="0 0 60 120">
    <path d="M30 0 V82" stroke="var(--i-leg)" stroke-width="1.4"/>
    <rect x="27" y="78" width="6" height="6" rx="1" fill="var(--i-leg)"/>
    <path d="M10 104 Q12 82 30 82 Q48 82 50 104 Z" fill="var(--sh,var(--i-pine))"/>
    <path d="M30 82 Q48 82 50 104 H30 Z" fill="#000" opacity=".12"/>
    <ellipse cx="30" cy="104" rx="20" ry="3.2" fill="var(--i-light)"/>
  </symbol>
  <!-- Reloj: 40 x 40 -->
  <symbol id="e-clock" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="19" fill="var(--i-leg)"/><circle cx="20" cy="20" r="16.5" fill="var(--i-paper)"/>
    <g stroke="var(--i-metal)" stroke-width="1.2"><path d="M20 5.5 V8 M34.5 20 H32 M20 34.5 V32 M5.5 20 H8"/></g>
    <path d="M20 20 V10 M20 20 L27 24" stroke="var(--i-leg)" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M20 20 L12 28" stroke="var(--i-coral)" stroke-width="1"/><circle cx="20" cy="20" r="1.6" fill="var(--i-leg)"/>
  </symbol>
  <!-- Cuadro: 90 x 70 -->
  <symbol id="e-art" viewBox="0 0 90 70">
    <rect width="90" height="70" fill="var(--i-oak-d)"/><rect x="4" y="4" width="82" height="62" fill="var(--i-paper)"/>
    <rect x="12" y="12" width="66" height="46" fill="#e7efe9"/>
    <path d="M12 58 L30 34 L42 46 L56 28 L78 58 Z" fill="var(--i-pine)"/>
    <path d="M12 58 L30 34 L36 42 L26 58 Z" fill="var(--i-l2)" opacity=".8"/>
    <circle cx="64" cy="22" r="6" fill="var(--i-mustard)"/>
  </symbol>
  <!-- Repisa con libros, archivadores y caja TERC: 200 x 90 -->
  <symbol id="e-shelf" viewBox="0 0 200 90">
    <rect x="4" y="22" width="13" height="58" rx="1.5" fill="var(--i-pine)"/><rect x="18" y="22" width="13" height="58" rx="1.5" fill="var(--i-mustard)"/><rect x="32" y="22" width="13" height="58" rx="1.5" fill="var(--i-pine)"/>
    <g fill="var(--i-paper)" opacity=".9"><rect x="6.5" y="30" width="8" height="10" rx="1"/><rect x="20.5" y="30" width="8" height="10" rx="1"/><rect x="34.5" y="30" width="8" height="10" rx="1"/></g>
    <g fill="var(--i-paper)"><circle cx="10.5" cy="68" r="2.4"/><circle cx="24.5" cy="68" r="2.4"/><circle cx="38.5" cy="68" r="2.4"/></g>
    <rect x="50" y="40" width="9" height="40" fill="var(--i-coral)"/><rect x="60" y="34" width="7" height="46" fill="var(--i-sky)"/><rect x="68" y="44" width="10" height="36" fill="var(--i-cream-d)"/>
    <path d="M79 80 L88 44 L96 46 L87 80 Z" fill="var(--i-terra)"/>
    <g transform="translate(118 50)"><rect width="44" height="30" rx="1.5" fill="var(--i-kraft)"/><rect width="44" height="7" fill="var(--i-kraft-d)"/><rect x="19" width="6" height="30" fill="var(--i-kraft-d)" opacity=".6"/><text x="22" y="22" text-anchor="middle" font-size="8" font-weight="800" fill="var(--i-pine)" letter-spacing=".5">TERC</text></g>
    <use href="#e-pothos" x="160" y="22" width="44" height="66"/>
    <rect x="0" y="80" width="200" height="7" rx="1.5" fill="var(--i-oak)"/><rect x="0" y="85" width="200" height="3" fill="var(--i-oak-d)"/>
    <path d="M14 88 L14 94 M186 88 L186 94" stroke="var(--i-leg)" stroke-width="3"/>
  </symbol>
  <!-- Pizarra de corcho con notas: 92 x 66 -->
  <symbol id="e-cork" viewBox="0 0 92 66">
    <rect width="92" height="66" rx="2" fill="var(--i-oak-d)"/><rect x="4" y="4" width="84" height="58" fill="#d2ab78"/>
    <g fill="#c49b67"><circle cx="16" cy="54" r=".9"/><circle cx="40" cy="12" r=".9"/><circle cx="70" cy="50" r=".9"/><circle cx="78" cy="20" r=".9"/><circle cx="28" cy="30" r=".9"/></g>
    <rect x="10" y="10" width="22" height="20" fill="#f3d27a" transform="rotate(-4 21 20)"/><rect x="38" y="9" width="24" height="18" fill="var(--i-paper)" transform="rotate(3 50 18)"/>
    <rect x="64" y="12" width="18" height="18" fill="#a9dcc2" transform="rotate(5 73 21)"/><rect x="14" y="36" width="30" height="20" fill="var(--i-paper)" transform="rotate(2 29 46)"/>
    <rect x="50" y="34" width="20" height="20" fill="#f2b3a6" transform="rotate(-6 60 44)"/>
    <g stroke="#9a8a6a" stroke-width=".9"><path d="M14 18 H28 M14 22 H26"/><path d="M42 16 H58 M42 20 H54"/><path d="M18 43 H40 M18 47 H36 M18 51 H32"/></g>
    <g><circle cx="21" cy="12" r="1.6" fill="var(--i-coral)"/><circle cx="50" cy="11" r="1.6" fill="var(--i-brand)"/><circle cx="73" cy="14" r="1.6" fill="var(--i-mustard)"/><circle cx="29" cy="38" r="1.6" fill="var(--i-sky)"/><circle cx="60" cy="36" r="1.6" fill="var(--i-pine)"/></g>
  </symbol>
  <!-- Caja TERC cerrada: 60 x 46 -->
  <symbol id="e-box" viewBox="0 0 60 46">
    <rect x="0" y="6" width="60" height="40" rx="2" fill="var(--i-kraft)"/><path d="M30 6 H60 V44 Q60 46 58 46 H30 Z" fill="#000" opacity=".07"/>
    <rect x="0" y="6" width="60" height="7" fill="var(--i-kraft-d)"/><rect x="26" y="6" width="8" height="40" fill="#e9c995" opacity=".8"/>
    <text x="16" y="34" text-anchor="middle" font-size="8.5" font-weight="800" fill="var(--i-pine)" letter-spacing=".4">TERC</text>
    <path d="M44 26 q4 -6 8 -2 q-4 1 -8 2 Z" fill="var(--i-brand)"/>
  </symbol>
  <!-- Caja TERC abierta: 80 x 64 -->
  <symbol id="e-box-open" viewBox="0 0 80 64">
    <path d="M10 22 L0 8 L22 14 Z" fill="var(--i-kraft-d)"/><path d="M70 22 L80 6 L58 14 Z" fill="var(--i-kraft-d)"/>
    <path d="M10 22 H70 L66 14 H14 Z" fill="#9c7444"/>
    <path d="M18 18 Q30 8 40 16 Q50 6 62 18 Z" fill="var(--i-paper)"/>
    <rect x="10" y="22" width="60" height="42" rx="2" fill="var(--i-kraft)"/><path d="M40 22 H70 V62 Q70 64 68 64 H40 Z" fill="#000" opacity=".07"/>
    <text x="26" y="48" text-anchor="middle" font-size="9" font-weight="800" fill="var(--i-pine)" letter-spacing=".4">TERC</text>
  </symbol>
  <!-- Papelero: 26 x 32 -->
  <symbol id="e-bin" viewBox="0 0 26 32">
    <path d="M3 4 Q6 0 10 3 Q14 -1 17 4 Z" fill="var(--i-paper)"/>
    <path d="M1 4 H25 L22 32 H4 Z" fill="var(--i-leg)"/>
    <g stroke="var(--i-dev2)" stroke-width=".8"><path d="M5 6 L7 30 M9 6 L10 30 M13 6 V30 M17 6 L16 30 M21 6 L19 30"/></g>
  </symbol>
  <!-- Calendario de pared noviembre: 56 x 64 -->
  <symbol id="e-calendar" viewBox="0 0 56 64">
    <rect width="56" height="64" rx="2" fill="var(--i-paper)"/><rect width="56" height="16" rx="2" fill="var(--i-coral)"/>
    <text x="28" y="11.5" text-anchor="middle" font-size="8" font-weight="800" fill="#fff" letter-spacing=".6">NOV</text>
    <g fill="var(--i-app-line)">
      <rect x="45" y="21" width="6" height="5" rx="1"/>
      <rect x="5" y="29" width="6" height="5" rx="1"/><rect x="12" y="29" width="6" height="5" rx="1"/><rect x="19" y="29" width="6" height="5" rx="1"/><rect x="26" y="29" width="6" height="5" rx="1"/><rect x="33" y="29" width="6" height="5" rx="1"/><rect x="39" y="29" width="6" height="5" rx="1"/><rect x="45" y="29" width="6" height="5" rx="1"/>
      <rect x="5" y="37" width="6" height="5" rx="1"/><rect x="12" y="37" width="6" height="5" rx="1"/><rect x="19" y="37" width="6" height="5" rx="1"/><rect x="26" y="37" width="6" height="5" rx="1"/><rect x="33" y="37" width="6" height="5" rx="1"/><rect x="39" y="37" width="6" height="5" rx="1"/><rect x="45" y="37" width="6" height="5" rx="1"/>
      <rect x="5" y="45" width="6" height="5" rx="1"/><rect x="12" y="45" width="6" height="5" rx="1"/><rect x="19" y="45" width="6" height="5" rx="1"/><rect x="26" y="45" width="6" height="5" rx="1"/><rect x="39" y="45" width="6" height="5" rx="1"/><rect x="45" y="45" width="6" height="5" rx="1"/>
      <rect x="5" y="53" width="6" height="5" rx="1"/><rect x="12" y="53" width="6" height="5" rx="1"/><rect x="19" y="53" width="6" height="5" rx="1"/><rect x="26" y="53" width="6" height="5" rx="1"/><rect x="33" y="53" width="6" height="5" rx="1"/><rect x="39" y="53" width="6" height="5" rx="1"/><rect x="45" y="53" width="6" height="5" rx="1"/>
    </g>
    <circle cx="36" cy="47.5" r="4.6" fill="none" stroke="var(--i-coral)" stroke-width="1.4"/><rect x="33" y="45" width="6" height="5" rx="1" fill="var(--i-coral)" opacity=".35"/>
    <circle cx="14" cy="0" r="2" fill="var(--i-leg)"/><circle cx="42" cy="0" r="2" fill="var(--i-leg)"/>
  </symbol>
  <!-- Calculadora: 22 x 14 -->
  <symbol id="e-calc" viewBox="0 0 22 14"><path d="M2 2 H20 L22 13 H0 Z" fill="var(--i-dev2)"/><rect x="5" y="3" width="12" height="3" fill="var(--i-brand-l)"/><g fill="var(--i-metal-l)"><rect x="4" y="8" width="3" height="1.6"/><rect x="9" y="8" width="3" height="1.6"/><rect x="14" y="8" width="3" height="1.6"/><rect x="3.6" y="10.6" width="3" height="1.6"/><rect x="9" y="10.6" width="3" height="1.6"/><rect x="14.4" y="10.6" width="3" height="1.6" fill="var(--i-coral)"/></g></symbol>
  <!-- Celular sobre la mesa (de lado): 22 x 4 -->
  <symbol id="e-phone" viewBox="0 0 22 4"><rect width="22" height="3.4" rx="1.6" fill="var(--i-dev)"/><rect x="2" y=".6" width="18" height="1" rx=".5" fill="var(--i-dev2)"/></symbol>
  <!-- Portalápices: 16 x 26 -->
  <symbol id="e-pens" viewBox="0 0 16 26"><path d="M4 2 L5 12 M8 0 V12 M12 3 L11 12" stroke-width="1.8" stroke-linecap="round" stroke="var(--i-coral)"/><path d="M8 0 V12" stroke="var(--i-pine)" stroke-width="1.8"/><path d="M12 3 L11 12" stroke="var(--i-mustard)" stroke-width="1.8"/><rect x="1" y="10" width="14" height="16" rx="2" fill="var(--i-leg)"/></symbol>
  <!-- Pizarra blanca: 150 x 90 -->
  <symbol id="e-board" viewBox="0 0 150 90">
    <rect width="150" height="90" rx="3" fill="var(--i-metal-l)"/><rect x="4" y="4" width="142" height="80" fill="#fbfcfb"/>
    <rect x="30" y="84" width="90" height="4" rx="1" fill="var(--i-metal)"/><rect x="40" y="81" width="10" height="3" rx="1" fill="var(--i-coral)"/><rect x="54" y="81" width="10" height="3" rx="1" fill="var(--i-brand)"/>
    <g fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="14" y="16" width="30" height="16" rx="3" stroke="var(--i-brand)"/><rect x="62" y="16" width="30" height="16" rx="3" stroke="var(--i-brand)"/><rect x="62" y="48" width="30" height="16" rx="3" stroke="var(--i-coral)"/>
      <path d="M44 24 H62 M77 32 V48" stroke="#5a6b68"/><path d="M58 21 L62 24 L58 27 M74 44 L77 48 L80 44" stroke="#5a6b68"/>
      <path d="M104 60 L114 46 L122 52 L134 30" stroke="var(--i-brand)"/><path d="M104 64 H136 M104 64 V26" stroke="#5a6b68" stroke-width="1"/>
    </g>
    <rect x="112" y="10" width="16" height="14" fill="#f3d27a" transform="rotate(4 120 17)"/><rect x="18" y="46" width="16" height="14" fill="#a9dcc2" transform="rotate(-5 26 53)"/>
  </symbol>
  <!-- Auto (hatchback) de TERC: 150 x 70 -->
  <symbol id="e-car" viewBox="0 0 150 70">
    <path d="M6 50 Q4 36 18 34 L40 30 Q54 12 76 10 H108 Q124 10 132 28 L142 32 Q148 36 147 50 Z" fill="var(--i-pine)"/>
    <path d="M48 30 Q58 16 76 15 H92 V30 Z" fill="#bfd8de"/><path d="M96 15 H108 Q118 15 124 30 H96 Z" fill="#bfd8de"/>
    <path d="M48 30 Q58 16 76 15 H84 L66 30 Z" fill="#fff" opacity=".3"/>
    <path d="M6 44 H147 V50 H6 Z" fill="var(--i-pine-d)"/><rect x="92" y="32" width="10" height="2.6" rx="1.3" fill="var(--i-metal-l)"/>
    <rect x="136" y="36" width="9" height="5" rx="2" fill="#f6e2a2"/><rect x="6" y="38" width="6" height="5" rx="2" fill="#e8786a"/>
    <circle cx="36" cy="52" r="13" fill="var(--i-leg)"/><circle cx="36" cy="52" r="5.5" fill="var(--i-metal)"/>
    <circle cx="116" cy="52" r="13" fill="var(--i-leg)"/><circle cx="116" cy="52" r="5.5" fill="var(--i-metal)"/>
  </symbol>
  <!-- Certificado de garantía enmarcado: 70 x 54 -->
  <symbol id="e-cert" viewBox="0 0 70 54">
    <rect width="70" height="54" fill="var(--i-oak-d)"/><rect x="3" y="3" width="64" height="48" fill="var(--i-paper)"/>
    <path d="M35 10 L44 13.5 V21 Q44 28 35 32 Q26 28 26 21 V13.5 Z" fill="var(--i-brand)"/>
    <path d="M31 20.5 L34 23.5 L39.5 17.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="35" y="40" text-anchor="middle" font-size="5.6" font-weight="800" fill="var(--i-pine)" letter-spacing=".3">GARANTÍA TERC</text>
    <text x="35" y="46.5" text-anchor="middle" font-size="4.6" font-weight="700" fill="var(--i-mustard)">12 MESES</text>
  </symbol>
  <!-- Florero con flores: 30 x 46 -->
  <symbol id="e-flowers" viewBox="0 0 30 46">
    <path d="M15 26 L9 8 M15 26 L15 4 M15 26 L22 10" stroke="var(--i-l1)" stroke-width="1.2"/>
    <circle cx="9" cy="8" r="4" fill="var(--i-coral)"/><circle cx="15" cy="4" r="4" fill="var(--i-mustard)"/><circle cx="22" cy="10" r="4" fill="var(--i-coral)"/>
    <circle cx="9" cy="8" r="1.4" fill="#f6e2a2"/><circle cx="15" cy="4" r="1.4" fill="#fff6d0"/><circle cx="22" cy="10" r="1.4" fill="#f6e2a2"/>
    <path d="M8 24 H22 Q24 34 20 45 H10 Q6 34 8 24 Z" fill="var(--i-sky)"/><path d="M15 24 H22 Q24 34 20 45 H15 Z" fill="#000" opacity=".08"/>
  </symbol>
  <!-- Timbre de mesón: 16 x 12 -->
  <symbol id="e-bell" viewBox="0 0 16 12"><rect x="0" y="10" width="16" height="2" rx="1" fill="var(--i-leg)"/><path d="M2 10 Q2 3 8 3 Q14 3 14 10 Z" fill="var(--i-mustard)"/><rect x="7" y="0" width="2" height="3" fill="var(--i-leg)"/></symbol>
  <!-- Mochila: 30 x 40 -->
  <symbol id="e-bag" viewBox="0 0 30 40"><path d="M9 6 Q9 0 15 0 Q21 0 21 6" stroke="var(--i-pine-d)" stroke-width="2.4" fill="none"/><rect x="2" y="5" width="26" height="35" rx="7" fill="var(--i-pine)"/><rect x="6" y="22" width="18" height="13" rx="4" fill="var(--i-pine-d)"/><rect x="13" y="22" width="4" height="2" fill="var(--i-mustard)"/></symbol>
  <!-- Trazo a mano: deforma muy levemente los bordes, como dibujado con tinta -->
  <filter id="e-hand" x="-3%" y="-3%" width="106%" height="106%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="1" seed="11" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="e-hand-sm" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="1" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="1.3" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <pattern id="e-p-peg" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="var(--i-oak-l)"/><circle cx="4.5" cy="4.5" r="1.1" fill="var(--i-oak-d)"/></pattern>
  <!-- Pantalla de revisión técnica: 190 x 110 -->
  <symbol id="e-scr-check" viewBox="0 0 190 110" preserveAspectRatio="none">
    <rect width="190" height="110" fill="#fff"/>
    <rect width="190" height="12" fill="var(--i-pine)"/><rect x="6" y="4.5" width="40" height="3" rx="1.5" fill="#fff" opacity=".85"/>
    <g>
      <rect x="10" y="20" width="110" height="13" rx="2" fill="var(--i-app)"/><circle cx="19" cy="26.5" r="4" fill="var(--i-brand)"/><path d="M17 26.5 l1.6 1.6 l3 -3.2" stroke="#fff" stroke-width="1.3" fill="none"/><rect x="28" y="25" width="44" height="3" rx="1.5" fill="var(--i-app-line)"/>
      <rect x="10" y="37" width="110" height="13" rx="2" fill="var(--i-app)"/><circle cx="19" cy="43.5" r="4" fill="var(--i-brand)"/><path d="M17 43.5 l1.6 1.6 l3 -3.2" stroke="#fff" stroke-width="1.3" fill="none"/><rect x="28" y="42" width="52" height="3" rx="1.5" fill="var(--i-app-line)"/>
      <rect x="10" y="54" width="110" height="13" rx="2" fill="var(--i-app)"/><circle cx="19" cy="60.5" r="4" fill="var(--i-brand)"/><path d="M17 60.5 l1.6 1.6 l3 -3.2" stroke="#fff" stroke-width="1.3" fill="none"/><rect x="28" y="59" width="38" height="3" rx="1.5" fill="var(--i-app-line)"/>
      <rect x="10" y="71" width="110" height="13" rx="2" fill="var(--i-app)"/><circle cx="19" cy="77.5" r="4" fill="none" stroke="var(--i-mustard)" stroke-width="1.6"/><rect x="28" y="76" width="48" height="3" rx="1.5" fill="var(--i-app-line)"/>
    </g>
    <rect x="10" y="92" width="110" height="6" rx="3" fill="var(--i-app2)"/><rect x="10" y="92" width="84" height="6" rx="3" fill="var(--i-brand)"/>
    <circle cx="156" cy="52" r="24" fill="none" stroke="var(--i-app2)" stroke-width="7"/>
    <path d="M156 28 A24 24 0 1 1 134 62" fill="none" stroke="var(--i-brand)" stroke-width="7" stroke-linecap="round"/>
    <rect x="146" y="49" width="20" height="5" rx="2.5" fill="var(--i-pine)"/>
    <rect x="136" y="86" width="40" height="11" rx="5.5" fill="var(--i-brand)"/>
  </symbol>
  <symbol id="e-aio-check" viewBox="0 0 200 175"><use href="#e-aio"/><use href="#e-scr-check" x="7" y="6" width="186" height="108"/><use href="#e-glare" x="7" y="6" width="186" height="108"/></symbol>
</defs>
</svg>`;

export const BANNER = `<svg class="ill art" viewBox="0 0 720 440" preserveAspectRatio="xMinYMax slice" role="img" aria-label="Terqui entra por la puerta de una oficina y deja una caja TERC junto al escritorio">
<g filter="url(#e-hand)">
<rect width="720" height="440" fill="var(--i-wall)" stroke="none"/>
<rect y="258" width="720" height="88" fill="var(--i-wains)"/>
<g fill="none" stroke="var(--i-wains-d)" stroke-width="2"><rect x="168" y="272" width="112" height="60" rx="2"/><rect x="292" y="272" width="112" height="60" rx="2"/><rect x="416" y="272" width="112" height="60" rx="2"/><rect x="540" y="272" width="112" height="60" rx="2"/></g>
<rect y="252" width="720" height="7" fill="var(--i-trim)"/>
<rect y="350" width="720" height="90" fill="var(--i-plank)"/>
<g stroke="none"><rect y="350" width="720" height="12" fill="var(--i-plank2)"/><rect y="377" width="720" height="18" fill="var(--i-plank3)"/><rect y="416" width="720" height="24" fill="var(--i-plank2)"/></g>
<g stroke="var(--i-gap)" stroke-width="1.2"><path d="M0 362 H720 M0 377 H720 M0 395 H720 M0 416 H720"/>
<path d="M96 350 V362 M300 350 V362 M520 350 V362 M40 362 V377 M240 362 V377 M450 362 V377 M680 362 V377 M150 377 V395 M380 377 V395 M600 377 V395 M70 395 V416 M290 395 V416 M520 395 V416 M200 416 V440 M440 416 V440 M690 416 V440"/></g>
<rect y="344" width="720" height="8" fill="var(--i-trim)"/>
<!-- puerta -->
<rect x="34" y="118" width="112" height="232" fill="var(--i-trim)"/>
<rect x="42" y="126" width="96" height="224" fill="url(#e-g-hall)"/>
<rect x="42" y="318" width="96" height="32" fill="var(--i-plank2)"/>
<rect x="76" y="168" width="34" height="26" fill="var(--i-oak-d)"/><rect x="79" y="171" width="28" height="20" fill="#cfe0d6"/>
<path d="M42 126 L18 116 L18 360 L42 350 Z" fill="#c79a66"/>
<path d="M22 146 L34 151 V214 L22 210 Z M22 250 L34 253 V330 L22 334 Z" fill="#b98c58"/>
<circle cx="26" cy="240" r="3.4" fill="var(--i-metal)"/>
<path d="M44 354 H136 L146 366 H34 Z" fill="#7e6044"/><path d="M50 358 H132 M46 362 H138" stroke="#6a4f37" stroke-width="1.2"/>
<use href="#e-clock" x="70" y="58" width="40" height="40"/>
<!-- ventana -->
<use href="#e-window" x="548" y="44" width="142" height="156"/>
<use href="#e-succ" x="642" y="166" width="20" height="26"/>
<path d="M548 352 L690 352 L640 440 L436 440 Z" fill="var(--i-light)" opacity=".22"/>
<!-- muro -->
<use href="#e-shelf" x="196" y="104" width="200" height="94"/>
<use href="#e-cork" x="420" y="96" width="94" height="68"/>
<ellipse cx="320" cy="120" rx="90" ry="70" fill="url(#e-g-glow)"/>
<use href="#e-pendant" x="290" y="0" width="60" height="112"/>
<use href="#e-pendant" x="452" y="-24" width="54" height="104" style="--sh:var(--i-mustard)"/>
<!-- alfombra -->
<path d="M178 384 H624 L668 436 H134 Z" fill="var(--i-pine)"/>
<path d="M192 390 H612 L650 430 H154 Z" fill="none" stroke="var(--i-mustard)" stroke-width="2.4"/>
<path d="M548 384 L624 384 L668 436 L592 436 Z" fill="var(--i-light)" opacity=".12"/>
<!-- enchufe y cable -->
<rect x="636" y="318" width="14" height="18" rx="2" fill="var(--i-trim)"/><g fill="var(--i-metal)" stroke="none"><rect x="640" y="323" width="2" height="4"/><rect x="644" y="323" width="2" height="4"/></g>
<path d="M402 296 C404 330 410 343 432 345 L630 345 Q643 345 643 336" stroke="var(--i-leg)" stroke-width="2" fill="none"/>
<!-- escritorio -->
<path d="M220 378 H610 L600 386 H206 Z" fill="var(--i-shadow)"/>
<use href="#e-bin" x="250" y="348" width="24" height="30"/>
<rect x="216" y="284" width="398" height="10" rx="2" fill="var(--i-oak)"/>
<rect x="216" y="292" width="398" height="6" fill="var(--i-oak-d)"/>
<rect x="228" y="298" width="8" height="80" fill="var(--i-leg)"/>
<rect x="522" y="298" width="82" height="80" fill="var(--i-oak-l)"/>
<path d="M522 324 H604 M522 351 H604" stroke="var(--i-oak-d)" stroke-width="1.6"/>
<g fill="var(--i-leg)"><rect x="554" y="309" width="18" height="3.4" rx="1.7"/><rect x="554" y="335" width="18" height="3.4" rx="1.7"/><rect x="554" y="362" width="18" height="3.4" rx="1.7"/></g>
<use href="#e-lamp" x="222" y="222" width="42" height="63"/>
<ellipse cx="332" cy="285" rx="58" ry="3" fill="var(--i-shadow)"/>
<use href="#e-aio-dash" x="268" y="148" width="160" height="140"/>
<use href="#e-kb" x="290" y="273" width="108" height="12"/>
<use href="#e-phone" x="404" y="281" width="20" height="4"/>
<g transform="rotate(-6 440 281)"><rect x="428" y="278" width="34" height="6" fill="var(--i-paper)"/></g>
<path d="M434 282 L458 276" stroke="var(--i-pine)" stroke-width="1.6"/>
<ellipse cx="514" cy="287" rx="54" ry="3" fill="var(--i-shadow)"/>
<use href="#e-nb-mail" x="462" y="222" width="108" height="65"/>
<use href="#e-mug" x="576" y="254" width="17" height="27" style="--m1:var(--i-coral)"/>
<use href="#e-pens" x="596" y="260" width="13" height="24"/>
<ellipse cx="336" cy="392" rx="44" ry="5" fill="var(--i-shadow)"/>
<use href="#e-chair" x="298" y="268" width="78" height="122" style="--c1:var(--i-mustard);--c2:#b88728"/>
<ellipse cx="672" cy="430" rx="40" ry="5" fill="var(--i-shadow)"/>
<use href="#e-plant" x="626" y="282" width="94" height="152" style="--p1:var(--i-terra)"/>
</g>
</svg>
<!-- Terqui, tamaño persona, en su propia capa (lo dibuja el script) -->
<svg class="ill actor" viewBox="0 0 720 440" preserveAspectRatio="xMinYMax slice" aria-hidden="true">
<ellipse data-emp-shadow="banner" cx="96" cy="353" rx="48" ry="9" fill="url(#e-g-contact)"/>
<g data-emp-rig="banner"></g>
</svg>
<svg class="ill ui" viewBox="0 0 720 440" preserveAspectRatio="xMinYMax slice">
<a class="emp-dev" data-p="aio-hp" aria-label="All-in-One HP ProOne 440 G9: ver foto y abrir en terc.cl">
<rect class="emp-hit" x="268" y="148" width="160" height="140"/>
<g transform="translate(348 210)"><circle class="emp-pulse" r="10"/><circle class="emp-ring" r="10"/><circle r="3.4" fill="#fff"/></g>
</a>
<a class="emp-dev" data-p="nb-830" aria-label="Notebook HP EliteBook 830 G7: ver foto y abrir en terc.cl">
<rect class="emp-hit" x="462" y="222" width="108" height="65"/>
<g transform="translate(516 248)"><circle class="emp-pulse" r="9"/><circle class="emp-ring" r="9"/><circle r="3" fill="#fff"/></g>
</a>
</svg>
<span class="emp-hint" data-emp-hint>Baja para ver la entrega ↓</span>`;

export const PASO_REVISAMOS = `<svg class="ill art" viewBox="0 0 320 240" preserveAspectRatio="xMidYMax slice" role="img" aria-label="En el taller de TERC, Terqui revisa con una lupa un All-in-One antes de embalarlo">
<g filter="url(#e-hand)">
<rect width="320" height="240" fill="var(--i-wall2)" stroke="none"/>
<rect x="18" y="26" width="98" height="74" fill="url(#e-p-peg)"/>
<g>
<rect x="30" y="38" width="7" height="22" rx="2" fill="var(--i-coral)"/><path d="M33.5 60 V78" stroke="var(--i-metal)" stroke-width="2.4"/>
<rect x="46" y="38" width="7" height="20" rx="2" fill="var(--i-mustard)"/><path d="M49.5 58 V74" stroke="var(--i-metal)" stroke-width="2.4"/>
<circle cx="78" cy="52" r="11" fill="var(--i-sky)"/><circle cx="78" cy="52" r="4.5" fill="var(--i-oak-l)"/>
<path d="M96 40 L104 70 M108 40 L100 70" stroke="var(--i-pine)" stroke-width="3.4"/><circle cx="102" cy="56" r="2" fill="var(--i-metal)"/>
<rect x="28" y="84" width="30" height="8" rx="1" fill="var(--i-paper)"/>
</g>
<rect x="204" y="64" width="104" height="6" fill="var(--i-oak)"/><rect x="204" y="118" width="104" height="6" fill="var(--i-oak)"/>
<use href="#e-box" x="210" y="30" width="44" height="34"/><use href="#e-box" x="258" y="36" width="36" height="28"/>
<use href="#e-box" x="212" y="84" width="46" height="35"/><use href="#e-box" x="262" y="90" width="38" height="29"/>
<rect x="232" y="126" width="48" height="14" rx="1" fill="var(--i-paper)"/>
<rect y="200" width="320" height="40" fill="var(--i-plank)"/><rect y="212" width="320" height="12" fill="var(--i-plank3)" stroke="none"/>
<g stroke="var(--i-gap)" stroke-width="1"><path d="M0 212 H320 M0 224 H320 M70 200 V212 M200 200 V212 M130 212 V224 M260 212 V224 M40 224 V240 M180 224 V240"/></g>
<rect y="196" width="320" height="5" fill="var(--i-trim)"/>
<path d="M112 232 H304 L296 238 H104 Z" fill="var(--i-shadow)"/>
<rect x="104" y="140" width="204" height="12" rx="2" fill="var(--i-oak)"/>
<path d="M128 140 V152 M152 140 V152 M176 140 V152 M200 140 V152 M224 140 V152 M248 140 V152 M272 140 V152" stroke="var(--i-oak-d)" stroke-width="1"/>
<rect x="112" y="152" width="8" height="80" fill="var(--i-leg)"/><rect x="292" y="152" width="8" height="80" fill="var(--i-leg)"/>
<rect x="112" y="200" width="188" height="6" fill="var(--i-oak-d)"/>
<use href="#e-box-open" x="236" y="160" width="50" height="40"/>
<ellipse cx="200" cy="141" rx="46" ry="2.6" fill="var(--i-shadow)"/>
<use href="#e-aio-check" x="146" y="44" width="110" height="97"/>
<path d="M246 56 Q258 58 262 70" stroke="var(--i-pine)" stroke-width="1" fill="none"/>
<g transform="rotate(10 266 80)"><rect x="256" y="70" width="22" height="16" rx="2" fill="var(--i-brand)"/><path d="M262 78 l3 3 l6 -6" stroke="#fff" stroke-width="1.8" fill="none"/></g>
<use href="#e-mug" x="288" y="122" width="12" height="19" style="--m1:var(--i-paper)"/>
</g>
<text x="256" y="136" text-anchor="middle" font-size="7.5" font-weight="800" fill="var(--i-pine)" letter-spacing=".8">LISTOS</text>
</svg>
<svg class="ill actor" viewBox="0 0 320 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
<g>
<ellipse cx="72" cy="235" rx="40" ry="6" fill="url(#e-g-contact)"/>
<svg x="-16" y="61" width="178" height="178" viewBox="0 0 200 200" overflow="visible"><g><path d="M88 176 L86 190" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#0a2a2a" stroke-width="4.5"/><ellipse cx="82" cy="191" rx="7" ry="3.5" fill="#0a2a2a"/></g><g><path d="M112 176 L114 190" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#0a2a2a" stroke-width="4.5"/><ellipse cx="118" cy="191" rx="7" ry="3.5" fill="#0a2a2a"/></g><g><path d="M70 118 L58 136 L60 150" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#0a2a2a" stroke-width="4.5"/><circle cx="60" cy="150" r="5" fill="#0a2a2a"/></g><g class="terqui-scan"><path d="M130 112 L146 104 L150 92" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#0a2a2a" stroke-width="4.5"/><circle cx="150" cy="92" r="5" fill="#0a2a2a"/></g><g transform="rotate(4 100 58)"><g><path d="M100 58 C100 50 98 44 101 34" stroke="#288868" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M100 44 Q84 24 64 30 Q76 50 100 44Z" fill="#288868"/><path d="M101 37 Q116 14 138 20 Q126 42 101 37Z" fill="#3db585"/><path d="M98 42.5 Q86 34 72 32.5 M103 35.5 Q116 25 130 22.5" stroke="#1d6b50" stroke-width="1.1" fill="none" opacity=".5"/></g></g><rect x="70" y="58" width="60" height="118" rx="13" fill="#0a2a2a"/><rect x="67.6" y="84" width="3.2" height="12" rx="1.6" fill="#0a2a2a"/><rect x="67.6" y="99" width="3.2" height="7" rx="1.6" fill="#0a2a2a"/><rect x="75.5" y="69" width="49" height="96" rx="7" fill="#eaf5f0"/><path d="M118 71.5 Q122 72 122 77" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".9"/><rect x="93" y="62.5" width="14" height="3" rx="1.5" fill="#fff" opacity=".35"/><g class="terqui-blink"><rect x="87" y="103" width="7" height="13" rx="3.5" fill="#0a2a2a"/><rect x="111" y="103" width="7" height="13" rx="3.5" fill="#0a2a2a"/><circle cx="91.8" cy="106.6" r="1.5" fill="#fff"/><circle cx="115.8" cy="106.6" r="1.5" fill="#fff"/></g><path d="M81 96 L94 96 M106 91 L118 91" stroke="#0a2a2a" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M93 125 L108 124" stroke="#0a2a2a" stroke-width="3.2" stroke-linecap="round" fill="none"/><g class="terqui-scan"><path d="M150 92 L158 82" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="#0a2a2a" stroke-width="6"/><circle cx="167" cy="70" r="13" fill="#dff1fa" opacity=".9" stroke="#0a2a2a" stroke-width="4.5"/><path d="M160 63 Q163 59 168 59" stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="150" cy="92" r="5" fill="#0a2a2a"/></g></svg>
</g>
</svg>`;

export const PASO_ENTREGAMOS = `<svg class="ill art" viewBox="0 0 320 240" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Terqui baja del auto de TERC y lleva la caja a la puerta de un edificio de oficinas">
<g filter="url(#e-hand)">
<rect width="320" height="240" fill="#dcebee" stroke="none"/>
<g fill="#c8dde2"><rect x="0" y="70" width="40" height="130"/><rect x="44" y="96" width="30" height="104"/><rect x="78" y="60" width="36" height="140"/></g>
<rect x="118" y="16" width="214" height="178" fill="#e6dccb"/>
<g fill="#a9c9d0"><rect x="132" y="34" width="34" height="28"/><rect x="176" y="34" width="34" height="28"/><rect x="220" y="34" width="34" height="28"/><rect x="264" y="34" width="34" height="28"/>
<rect x="132" y="74" width="34" height="28"/><rect x="176" y="74" width="34" height="28"/><rect x="220" y="74" width="34" height="28"/><rect x="264" y="74" width="34" height="28"/></g>
<g fill="#fff" opacity=".4"><path d="M140 34 h8 l-8 28 Z"/><path d="M184 34 h8 l-8 28 Z"/><path d="M228 74 h8 l-8 28 Z"/><path d="M272 74 h8 l-8 28 Z"/></g>
<rect x="198" y="112" width="84" height="12" fill="var(--i-pine)"/>
<rect x="206" y="128" width="68" height="66" fill="var(--i-leg)"/><rect x="210" y="132" width="29" height="62" fill="#9fc3ca"/><rect x="241" y="132" width="29" height="62" fill="#9fc3ca"/>
<rect x="234" y="156" width="2.4" height="14" rx="1" fill="var(--i-metal-l)"/><rect x="243.6" y="156" width="2.4" height="14" rx="1" fill="var(--i-metal-l)"/>
<rect x="290" y="170" width="24" height="24" fill="#cbbfa7"/><circle cx="302" cy="150" r="16" fill="var(--i-l1)"/><circle cx="294" cy="158" r="10" fill="var(--i-l2)"/><rect x="300.5" y="160" width="3" height="10" fill="#7e6044"/>
<rect y="194" width="320" height="30" fill="#d9d5cc"/><g stroke="#c4bfb3" stroke-width="1"><path d="M0 206 H320 M40 194 V224 M100 194 V206 M160 206 V224 M220 194 V206 M280 206 V224"/></g>
<rect y="222" width="320" height="5" fill="#bdb7ab"/><rect y="227" width="320" height="13" fill="#6e7876"/><path d="M10 233 h22 M60 233 h22 M110 233 h22" stroke="#e6e2d6" stroke-width="2"/>
<use href="#e-car" x="-34" y="170" width="132" height="62"/>
</g>
<text x="240" y="121" text-anchor="middle" font-size="7" font-weight="700" fill="#fff" letter-spacing="1.6">OFICINAS</text>
</svg>
<svg class="ill actor" viewBox="0 0 320 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
<g data-emp-wrap="paso2" opacity="0"><ellipse data-emp-shadow="paso2" cx="112" cy="217" rx="18" ry="4" fill="url(#e-g-contact)"/><g data-emp-rig="paso2"></g></g>
</svg>`;

export const PASO_ACOMPANAMOS = `<svg class="ill art" viewBox="0 0 320 240" preserveAspectRatio="xMidYMax slice" role="img" aria-label="En la oficina del cliente, Terqui aparece en una videollamada de soporte y llega un WhatsApp de seguimiento">
<g filter="url(#e-hand)">
<rect width="320" height="240" fill="var(--i-wall2)" stroke="none"/>
<rect y="150" width="320" height="50" fill="var(--i-wains)"/><rect y="146" width="320" height="5" fill="var(--i-trim)"/>
<rect y="200" width="320" height="40" fill="var(--i-plank)"/><rect y="212" width="320" height="12" fill="var(--i-plank3)" stroke="none"/>
<g stroke="var(--i-gap)" stroke-width="1"><path d="M0 212 H320 M0 224 H320 M90 200 V212 M230 200 V212 M150 212 V224 M280 212 V224 M60 224 V240 M200 224 V240"/></g>
<rect y="196" width="320" height="5" fill="var(--i-trim)"/>
<use href="#e-art" x="112" y="48" width="46" height="36"/>
<path d="M22 230 H262 L254 236 H14 Z" fill="var(--i-shadow)"/>
<rect x="16" y="168" width="250" height="9" rx="2" fill="var(--i-oak)"/><rect x="16" y="176" width="250" height="4" fill="var(--i-oak-d)"/>
<rect x="26" y="180" width="7" height="52" fill="var(--i-leg)"/><rect x="250" y="180" width="7" height="52" fill="var(--i-leg)"/>
<ellipse cx="136" cy="169" rx="70" ry="3" fill="var(--i-shadow)"/>
<use href="#e-nb-video" x="64" y="84" width="144" height="86"/>
<use href="#e-mug" x="218" y="148" width="13" height="21" style="--m1:var(--i-mustard)"/>
<use href="#e-flowers" x="28" y="138" width="20" height="31"/>
<use href="#e-phone" x="232" y="165" width="22" height="4"/>
<use href="#e-plant" x="262" y="122" width="62" height="112" style="--p1:var(--i-cream)"/>
</g>
<use href="#e-cert" x="30" y="40" width="70" height="54"/>
<g transform="translate(174 36)">
<path d="M0 10 Q0 0 10 0 H112 Q122 0 122 10 V34 Q122 44 112 44 H96 L104 56 L84 44 H10 Q0 44 0 34 Z" fill="#d9fdd3"/>
<text x="10" y="18" font-size="9" font-weight="700" fill="#0a2a2a" style="font-family:var(--body)">¿Todo bien con</text>
<text x="10" y="30" font-size="9" font-weight="700" fill="#0a2a2a" style="font-family:var(--body)">tu equipo nuevo?</text>
<text x="70" y="40" font-size="6.5" fill="#5b7470" style="font-family:var(--body)">10:24</text>
<path d="M99 37 l2 2 l4 -4 M103 37 l2 2 l4 -4" stroke="#53bdeb" stroke-width="1.2" fill="none"/>
</g>
</svg>`;

export const RECEPCION = `<svg class="ill art" viewBox="0 0 420 520" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Recepción con un All-in-One HP sobre el mesón">
<g filter="url(#e-hand)">
<rect width="420" height="520" fill="var(--i-wall)" stroke="none"/>
<rect x="70" y="40" width="280" height="300" fill="var(--i-pine)"/>
<g stroke="var(--i-pine-d)" stroke-width="4"><path d="M86 40 V340 M106 40 V340 M126 40 V340 M146 40 V340 M166 40 V340 M186 40 V340 M206 40 V340 M226 40 V340 M246 40 V340 M266 40 V340 M286 40 V340 M306 40 V340 M326 40 V340"/></g>
<circle cx="210" cy="104" r="44" fill="var(--i-pine-d)" stroke="var(--i-mustard)" stroke-width="2.5"/>
<path d="M190 112 H230" stroke="var(--i-mustard)" stroke-width="2"/>
<use href="#e-pendant" x="20" y="60" width="56" height="112" style="--sh:var(--i-mustard)"/><use href="#e-pendant" x="344" y="60" width="56" height="112" style="--sh:var(--i-mustard)"/>
<ellipse cx="48" cy="190" rx="44" ry="30" fill="url(#e-g-glow)"/><ellipse cx="372" cy="190" rx="44" ry="30" fill="url(#e-g-glow)"/>
<rect y="440" width="420" height="80" fill="var(--i-plank)"/><rect y="456" width="420" height="20" fill="var(--i-plank3)" stroke="none"/><rect y="496" width="420" height="24" fill="var(--i-plank2)" stroke="none"/>
<g stroke="var(--i-gap)" stroke-width="1.2"><path d="M0 456 H420 M0 476 H420 M0 496 H420 M90 440 V456 M300 440 V456 M40 456 V476 M240 456 V476 M150 476 V496 M360 476 V496 M60 496 V520 M280 496 V520"/></g>
<rect y="434" width="420" height="7" fill="var(--i-trim)"/>
<path d="M50 506 H372 L362 514 H40 Z" fill="var(--i-shadow)"/>
<rect x="44" y="318" width="332" height="14" rx="3" fill="var(--i-cream)"/>
<rect x="54" y="332" width="312" height="174" fill="var(--i-oak)"/>
<g stroke="var(--i-oak-d)" stroke-width="3"><path d="M78 336 V506 M102 336 V506 M126 336 V506 M150 336 V506 M174 336 V506 M198 336 V506 M222 336 V506 M246 336 V506 M270 336 V506 M294 336 V506 M318 336 V506 M342 336 V506"/></g>
<ellipse cx="196" cy="319" rx="66" ry="3.4" fill="var(--i-shadow)"/>
<use href="#e-aio-cal" x="118" y="171" width="168" height="147"/>
<use href="#e-kb" x="146" y="306" width="104" height="12"/>
<use href="#e-bell" x="80" y="306" width="18" height="13"/>
<use href="#e-flowers" x="300" y="268" width="34" height="52"/>
<use href="#e-phone" x="262" y="313" width="22" height="4"/>
<ellipse cx="34" cy="508" rx="40" ry="5" fill="var(--i-shadow)"/>
<use href="#e-plant" x="-12" y="344" width="96" height="164" style="--p1:var(--i-cream)"/>
</g>
<text x="210" y="102" text-anchor="middle" font-size="11.5" font-weight="800" fill="#fff" letter-spacing=".3">Bienvenidos</text>
</svg>
<svg class="ill ui" viewBox="0 0 420 520" preserveAspectRatio="xMidYMax slice">
<a class="emp-dev" data-p="aio-hp" aria-label="All-in-One HP ProOne 440 G9: ver foto y abrir en terc.cl">
<rect class="emp-hit" x="118" y="171" width="168" height="147"/>
<g transform="translate(202 236)"><circle class="emp-pulse" r="11"/><circle class="emp-ring" r="11"/><circle r="3.6" fill="#fff"/></g>
</a>
</svg>
<span class="emp-cap">Recepción</span>`;

export const PUESTO_MOVIL = `<svg class="ill art" viewBox="0 0 340 250" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Puesto junto a la ventana con un notebook HP sobre una mesa redonda">
<g filter="url(#e-hand)">
<rect width="340" height="250" fill="var(--i-wall2)" stroke="none"/>
<use href="#e-window" x="150" y="8" width="150" height="165"/>
<rect y="206" width="340" height="44" fill="var(--i-plank)"/><rect y="218" width="340" height="14" fill="var(--i-plank3)" stroke="none"/>
<g stroke="var(--i-gap)" stroke-width="1"><path d="M0 218 H340 M0 232 H340 M60 206 V218 M220 206 V218 M140 218 V232 M300 218 V232 M90 232 V250 M250 232 V250"/></g>
<rect y="202" width="340" height="5" fill="var(--i-trim)"/>
<path d="M150 210 L300 210 L270 250 L80 250 Z" fill="var(--i-light)" opacity=".25"/>
<ellipse cx="142" cy="242" rx="64" ry="5" fill="var(--i-shadow)"/>
<rect x="138" y="166" width="8" height="70" fill="var(--i-leg)"/><ellipse cx="142" cy="238" rx="30" ry="4" fill="var(--i-leg)"/>
<path d="M58 158 A84 9 0 0 0 226 158 V163 A84 9 0 0 1 58 163 Z" fill="var(--i-oak-d)"/>
<ellipse cx="142" cy="158" rx="84" ry="9" fill="var(--i-oak)"/>
<ellipse cx="136" cy="158" rx="46" ry="3" fill="var(--i-shadow)"/>
<use href="#e-nb-mail" x="82" y="94" width="108" height="65"/>
<use href="#e-mug" x="198" y="134" width="14" height="22" style="--m1:var(--i-mustard)"/>
<g transform="translate(64 148)"><ellipse cx="12" cy="6" rx="14" ry="3.4" fill="var(--i-paper)"/><path d="M2 5 Q12 -4 22 5 Q12 8 2 5 Z" fill="#d9a85c"/></g>
<g transform="translate(250 112)"><path d="M6 60 L4 128 M38 60 L40 128" stroke="var(--i-leg)" stroke-width="3.2"/><rect x="30" y="2" width="9" height="60" rx="4" fill="var(--i-coral)"/><rect x="0" y="50" width="44" height="10" rx="5" fill="var(--i-coral)"/><use href="#e-bag" x="12" y="24" width="22" height="30"/></g>
</g>
</svg>
<svg class="ill ui" viewBox="0 0 340 250" preserveAspectRatio="xMidYMax slice">
<a class="emp-dev" data-p="nb-830" aria-label="Notebook HP EliteBook 830 G7: ver foto y abrir en terc.cl">
<rect class="emp-hit" x="82" y="94" width="108" height="65"/>
<g transform="translate(136 124)"><circle class="emp-pulse" r="10"/><circle class="emp-ring" r="10"/><circle r="3.3" fill="#fff"/></g>
</a>
</svg>
<span class="emp-cap">Puesto móvil</span>`;

export const CONTABILIDAD = `<svg class="ill art" viewBox="0 0 340 250" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Escritorio de contabilidad con un PC HP Elite SFF bajo el monitor">
<g filter="url(#e-hand)">
<rect width="340" height="250" fill="var(--i-wall)" stroke="none"/>
<use href="#e-shelf" x="200" y="34" width="126" height="59"/>
<use href="#e-calendar" x="26" y="52" width="36" height="42"/>
<rect y="206" width="340" height="44" fill="var(--i-plank)"/><rect y="218" width="340" height="14" fill="var(--i-plank2)" stroke="none"/>
<g stroke="var(--i-gap)" stroke-width="1"><path d="M0 218 H340 M0 232 H340 M110 206 V218 M260 206 V218 M50 218 V232 M190 218 V232 M130 232 V250 M300 232 V250"/></g>
<rect y="202" width="340" height="5" fill="var(--i-trim)"/>
<path d="M24 238 H326 L318 245 H14 Z" fill="var(--i-shadow)"/>
<rect x="14" y="166" width="312" height="9" rx="2" fill="var(--i-oak)"/><rect x="14" y="174" width="312" height="4" fill="var(--i-oak-d)"/>
<rect x="24" y="178" width="7" height="60" fill="var(--i-leg)"/><rect x="309" y="178" width="7" height="60" fill="var(--i-leg)"/>
<use href="#e-lamp" x="24" y="110" width="38" height="57"/>
<ellipse cx="130" cy="167" rx="72" ry="3" fill="var(--i-shadow)"/>
<use href="#e-sff" x="62" y="133" width="136" height="34"/>
<use href="#e-mon-sheet" x="70" y="34" width="120" height="99"/>
<use href="#e-kb" x="206" y="155" width="90" height="10"/>
<use href="#e-calc" x="204" y="141" width="22" height="14"/>
<g transform="rotate(-5 260 156)"><rect x="236" y="150" width="40" height="8" fill="var(--i-paper)"/><rect x="240" y="142" width="36" height="8" fill="var(--i-paper)"/></g>
<use href="#e-pens" x="300" y="142" width="13" height="24"/>
</g>
</svg>
<svg class="ill ui" viewBox="0 0 340 250" preserveAspectRatio="xMidYMax slice">
<a class="emp-dev" data-p="pc-800" aria-label="PC HP Elite SFF 800 G9: ver foto y abrir en terc.cl">
<rect class="emp-hit" x="62" y="133" width="136" height="34"/>
<g transform="translate(160 150)"><circle class="emp-pulse" r="9.5"/><circle class="emp-ring" r="9.5"/><circle r="3.2" fill="#fff"/></g>
</a>
</svg>
<span class="emp-cap">Contabilidad</span>`;

export const OFICINA = `<svg class="ill art" viewBox="0 0 720 260" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Oficina con tres puestos: All-in-One Lenovo, notebook HP ProBook y mini PC Dell">
<g filter="url(#e-hand)">
<rect width="720" height="260" fill="var(--i-wall)" stroke="none"/>
<use href="#e-board" x="40" y="48" width="126" height="76"/>
<use href="#e-window" x="590" y="6" width="110" height="121"/>
<use href="#e-art" x="420" y="34" width="66" height="51"/>
<use href="#e-pendant" x="168" y="-48" width="48" height="96"/><use href="#e-pendant" x="352" y="-48" width="48" height="96" style="--sh:var(--i-mustard)"/><use href="#e-pendant" x="520" y="-48" width="48" height="96"/>
<rect y="220" width="720" height="40" fill="var(--i-plank)"/><rect y="232" width="720" height="12" fill="var(--i-plank3)" stroke="none"/>
<g stroke="var(--i-gap)" stroke-width="1"><path d="M0 232 H720 M0 244 H720 M90 220 V232 M330 220 V232 M560 220 V232 M200 232 V244 M440 232 V244 M660 232 V244 M60 244 V260 M300 244 V260 M520 244 V260"/></g>
<rect y="216" width="720" height="5" fill="var(--i-trim)"/>
<path d="M80 248 H650 L640 254 H66 Z" fill="var(--i-shadow)"/>
<rect x="70" y="152" width="580" height="9" rx="2" fill="var(--i-oak)"/><rect x="70" y="160" width="580" height="4" fill="var(--i-oak-d)"/>
<rect x="80" y="164" width="7" height="84" fill="var(--i-leg)"/><rect x="633" y="164" width="7" height="84" fill="var(--i-leg)"/><rect x="356" y="164" width="7" height="84" fill="var(--i-leg)"/>
<rect x="248" y="100" width="3" height="52" fill="var(--i-metal-l)"/><rect x="470" y="100" width="3" height="52" fill="var(--i-metal-l)"/>
<ellipse cx="166" cy="153" rx="48" ry="2.6" fill="var(--i-shadow)"/>
<use href="#e-aio-len" x="112" y="58" width="108" height="95"/>
<use href="#e-kb" x="128" y="143" width="80" height="9"/>
<use href="#e-mug" x="96" y="132" width="12" height="20" style="--m1:var(--i-sky)"/>
<use href="#e-chair" x="140" y="160" width="56" height="88" style="--c1:var(--i-pine);--c2:var(--i-pine-d)"/>
<path d="M318 152 L338 124 H378 L398 152" stroke="var(--i-metal)" stroke-width="3" fill="none"/>
<ellipse cx="358" cy="153" rx="46" ry="2.6" fill="var(--i-shadow)"/>
<use href="#e-nb-video" x="310" y="70" width="96" height="58"/>
<use href="#e-kb" x="322" y="143" width="80" height="9"/>
<use href="#e-succ" x="414" y="126" width="20" height="26"/>
<use href="#e-chair" x="332" y="160" width="56" height="88" style="--c1:var(--i-coral);--c2:#b85a4b"/>
<ellipse cx="560" cy="153" rx="50" ry="2.6" fill="var(--i-shadow)"/>
<use href="#e-mon-mail" x="506" y="62" width="100" height="83"/>
<use href="#e-mini" x="610" y="136" width="36" height="12"/>
<use href="#e-kb" x="518" y="143" width="80" height="9"/>
<use href="#e-pens" x="490" y="128" width="11" height="22"/>
<use href="#e-chair" x="530" y="160" width="56" height="88" style="--c1:var(--i-mustard);--c2:#b88728"/>
<ellipse cx="690" cy="252" rx="30" ry="4" fill="var(--i-shadow)"/>
<use href="#e-plant" x="654" y="140" width="70" height="114" style="--p1:var(--i-terra)"/>
</g>
</svg>
<svg class="ill ui" viewBox="0 0 720 260" preserveAspectRatio="xMidYMax slice">
<a class="emp-dev" data-p="aio-len" aria-label="All-in-One Lenovo V50a 24 pulgadas: ver foto y abrir en terc.cl">
<rect class="emp-hit" x="112" y="58" width="108" height="95"/>
<g transform="translate(166 92)"><circle class="emp-pulse" r="9"/><circle class="emp-ring" r="9"/><circle r="3" fill="#fff"/></g>
</a>
<a class="emp-dev" data-p="nb-440" aria-label="Notebook HP ProBook 440 G8: ver foto y abrir en terc.cl">
<rect class="emp-hit" x="310" y="70" width="96" height="58"/>
<g transform="translate(358 96)"><circle class="emp-pulse" r="9"/><circle class="emp-ring" r="9"/><circle r="3" fill="#fff"/></g>
</a>
<a class="emp-dev" data-p="mini-3000" aria-label="Mini PC Dell OptiPlex 3000 Micro: ver foto y abrir en terc.cl">
<rect class="emp-hit" x="606" y="128" width="44" height="22"/>
<g transform="translate(628 126)"><circle class="emp-pulse" r="8.5"/><circle class="emp-ring" r="8.5"/><circle r="2.8" fill="#fff"/></g>
</a>
</svg>
<span class="emp-cap">Oficina completa</span>`;

