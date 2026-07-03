import { base44 } from '@/api/base44Client';
import { withServiceCall } from '@/utils/serviceErrorHandler';

/**
 * Service centralizado para operações com Projects
 */
export async function listarProjects() {
  return withServiceCall(
    () => base44.entities.Project.list(),
    'Falha ao carregar projetos'
  );
}

export async function listarProjectsPorTipo(tipo) {
  return withServiceCall(
    () => base44.entities.Project.filter({ tipo_projeto: tipo }),
    'Falha ao carregar projetos'
  );
}

export async function listarProjectsAtivos() {
  return withServiceCall(
    () => base44.entities.Project.filter({ status: 'ativo' }),
    'Falha ao carregar projetos ativos'
  );
}

export async function obterProjectById(id) {
  return withServiceCall(
    () => base44.entities.Project.read(id),
    'Falha ao carregar projeto'
  );
}

export async function criarProject(data) {
  return withServiceCall(
    () => base44.entities.Project.create(data),
    'Falha ao criar projeto'
  );
}

export async function atualizarProject(id, data) {
  return withServiceCall(
    () => base44.entities.Project.update(id, data),
    'Falha ao atualizar projeto'
  );
}

export async function deletarProject(id) {
  return withServiceCall(
    () => base44.entities.Project.delete(id),
    'Falha ao excluir projeto'
  );
}

export async function obterSchemaProject() {
  return withServiceCall(
    () => base44.entities.Project.schema(),
    'Falha ao carregar esquema do projeto'
  );
}