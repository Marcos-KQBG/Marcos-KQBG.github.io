// Configuración editable de la clínica.
// Cambia aquí los datos de contacto y se propagan a toda la web.
// Los campos marcados como "Por confirmar" están pendientes del cliente.

export const PENDIENTE = 'Por confirmar';

export const clinica = {
  nombre: 'El Perro Verde',
  nombreLargo: 'El Perro Verde — Clínica Veterinaria',
  descripcion:
    'Clínica veterinaria en Magallón (Zaragoza). Más de 5 años cuidando a tus mascotas. Pide cita por WhatsApp.',

  // Dominio y URLs absolutas (necesarias para SEO / Open Graph)
  dominio: 'https://perroverde.es',

  // Contacto
  email: 'info@perroverde.es',
  telefono: '+34 609 43 56 62',
  // Número en formato internacional sin "+" ni espacios, p. ej. '34976000000'.
  whatsapp: '34609435662',
  mensajeWhatsapp: 'Hola, me gustaría pedir cita en El Perro Verde',

  // Dirección
  direccion: {
    calle: 'Calle Goya, 32',
    cp: '50520',
    localidad: 'Magallón',
    provincia: 'Zaragoza',
    pais: 'ES',
    // Coordenadas aproximadas de Magallón (centro). Ajustar cuando se confirme el local exacto.
    lat: 41.7857,
    lng: -1.4536,
  },

  // Horario pendiente del cliente.
  horario: PENDIENTE,
  // Para el JSON-LD (schema.org). Vacío mientras no se confirme el horario.
  openingHours: [],

  // Redes (opcional, se pintan solo si existen)
  redes: {
    instagram: null,
    facebook: null,
  },
};

// Enlace a WhatsApp con mensaje prellenado.
// Si aún no hay número, usamos un placeholder que abre WhatsApp igualmente.
export function enlaceWhatsapp() {
  const numero = clinica.whatsapp || '34000000000';
  const texto = encodeURIComponent(clinica.mensajeWhatsapp);
  return `https://wa.me/${numero}?text=${texto}`;
}

// Dirección en una línea (para footer, JSON-LD legible, etc.)
export function direccionUnaLinea() {
  const d = clinica.direccion;
  return `${d.calle}, ${d.cp} ${d.localidad} (${d.provincia})`;
}
