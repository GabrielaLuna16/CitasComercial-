export type Proyecto = 'CCP' | 'PP';
export type Filtro = 'todos' | 'ccp' | 'pp';
export type Interes = 'Alto' | 'Medio' | 'Bajo' | '-' | '';

export interface Cita {
  fecha: string;
  titulo: string;
  estatus: string;
  proyecto: Proyecto;
  interes: string;
}

export interface DashboardData {
  generado: string;
  semanas: string[];
  citas: Record<string, Cita[]>;
}

export interface SemanaSummary {
  semana: string;
  agendadas: number;
  asistidas: number;
}
