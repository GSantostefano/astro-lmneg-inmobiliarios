import { SITE, brandFull } from '../config/site';

export function buildWhatsAppLink(message: string) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${SITE.whatsappNumber}?text=${encoded}`;
}

export function buildPropertyWhatsAppLink(title: string, operation: string, refCode?: string) {
  const ref = refCode ? ` (Ref. ${refCode})` : '';
  return buildWhatsAppLink(
    `Hola ${brandFull}, me interesa la propiedad en ${operation}: "${title}"${ref}. ¿Podemos coordinar una visita?`,
  );
}
