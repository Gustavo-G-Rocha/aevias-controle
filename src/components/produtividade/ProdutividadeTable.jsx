import React from "react";
import { Edit2 } from "lucide-react";

const ENSAIO_LABELS = {
  DiarioObra: 'Diário de Obra',
  ChecklistUsina: 'CL Usina',
  ChecklistAplicacao: 'CL Aplicação',
  ChecklistMRAF: 'CL MRAF',
  ChecklistConcretagem: 'CL Concretagem',
  ChecklistTerraplanagem: 'CL Terraplanagem',
  ChecklistReciclagem: 'CL Reciclagem',
  EnsaioCAUQ: 'Ensaio CAUQ',
  EnsaioDensidade: 'Densidade CP',
  EnsaioDensidadeInSitu: 'Dens. In Situ',
  EnsaioSondagem: 'Sondagem',
  EnsaioTaxaPinturaImprimacao: 'Taxa Pintura',
  AcompanhamentoCarga: 'Ac. Carga',
  EnsaioMRAF: 'Ensaio MRAF',
  EnsaioManchaPendulo: 'Mancha+Pêndulo',
  EnsaioVigaBenkelman: 'Viga Benkelman',
  EnsaioTaxaMRAF: 'Taxa MRAF',
  AcompanhamentoUsinagem: 'Ac. Usinagem',
  EnsaioGranulometriaIndividual: 'Granu. Indiv.',
  GranuMistura: 'Granu. Mistura',
  EnsaioProctor: 'Proctor',
  EnsaioRompimentoConcreto: 'Romp. Concreto',
  BoletimSondagem: 'Boletim Sond.',
  BoletimSondagemTrado: 'Boletim Trado',
};

function DayCell({ registros, markedStatus, futureDay, userCanEdit, onEditClick, onMarkerClick }) {
  if (futureDay) return null;

  if (registros.length > 0) {
    return (
      <div className="flex flex-col gap-0.5">
        {registros.map((reg, idx) => {
          const temInfo = reg.empreiteira || reg.usina;
          const info = reg.empreiteira || reg.usina;
          return (
            <button
              key={idx}
              type="button"
              disabled={!userCanEdit}
              className={`${temInfo ? 'bg-green-500' : 'bg-orange-500'} text-white text-[10px] px-1 py-0.5 rounded font-medium ${userCanEdit ? 'cursor-pointer hover:opacity-80' : ''} text-left w-full`}
              title={`${reg.tipo}${temInfo ? ' - ' + info : ' - Sem empreiteira/usina'}`}
              onClick={() => onEditClick(reg)}
            >
              <div className="text-[9px] font-semibold opacity-90 truncate max-w-[60px]">
                {ENSAIO_LABELS[reg.entityName] || reg.entityName}
              </div>
              <div className="font-bold flex items-center justify-center gap-1">
                OK
                {userCanEdit && !temInfo && <Edit2 className="w-2 h-2" />}
              </div>
              <div className="truncate max-w-[60px]">
                {info || 'Definir'}
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  if (markedStatus) {
    return (
      <button
        type="button"
        disabled={!userCanEdit}
        className={`text-white text-xs px-1 py-1 rounded font-bold ${markedStatus === 'N/A' ? 'bg-blue-400' : 'bg-green-500'} ${userCanEdit ? 'cursor-pointer hover:opacity-80' : ''} w-full`}
        onClick={onMarkerClick}
      >
        {markedStatus}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!userCanEdit}
      className="bg-yellow-400 text-[#00233B] text-xs px-1 py-1 rounded font-bold cursor-pointer hover:bg-yellow-500 transition-colors w-full"
      onClick={onMarkerClick}
    >
      -
    </button>
  );
}

export default function ProdutividadeTable({
  laboratoristas,
  produtividade,
  marcadoresDiaRef,
  days,
  currentMonth,
  isFutureDay,
  userCanEdit,
  onEditClick,
  onMarkerClick,
}) {
  const getDayOfWeek = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toLocaleDateString('pt-BR', { weekday: 'short' });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-primary">
            <th className="border border-border p-2 text-left text-primary-foreground font-semibold sticky left-0 bg-primary z-10 min-w-[200px]">
              Laboratorista
            </th>
            {days.map(day => (
              <th
                key={day}
                className="border border-border p-2 text-center text-primary-foreground font-medium min-w-[50px]"
              >
                <div className="text-xs">{getDayOfWeek(day)}</div>
                <div className="text-sm font-bold">{day}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {laboratoristas.map((lab, index) => (
            <tr key={lab.email} className={index % 2 === 0 ? "bg-card" : "bg-muted/30"}>
              <td className="border border-border p-2 sticky left-0 z-10 bg-inherit">
                <div className="font-medium text-foreground">
                  {lab.laboratorista_name || lab.full_name}
                </div>
                <div className="text-xs text-muted-foreground">{lab.email}</div>
              </td>
              {days.map(day => {
                const registros = produtividade[lab.email.toLowerCase()]?.[day] || [];
                const markerKey = `${lab.email.toLowerCase()}_${day}`;
                const markedStatus = marcadoresDiaRef.current?.[markerKey];
                const futureDay = isFutureDay(day);

                return (
                  <td
                    key={day}
                    className={`border border-border p-1 text-center align-middle ${futureDay ? 'bg-muted/20 opacity-40' : ''}`}
                  >
                    <DayCell
                      registros={registros}
                      markedStatus={markedStatus}
                      futureDay={futureDay}
                      userCanEdit={userCanEdit}
                      onEditClick={onEditClick}
                      onMarkerClick={() => onMarkerClick(lab.email, day)}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {laboratoristas.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum laboratorista encontrado</p>
        </div>
      )}
    </div>
  );
}