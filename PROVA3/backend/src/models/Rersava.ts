import mongoose, { Schema, Document } from 'mongoose';

export interface IReserva extends Document {
    cliente: string;
    contato: string;
    mesa: number; 
    pessoas: number;
    dataHora: Date;
    observacoes?: string;
    status: 'reservado' | 'ocupado' | 'finalizado' | 'cancelado';
}

const ReservaSchema: Schema = new Schema({
    cliente: { type: String, required: true },
    contato: { type: String, required: true },
    mesa: { type: Number, required: true },
    pessoas: { type: Number, required: true },
    dataHora: { type: Date, required: true },
    observacoes: { type: String },
    status: { 
        type: String, 
        enum: ['reservado', 'ocupado', 'finalizado', 'cancelado'], 
        default: 'reservado' 
    }
});

export default mongoose.model<IReserva>('Reserva', ReservaSchema);