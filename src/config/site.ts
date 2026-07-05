export const SITE = {
  name: 'LM',
  subtitle: 'negocios inmobiliarios',
  tagline: 'Venta y alquiler de propiedades en Paraná',
  description:
    'LM · negocios inmobiliarios en Paraná, Entre Ríos. Intermediación profesional en compra, venta y alquiler de inmuebles.',
  city: 'Paraná',
  province: 'Entre Ríos',
  country: 'Argentina',
  addressLine: 'Victoria 386 - Oficina 5',
  address: 'Victoria 386 - Oficina 5, Paraná, Entre Ríos',
  phone: '3434647737',
  phoneDisplay: '3434647737',
  whatsappNumber: import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '5493434647737',
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
