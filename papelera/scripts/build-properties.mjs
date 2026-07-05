/** Genera src/data/properties.ts desde el catálogo Tokko (LM) */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {Array<Record<string, unknown>>} */
const raw = [
  { id: '8046943', slug: '8046943-casa-av-estrada-pje-8', type: 'casa', title: 'Casa en Av. Estrada y Pje 8', price: 165000, ref: 'LHO8046943', m2: 0, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '8046943_6100547658820769860139333065503330854776687116904604291255797751586518119824.jpg' },
  { id: '8042741', slug: '8042741-depto-rosario-del-tala-san-juan', type: 'departamento', title: 'Departamento en Rosario del Tala y San Juan', price: 41000, ref: 'LAP8042741', m2: 0, rooms: 1, baths: 1, nb: 'Paraná', city: 'Paraná', img: '8042741_43595106044018136761835819568792896250131865805277614154637512606356545025506.jpg' },
  { id: '8031749', slug: '8031749-depto-uruguay-la-rioja', type: 'departamento', title: 'Departamento en Uruguay y La Rioja', price: 75000, ref: 'LAP8031749', m2: 0, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '8031749_56095055307455640805575837467404847766902245438995542533568452779277672779640.jpg' },
  { id: '8029749', slug: '8029749-depto-25-mayo-pascual-palma', type: 'departamento', title: 'Departamento en 25 de Mayo y Pascual Palma', price: 80000, ref: 'LAP8029749', m2: 0, rooms: 3, baths: 1, nb: 'Paraná', city: 'Paraná', img: '8029749_49818757793672070272403280964545458753496839638486998490381498304367377617299.jpg' },
  { id: '7989173', slug: '7989173-casa-alem-9-julio', type: 'casa', title: 'Casa en Alem y 9 de Julio', price: 295000, ref: 'LHO7989173', m2: 0, rooms: 3, baths: 2, nb: 'Paraná', city: 'Paraná', img: '7989173_94385894929359151840634688243105665109742045377292393166497549080160120964212.jpg' },
  { id: '7988980', slug: '7988980-cochera-victoria-corrientes', type: 'cochera', title: 'Cochera en Victoria y Corrientes', price: 17000, ref: 'LGA7988980', m2: 13, rooms: 0, baths: 0, nb: 'Centro', city: 'Paraná', img: '7988980_46239732651954247280363385247988915172448563458002828831003537995567652068704.jpg' },
  { id: '7861569', slug: '7861569-casa-gualeguaychu-pascual-palma', type: 'casa', title: 'Casa en Gualeguaychú y Pascual Palma', price: 150000, ref: 'LHO7861569', m2: 120, rooms: 3, baths: 2, nb: 'Paraná', city: 'Paraná', img: '7861569_51844909720611479570273192958932628809472361037349469737606624207140802225439.jpg' },
  { id: '6799520', slug: '6799520-casa-guayacan-blas-parera', type: 'casa', title: 'Casa en Guayacán, a metros de Blas Parera', price: 230000, ref: 'LHO6799520', m2: 0, rooms: 3, baths: 2, nb: 'Paraná', city: 'Paraná', img: '6799520_110056109772182796094253230697745022858655136601395775597782905991943980170959.jpg' },
  { id: '7946006', slug: '7946006-depto-las-tacuaritas-500', type: 'departamento', title: 'Departamento en Las Tacuaritas al 500', price: 35000, ref: 'LAP7946006', m2: 0, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7946006_28275217147954186786476273482893472355160706552041138392821921154485946673258.jpg' },
  { id: '7947724', slug: '7947724-depto-mexico-tucuman', type: 'departamento', title: 'Departamento en México y Tucumán', price: 50000, ref: 'LAP7947724', m2: 0, rooms: 1, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7947724_82967295459863743551280157430150668902631054998023643991009225474533792069565.jpg' },
  { id: '7946213', slug: '7946213-casa-sauce-montrull-aeroclub', type: 'casa', title: 'Casa en Sauce Montrull — Zona Aeroclub', price: 80000, ref: 'LHO7946213', m2: 0, rooms: 2, baths: 1, nb: 'Sauce Montrull', city: 'Paraná', img: '7946213_6386133111869014401920027702730456944020699314580657712611871684185155546426.jpg' },
  { id: '7946125', slug: '7946125-casa-patagonia-78', type: 'casa', title: 'Casa en Patagonia 78', price: 82000, ref: 'LHO7946125', m2: 0, rooms: 3, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7946125_58912443648661297060752871912500241147308600632355888616468739802483057112219.jpg' },
  { id: '7945491', slug: '7945491-depto-mitre-tucuman', type: 'departamento', title: 'Departamento en Mitre y Tucumán', price: 290000, ref: 'LAP7945491', m2: 156, rooms: 7, baths: 2, nb: 'Paraná', city: 'Paraná', img: '7945491_114869377195545523324287682357968139681122267829871562094636205816668602690850.jpg' },
  { id: '7922714', slug: '7922714-depto-mexico-cordoba', type: 'departamento', title: 'Departamento en México y Córdoba', price: 50000, ref: 'LAP7922714', m2: 33, rooms: 1, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7922714_52718186988759745971752228486363627965688626521523387981785797243796464019289.jpg' },
  { id: '7875161', slug: '7875161-casa-laurencena', type: 'casa', title: 'Casa en Laurencena', price: 100000, ref: 'LHO7875161', m2: 137, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7875161_107576176492908949669560124757826248663843129685496832904611407674108358990615.jpg' },
  { id: '7897644', slug: '7897644-terreno-los-cardones', type: 'terreno', title: 'Terreno en Los Cardones', price: 35000, ref: 'LLA7897644', m2: 450, rooms: 0, baths: 0, nb: 'Paraná', city: 'Paraná', img: '7897644_25566312204394077612665912793212728385163194220155231971829760109786172405890.jpg' },
  { id: '7897642', slug: '7897642-terreno-lago-puelo', type: 'terreno', title: 'Terreno en Lago Puelo', price: 40000, ref: 'LLA7897642', m2: 465, rooms: 0, baths: 0, nb: 'Paraná', city: 'Paraná', img: '7897642_68482671910949871306662767902159931061039060985250769186005096156686644655726.jpg' },
  { id: '7897639', slug: '7897639-terreno-puerto-urquiza', type: 'terreno', title: 'Terreno en Puerto Urquiza', price: 65000, ref: 'LLA7897639', m2: 740, rooms: 0, baths: 0, nb: 'Puerto Urquiza', city: 'Paraná', img: '7897639_3206491227281904327611805495336569256640507592671530176776246078449360275466.jpg' },
  { id: '7144076', slug: '7144076-terreno-lomas-del-golf', type: 'terreno', title: 'Terreno en Lomas del Golf', price: 32000, ref: 'LLA7144076', m2: 372, rooms: 0, baths: 0, nb: 'Lomas del Golf', city: 'Paraná', img: '7144076_9849164034584437568708720644583126078491941029523357312746253397047106115782.jpg' },
  { id: '7867260', slug: '7867260-depto-buenos-aires-malvinas', type: 'departamento', title: 'Departamento en Buenos Aires y Malvinas', price: 83000, ref: 'LAP7867260', m2: 42, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7867260_85868517189738226578276502746306475341422119287213088346759123558087166115490.jpg' },
  { id: '7859003', slug: '7859003-depto-san-juan-uruguay', type: 'departamento', title: 'Departamento en San Juan y Uruguay', price: 77000, ref: 'LAP7859003', m2: 57, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7859003_41526643113594945252756696749328681177609004989838071815119820709957065411705.jpg' },
  { id: '7816761', slug: '7816761-cochera-courreges-espana', type: 'cochera', title: 'Cochera en Courreges y España', price: 140000, ref: 'LGA7816761', m2: 0, rooms: 0, baths: 0, nb: 'Paraná', city: 'Paraná', img: '7816761_103486162359122463645981699941622054048085173458580037025042851977347963086492.jpg' },
  { id: '7813238', slug: '7813238-depto-victoria-corrientes', type: 'departamento', title: 'Departamento en Victoria y Corrientes', price: 155000, ref: 'LAP7813238', m2: 0, rooms: 3, baths: 1, nb: 'Centro', city: 'Paraná', img: '7813238_102071811426727112477885076008336833648258462895321444298627798493036793493660.jpg' },
  { id: '7803754', slug: '7803754-depto-santiago-estero-tejeiro', type: 'departamento', title: 'Departamento en Santiago del Estero y Tejeiro', price: 120000, ref: 'LAP7803754', m2: 0, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7803754_36774166615664098072976803657189331431080419100128717324649930182190472042847.jpg' },
  { id: '7803765', slug: '7803765-casa-fray-mamerto-esquiu-906', type: 'casa', title: 'Casa en Fray Mamerto Esquiú 906', price: 165000, ref: 'LHO7803765', m2: 0, rooms: 4, baths: 2, nb: 'Paraná', city: 'Paraná', img: '7803765_90153463377652120908945870737826963854356917298837097624664210260208398453462.jpg' },
  { id: '7765066', slug: '7765066-depto-malvinas-cordoba', type: 'departamento', title: 'Departamento en Malvinas y Córdoba', price: 120000, ref: 'LAP7765066', m2: 40, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7765066_67270102863213316947364649109267044677332946102643013127863824898801118821974.jpg' },
  { id: '7765026', slug: '7765026-depto-paraguay-libertad', type: 'departamento', title: 'Departamento en Paraguay y Libertad', price: 45000, ref: 'LAP7765026', m2: 37, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7765026_70909499178962370739008184499361582601203410459878540322565880369145622903599.jpg' },
  { id: '6965005', slug: '6965005-casa-pascual-palma-chacabuco', type: 'casa', title: 'Casa en Pascual Palma y Chacabuco', price: 240000, ref: 'LHO6965005', m2: 234, rooms: 4, baths: 2, nb: 'Paraná', city: 'Paraná', img: '6965005_26274956673501555743144303007061530342990956202853454922670220144559725840977.jpg' },
  { id: '7718905', slug: '7718905-depto-brasil', type: 'departamento', title: 'Departamento en Brasil', price: 85000, ref: 'LAP7718905', m2: 60, rooms: 3, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7718905_13593878592946209590911317236512585442806714261192584728491475464311337210096.jpg' },
  { id: '7667986', slug: '7667986-casa-ramirez-laurencena', type: 'casa', title: 'Casa en Av. Ramírez y Laurencena', price: 79000, ref: 'LHO7667986', m2: 0, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7667986_67271533262531689449946950528108720038823713892502521753907104760346147488842.jpg' },
  { id: '7664412', slug: '7664412-casa-sauce-montrull', type: 'casa', title: 'Casa en Sauce Montrull', price: 70000, ref: 'LHO7664412', m2: 0, rooms: 2, baths: 1, nb: 'Sauce Montrull', city: 'Paraná', img: '7664412_108654156069359237121705438949779617178900464710995021164393875050983904306220.jpg' },
  { id: '7664291', slug: '7664291-casa-don-bosco-500', type: 'casa', title: 'Casa en Don Bosco al 500', price: 80000, ref: 'LHO7664291', m2: 0, rooms: 3, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7664291_94949983706363320806507071169332469652199552347832757757364749172992597599426.jpg' },
  { id: '7664243', slug: '7664243-depto-corrientes-colon', type: 'departamento', title: 'Departamento en Corrientes y Colón', price: 62000, ref: 'LAP7664243', m2: 0, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7664243_38157413248657100930616852681258088712914000535452157916001569740939749601695.jpg' },
  { id: '6999709', slug: '6999709-casa-san-juan-uruguay', type: 'casa', title: 'Casa en San Juan y Uruguay', price: 170000, ref: 'LHO6999709', m2: 263, rooms: 4, baths: 2, nb: 'Paraná', city: 'Paraná', img: '6999709_33703790518517095685528944951503334707369611979706273606838125126935073656351.jpg' },
  { id: '7611063', slug: '7611063-casa-jose-venturino-1236', type: 'casa', title: 'Casa en José Venturino 1236', price: 75000, ref: 'LHO7611063', m2: 147, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7611063_105226382211857268583865417541348824844038548958311654507765027600995494472420.jpg' },
  { id: '7610953', slug: '7610953-depto-santa-fe-malvinas', type: 'departamento', title: 'Departamento en Santa Fe y Malvinas', price: 150000, ref: 'LAP7610953', m2: 100, rooms: 4, baths: 2, nb: 'Paraná', city: 'Paraná', img: '7610953_91907523560684823562250240665304896281448548255627822818991113070619442513147.jpg' },
  { id: '7253268', slug: '7253268-casa-luis-tilo-bartolome', type: 'casa', title: 'Casa en Luis Tilo Bartolomé', price: 250000, ref: 'LHO7253268', m2: 0, rooms: 3, baths: 2, nb: 'Paraná', city: 'Paraná', img: '7253268_26086302572613396528757534930363307489797726240685154920290190617177861077264.jpg' },
  { id: '6627154', slug: '6627154-local-montecaseros-racedo', type: 'local', title: 'Local en Montecaseros y Racedo', price: 165000, ref: 'LLO6627154', m2: 0, rooms: 0, baths: 1, nb: 'Paraná', city: 'Paraná', img: '6627154_69708256918731089933436313376320957044073625323740257991664659289835826215023.jpg' },
  { id: '6743962', slug: '6743962-casa-urquiza-piedrabuena', type: 'casa', title: 'Casa en Urquiza y Piedrabuena', price: 250000, ref: 'LHO6743962', m2: 0, rooms: 3, baths: 2, nb: 'Paraná', city: 'Paraná', img: '6743962_73187599812645755168486428331661200223568052117455499620173465081347937335788.jpg' },
  { id: '7228344', slug: '7228344-casa-lucio-dagostino-2166', type: 'casa', title: 'Casa en Lucio d\'Agostino 2166', price: 75000, ref: 'LHO7228344', m2: 0, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7228344_68812463468934800709855518581720207241381689016974752245196540227021487367086.jpg' },
  { id: '7365363', slug: '7365363-casa-alameda-federacion', type: 'casa', title: 'Casa en Alameda de la Federación', price: 310000, ref: 'LHO7365363', m2: 0, rooms: 3, baths: 2, nb: 'Paraná', city: 'Paraná', img: '7365363_97826808886910579798376967308433231122700689027977760127386281414854601864220.jpg' },
  { id: '7284293', slug: '7284293-terreno-las-colinas', type: 'terreno', title: 'Terreno en Las Colinas', price: 15000, ref: 'LLA7284293', m2: 811, rooms: 0, baths: 0, nb: 'Las Colinas', city: 'Paraná', img: '7284293_113373388130947596717676119274089346793650983083336671429383414396492586050554.jpg' },
  { id: '7094388', slug: '7094388-depto-laurencena-de-la-torre', type: 'departamento', title: 'Departamento en Laurencena y De la Torre y Vera', price: 95000, ref: 'LAP7094388', m2: 48, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7094388_26122239092970723023249379896787785292130396887564795395243513849356180752496.jpg' },
  { id: '7144081', slug: '7144081-terreno-puerto-urquiza-750', type: 'terreno', title: 'Terreno en Puerto Urquiza', price: 65000, ref: 'LLA7144081', m2: 750, rooms: 0, baths: 0, nb: 'Puerto Urquiza', city: 'Paraná', img: '7144081_93921827945237740713505509636015627355255679229258563293028669201815107296602.jpg' },
  { id: '7101439', slug: '7101439-local-25-mayo-belgrano', type: 'local', title: 'Local en 25 de Mayo y Belgrano', price: 240000, ref: 'LLO7101439', m2: 204, rooms: 0, baths: 1, nb: 'Paraná', city: 'Paraná', img: '7101439_89941949486714700351432249335543487985409654856777226382205234347753310806525.jpg' },
  { id: '6890274', slug: '6890274-depto-laprida-800', type: 'departamento', title: 'Departamento en Laprida al 800', price: 45000, ref: 'LAP6890274', m2: 50, rooms: 1, baths: 1, nb: 'Paraná', city: 'Paraná', img: '6890274_310896523188250017732754197275180791605771953041794653271850468980356686385.jpg' },
  { id: '6639092', slug: '6639092-casa-ruta-18-km-48', type: 'casa', title: 'Casa en Ruta 18 km 48', price: 185000, ref: 'LHO6639092', m2: 381, rooms: 5, baths: 2, nb: 'Paraná', city: 'Paraná', img: '6639092_75567636923155338504468760173882830073575763925258849770460253602301894416403.jpg' },
  { id: '6890313', slug: '6890313-depto-laprida-800-b', type: 'departamento', title: 'Departamento en Laprida al 800', price: 42000, ref: 'LAP6890313', m2: 33, rooms: 1, baths: 1, nb: 'Paraná', city: 'Paraná', img: '6890313_69934060848771079904373582706441639031315353918574467563154072030708999541313.jpg' },
  { id: '6700613', slug: '6700613-terreno-camping-agmer', type: 'terreno', title: 'Terreno en Gral. José María Paz — Zona Camping Agmer', price: 75000, ref: 'LLA6700613', m2: 40339, rooms: 0, baths: 0, nb: 'Paraná', city: 'Paraná', img: '6700613_78478733409880956428443515931810651362006587758220870766812562288261392191894.jpg' },
  { id: '6696914', slug: '6696914-casa-echeverria-blas-parera', type: 'casa', title: 'Casa en Echeverría y Blas Parera', price: 105000, ref: 'LHO6696914', m2: 0, rooms: 2, baths: 1, nb: 'Paraná', city: 'Paraná', img: '6696914_86969673754040983496903276201485977115540675025410721247947108588337333765658.jpg' },
  { id: '6642167', slug: '6642167-terreno-ruta-12-acceso-norte', type: 'terreno', title: 'Terreno en Ruta 12 y Acceso Norte', price: 100000, ref: 'LLA6642167', m2: 4213, rooms: 0, baths: 0, nb: 'Paraná', city: 'Paraná', img: '6642167_53244284017611270752625724595905572100198015006613142942381311865203272595760.jpg' },
];

const IMG_BASE = 'https://static.tokkobroker.com/pictures/';

const typeFeatures = {
  casa: ['Venta', 'Paraná'],
  departamento: ['Venta', 'Paraná'],
  cochera: ['Venta', 'Cochera'],
  terreno: ['Venta', 'Lote'],
  local: ['Venta', 'Comercial'],
};

const featuredIds = [
  'prop-8046943',
  'prop-7989173',
  'prop-7813238',
  'prop-7365363',
  'prop-6965005',
  'prop-7859003',
];

const items = raw.map((p) => {
  const heroImage = `${IMG_BASE}${p.img}`;
  const rooms = Number(p.rooms) || 1;
  const baths = Number(p.baths) ?? 1;
  const m2 = Number(p.m2) || 0;
  return {
    id: `prop-${p.id}`,
    slug: p.slug,
    title: p.title,
    operation: 'venta',
    type: p.type,
    status: 'disponible',
    price: p.price,
    currency: 'USD',
    neighborhood: p.nb,
    city: p.city,
    coveredM2: m2,
    semiCoveredM2: 0,
    rooms: rooms > 0 ? rooms : 1,
    bathrooms: baths,
    description: `${p.title}. Referencia ${p.ref}. Consultá por WhatsApp para más información, visitas y documentación.`,
    features: [...(typeFeatures[p.type] || ['Venta']), `Ref. ${p.ref}`],
    heroImage,
    galleryImages: [heroImage],
    refCode: p.ref,
    tokkoId: p.id,
  };
});

const out = `/** Catálogo importado desde Tokko Broker — LM negocios inmobiliarios */
export type Operation = 'venta' | 'alquiler';
export type PropertyType = 'departamento' | 'casa' | 'ph' | 'duplex' | 'cochera' | 'terreno' | 'local';
export type PropertyStatus = 'disponible' | 'reservada' | 'alquilada' | 'vendida';
export type Currency = 'USD' | 'ARS';

export interface Property {
  id: string;
  slug: string;
  title: string;
  operation: Operation;
  type: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: Currency;
  neighborhood: string;
  city: string;
  coveredM2: number;
  semiCoveredM2: number;
  rooms: number;
  bathrooms: number;
  description: string;
  features: string[];
  heroImage: string;
  galleryImages: string[];
  refCode: string;
  tokkoId: string;
}

export const DEFAULT_PROPERTY_IMAGE =
  'https://static.tokkobroker.com/tfw/img/prop-icons/suptotalconst.6dc67aaa9732.png';

export const properties: Property[] = ${JSON.stringify(items, null, 2)};

export const featuredPropertyIds = ${JSON.stringify(featuredIds, null, 2)};
`;

writeFileSync(join(__dirname, '../../src/data/properties.ts'), out, 'utf8');
console.log(`OK: ${items.length} propiedades → src/data/properties.ts`);
