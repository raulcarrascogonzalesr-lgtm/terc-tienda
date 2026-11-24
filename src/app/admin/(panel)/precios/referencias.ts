// Precios de referencia para la tabla de precios del panel, revisados a mano el 23 y 24-11-2026.
// "esol" es el precio de Esol al público con IVA (esol.cl). "tiendas" son otras tiendas chilenas: [precio con IVA, tienda].
// Para agregar un producto nuevo: su código del proveedor (supplier_sku), el precio de Esol y las tiendas que vendan el mismo modelo.
export type Reference = { esol: number; tiendas: [number, string][] };

export const CHECKED_ON = "23-11-2026";

export const REFERENCES: Record<string, Reference> = {
  "IntelliHome-16kWh": { esol: 2315740, tiendas: [[2690000, "Otra tienda"]] },
  "BF100-100kwh": { esol: 18564000, tiendas: [] },
  "EC-100-50-NV": { esol: 25799200, tiendas: [] },
  "M1C-Mod": { esol: 844900, tiendas: [[845000, "CEPC"], [1005550, "Solares.cl"]] },
  "NM51.2-200ES02-W": { esol: 1535100, tiendas: [[1539475, "Casa Edison"], [1598000, "Paneles Solares JP"], [1696000, "Starkee"], [1700000, "Sun Storm"], [1710000, "Solarstore"]] },
  "US3000D": { esol: 952000, tiendas: [[1060000, "Solarstore"]] },
  "LUNA2000-241-2S1": { esol: 71400000, tiendas: [] },
  "DL5.0F": { esol: 904400, tiendas: [] },
  "NM512V-300AH": { esol: 35462000, tiendas: [[40781390, "Solarstorm"]] },
  "NM512V-200AH": { esol: 23086000, tiendas: [] },
  "NM280V-129kWh": { esol: 21420000, tiendas: [] },
  "NM304V-64kWh": { esol: 13090000, tiendas: [] },
  "FB-L-16-AF": { esol: 2237200, tiendas: [] },
  "FB-L-16": { esol: 2189600, tiendas: [] },
  "PBRICK": { esol: 1898050, tiendas: [[1999990, "SolarBess"], [2182790, "Solarstorm"]] },
  "NM51.2-200ES01": { esol: 1313760, tiendas: [[1539475, "Casa Edison"], [1700000, "Solarstorm"]] },
  "LUNA2000-5-E0": { esol: 2011100, tiendas: [[1925500, "RM Energía"], [2011100, "GG Electrics"], [2213990, "Solarstorm"]] },
  "PBRICK_SC": { esol: 2046800, tiendas: [[1950000, "Ingeniería y Soporte Solar"], [1951600, "Solar Ingeniería"], [1952790, "GG Electrics"], [1960191, "Natura Energy"], [2068220, "CEPC"], [2090000, "Solarstore"], [2152990, "Nexmaq"]] },
  "NM51.2-300ES01": { esol: 1808800, tiendas: [[1523200, "Irradianza"], [2079990, "Solarstorm"], [2090000, "Solar Ingeniería"]] },
  "UF5000": { esol: 871080, tiendas: [[1020000, "CEPC"], [1050000, "Solarstore"], [1217990, "Solarstorm"], [1278200, "Enertik"], [1909950, "Delta"], [1937654, "ZeroCool"]] },
  "LIO.II.4810K": { esol: 999600, tiendas: [[1120000, "Solarstore"], [1150000, "R&S Soluciones Solares"], [1190000, "Solarstorm"]] },
  "US5000": { esol: 1011500, tiendas: [[1099990, "Starkee"], [1178100, "Solar Ingeniería"], [1579990, "Solarstorm"], [1846880, "Electrocom"]] },
  "S51100": { esol: 975800, tiendas: [[1122190, "Solarstorm"]] },
  "FB-L-5.12": { esol: 1047200, tiendas: [[1099990, "DMU Energy"], [1150800, "Enertik"], [1744525, "ZeroCool"]] },
  "LIO.II.4810E": { esol: 1142400, tiendas: [[1100000, "Diacon"], [1128000, "Ingeniería y Soporte Solar"], [1154300, "Solar Ingeniería"], [1270000, "Solarstore"], [1490000, "Solarstorm"]] },
  "US2000C": { esol: 1076950, tiendas: [[945000, "Solarstore"], [1049900, "Sun Storm"], [1225700, "Solaryled"], [1238990, "Solarstorm"]] },
  "HV48074": { esol: 942480, tiendas: [[965000, "Solarstore"], [1520000, "Solarstorm"]] },
  "DL5.0C": { esol: 856800, tiendas: [[899990, "Starkee"], [950000, "Solarstore"], [979990, "SolarBess"], [985000, "Solarstorm"]] },
  "NM48100": { esol: 747320, tiendas: [[790000, "R&S Soluciones Solares"], [810000, "Solarstore"], [840000, "Solar Ingeniería"], [850000, "Hakon"], [850000, "Softek"], [860000, "Solarstorm"]] },
  "NM24200": { esol: 785400, tiendas: [[786000, "Ingeniería y Soporte Solar"], [870000, "Solarstore"], [901990, "Starkee"], [950000, "Solarstorm"]] },
  "LIT300AH12V": { esol: 380800, tiendas: [[462990, "Solarstorm"]] },
  "LIT75-12": { esol: 302260, tiendas: [[335000, "Solarstore"], [347990, "Solarstorm"]] },
  "LIT150AH12V": { esol: 285600, tiendas: [[309990, "Solarstorm"], [310000, "Solarstore"], [337000, "Mercado Libre"]] },
  "LIT100AH12V": { esol: 183260, tiendas: [[200000, "Solarstore"], [205490, "Solarstorm"]] },
  "LIT50AH12V": { esol: 116620, tiendas: [[128990, "Solarstorm"]] },
};
