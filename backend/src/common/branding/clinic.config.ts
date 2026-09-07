export const CLINIC_CONFIG = {
  name: 'CLÍNICA SANTA ISABEL',
  shortName: 'CSI',
  slogan: 'Compromiso con tu salud y bienestar',
  rnc: '1-234567-8',
  address: 'Av. Principal #123, Santa Cruz, Bolivia',
  phone: '(591) 77712345',
  email: 'info@clinicasantaisabel.com',
  website: 'www.clinicasantaisabel.com.bo',
  primaryColor: '#1e3a5f',
  secondaryColor: '#5b7a9a',
  accentColor: '#c0392b',
  borderColor: '#d1d9e6',
  headerBgColor: '#f0f4f8',
};

export const TICKET_CONFIG = {
  width: 80 as const,
  header: {
    hospitalName: CLINIC_CONFIG.name,
    hospitalSlogan: CLINIC_CONFIG.slogan,
    address: CLINIC_CONFIG.address,
    phone: CLINIC_CONFIG.phone,
    rnc: CLINIC_CONFIG.rnc,
  },
  footer: {
    thanks: '¡Gracias por su preferencia!',
    line1: CLINIC_CONFIG.website,
    line2: 'Salud y Excelencia a tu servicio',
  },
};
