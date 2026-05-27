// Constants
export const PENEIRAS_ASTM = [
  { astm: '3"', abertura_mm: 75.0, descricao: '3" (75.0 mm)' },
  { astm: '2 1/2"', abertura_mm: 63.0, descricao: '2 1/2" (63.0 mm)' },
  { astm: '2"', abertura_mm: 50.0, descricao: '2" (50.0 mm)' },
  { astm: '1 1/2"', abertura_mm: 37.5, descricao: '1 1/2" (37.5 mm)' },
  { astm: '1"', abertura_mm: 25.0, descricao: '1" (25.0 mm)' },
  { astm: '3/4"', abertura_mm: 19.0, descricao: '3/4" (19.0 mm)' },
  { astm: '5/8"', abertura_mm: 16.0, descricao: '5/8" (16.0 mm)' },
  { astm: '1/2"', abertura_mm: 12.5, descricao: '1/2" (12.5 mm)' },
  { astm: '3/8"', abertura_mm: 9.5, descricao: '3/8" (9.5 mm)' },
  { astm: '1/4"', abertura_mm: 6.3, descricao: '1/4" (6.3 mm)' },
  { astm: 'Nº 4', abertura_mm: 4.75, descricao: 'Nº 4 (4.75 mm)' },
  { astm: 'Nº 8', abertura_mm: 2.36, descricao: 'Nº 8 (2.36 mm)' },
  { astm: 'Nº 10', abertura_mm: 2.0, descricao: 'Nº 10 (2.0 mm)' },
  { astm: 'Nº 16', abertura_mm: 1.18, descricao: 'Nº 16 (1.18 mm)' },
  { astm: 'Nº 30', abertura_mm: 0.6, descricao: 'Nº 30 (0.6 mm)' },
  { astm: 'Nº 40', abertura_mm: 0.42, descricao: 'Nº 40 (0.42 mm)' },
  { astm: 'Nº 50', abertura_mm: 0.3, descricao: 'Nº 50 (0.3 mm)' },
  { astm: 'Nº 80', abertura_mm: 0.18, descricao: 'Nº 80 (0.18 mm)' },
  { astm: 'Nº 100', abertura_mm: 0.15, descricao: 'Nº 100 (0.15 mm)' },
  { astm: 'Nº 200', abertura_mm: 0.075, descricao: 'Nº 200 (0.075 mm)' },
  { astm: 'Fundo', abertura_mm: 0.0, descricao: 'Fundo (< 0.075 mm)' }
];

export const TIPO_CORES = {
  CAUQ: "bg-blue-500 text-white",
  MRAF: "bg-green-500 text-white",
  BGS: "bg-purple-500 text-white",
  CAMADAS_GRANULARES: "bg-orange-500 text-white"
};

export const STATUS_CORES = {
  ativo: "bg-green-200/50 text-green-800",
  inativo: "bg-red-200/50 text-red-800"
};

// Utility functions
export function getAberturaMm(astm) {
  const peneira = PENEIRAS_ASTM.find(p => p.astm === astm);
  return peneira ? peneira.abertura_mm : null;
}

export function getPeneiraDescricao(astm) {
  const peneira = PENEIRAS_ASTM.find(p => p.astm === astm);
  return peneira ? peneira.descricao : astm;
}

export function getInitialFaixaData() {
  return {
    tipo: "CAUQ",
    nome: "",
    especificacao: "",
    orgao: "",
    peneiras: [{ astm: "", min: "", max: "" }],
    status: "ativo"
  };
}

export function validatePeneiras(peneiras) {
  return peneiras
    .filter(peneira => peneira.astm && peneira.min !== '' && peneira.max !== '')
    .map(peneira => {
      const astmDetails = PENEIRAS_ASTM.find(p => p.astm === peneira.astm);
      return {
        ...peneira,
        abertura: astmDetails ? `${astmDetails.abertura_mm} mm` : ""
      };
    });
}

export function filterFaixas(faixas, searchTerm, tipoFilter) {
  let filtered = faixas.filter(faixa =>
    faixa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faixa.especificacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faixa.orgao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (tipoFilter !== 'all') {
    filtered = filtered.filter(faixa => faixa.tipo === tipoFilter);
  }

  return filtered;
}

export function getUserAccessLevel(user) {
  if (!user) return 'user';
  return user?.access_level || (user?.role === 'admin' ? 'admin' : 'user');
}

export function canUserManage(user) {
  const accessLevel = getUserAccessLevel(user);
  return accessLevel === 'admin' || 
         accessLevel === 'sala_tecnica_afirmaevias' || 
         accessLevel === 'gestor_contrato';
}