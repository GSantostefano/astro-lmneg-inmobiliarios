function digitsOnly(value: string | undefined): string {
  return String(value ?? '').replace(/\D/g, '');
}

/** wa.me / API — fuente única: PUBLIC_WHATSAPP_NUMBER (ej. 5493434647737) */
function resolveWhatsAppNumber(): string {
  return digitsOnly(import.meta.env.PUBLIC_WHATSAPP_NUMBER);
}

/** Local AR sin 54 ni 9 móvil (ej. 3434647737) */
function localPhoneFromWhatsApp(wa: string): string {
  let local = wa;
  if (local.startsWith('54')) local = local.slice(2);
  if (local.startsWith('9') && local.length > 10) local = local.slice(1);
  return local;
}

function formatPhoneDisplay(local: string): string {
  if (local.length === 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)}-${local.slice(6)}`;
  }
  return local;
}

const whatsappNumber = resolveWhatsAppNumber();
const phone = localPhoneFromWhatsApp(whatsappNumber);
const phoneDisplay = phone ? formatPhoneDisplay(phone) : '';
const phoneTel = whatsappNumber ? `+${whatsappNumber}` : '';

export const SITE = {
  name: 'LM',
  subtitle: 'negocios inmobiliarios',
  tagline: 'Venta y alquiler de propiedades en Paraná',
  slogan: 'La confianza que buscas, la profesionalidad que mereces.',
  description:
    'LM · negocios inmobiliarios en Paraná, Entre Ríos. Intermediación profesional en compra, venta y alquiler de inmuebles.',
  city: 'Paraná',
  province: 'Entre Ríos',
  country: 'Argentina',
  addressLine: 'Victoria 386 - Oficina 5',
  address: 'Victoria 386 - Oficina 5, Paraná, Entre Ríos',
  /** Número internacional sin + (desde PUBLIC_WHATSAPP_NUMBER) */
  whatsappNumber,
  /** Teléfono local para mostrar (derivado del WhatsApp) */
  phone,
  phoneDisplay,
  /** tel: link internacional (+549…) */
  phoneTel,
  email: 'contacto@lmneginmobiliarios.com.ar',
  logoSrc: '/logo-lm.jpg',
  instagramUrl: 'https://www.instagram.com/lmneginmobiliarios/',
  facebookUrl:
    'https://www.facebook.com/people/LB-Negocios-Inmobiliarios/100094028486750/',
  mission:
    'Brindar un servicio profesional y responsable de intermediación en la compra, venta y alquiler de inmuebles, buscando satisfacer al cliente atendiendo, comprendiendo y trabajando sobre sus necesidades inmobiliarias específicas, y aportando valor a los inversores en bienes raíces.',
  vision:
    'Ser una empresa líder en servicios inmobiliarios, referente absoluto de profesionalismo y atención personalizada.',
  values: ['Compromiso', 'Integridad', 'Profesionalismo'] as const,
  legalDisclaimer:
    'Medidas y precios orientativos. Fotos ilustrativas. Los valores exactos constan en la documentación de cada inmueble.',
};

/** Marca completa para títulos, WhatsApp y metadatos */
export const brandFull = `${SITE.name} · ${SITE.subtitle}`;
