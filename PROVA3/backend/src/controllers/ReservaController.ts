import { Request, Response } from 'express';
import Reserva from '../models/Rersava';
import Mesa from '../models/Mesa';

const DURACAO_PADRAO_MS = 90 * 60 * 1000; 

export class ReservaController {
    static excluir(arg0: string, excluir: any) {
        throw new Error("Method not implemented.");
    }
    static atualizar(arg0: string, atualizar: any) {
        throw new Error("Method not implemented.");
    }
    static listar(arg0: string, listar: any) {
        throw new Error("Method not implemented.");
    }
    static criar(arg0: string, criar: any) {
        throw new Error("Method not implemented.");
    }

   
    async listar(req: Request, res: Response) {
        try {
            const agora = new Date();
            const reservas = await Reserva.find();

            for (let reserva of reservas) {
                if (reserva.status === 'cancelado') continue;

                const inicio = new Date(reserva.dataHora).getTime();
                const fim = inicio + DURACAO_PADRAO_MS;
                const agoraTs = agora.getTime();

                if (agoraTs > fim && reserva.status !== 'finalizado') {
                    reserva.status = 'finalizado';
                    await reserva.save();
                } else if (agoraTs >= inicio && agoraTs <= fim && reserva.status !== 'ocupado') {
                    reserva.status = 'ocupado';
                    await reserva.save();
                }
            }
        
            const listaAtualizada = await Reserva.find().sort({ dataHora: 1 });
            return res.json(listaAtualizada);
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao listar reservas' });
        }
    }

    async criar(req: Request, res: Response) {
        try {
            const { cliente, contato, mesa, pessoas, dataHora, observacoes } = req.body;
            const dataReserva = new Date(dataHora);
            const agora = new Date();

           
            const diferencaTempo = dataReserva.getTime() - agora.getTime();
            if (diferencaTempo < 3600000) {
                return res.status(400).json({ mensagem: 'A reserva deve ser feita com no mínimo 1 hora de antecedência.' });
            }

            const mesaObj = await Mesa.findOne({ numero: mesa });
            if (!mesaObj) return res.status(404).json({ mensagem: 'Mesa não encontrada.' });
            if (mesaObj.capacidade < pessoas) {
                return res.status(400).json({ mensagem: 'A mesa não comporta essa quantidade de pessoas.' });
            }

            const novoInicio = dataReserva.getTime();
            const novoFim = novoInicio + DURACAO_PADRAO_MS;

            const conflitos = await Reserva.find({
                mesa: mesa,
                status: { $in: ['reservado', 'ocupado'] },
                $or: [
                    { 
                        dataHora: { $lt: new Date(novoFim) }, 
                        $expr: { $gt: [{ $add: ["$dataHora", DURACAO_PADRAO_MS] }, new Date(novoInicio)] }
                    }
                ]
            });

            const existeConflito = conflitos.some(r => {
                const rInicio = new Date(r.dataHora).getTime();
                const rFim = rInicio + DURACAO_PADRAO_MS;
                return (novoInicio < rFim && novoFim > rInicio);
            });

            if (existeConflito) {
                return res.status(400).json({ mensagem: 'Mesa indisponível neste horário.' });
            }

            const novaReserva = await Reserva.create({
                cliente, contato, mesa, pessoas, dataHora, observacoes
            });

            console.log(`Reserva criada para ${cliente}`); 
            return res.status(201).json(novaReserva);

        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao criar reserva', erro: error });
        }
    }

    
    async cancelar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const reserva = await Reserva.findByIdAndUpdate(id, { status: 'cancelado' }, { new: true });
            if (!reserva) return res.status(404).json({ mensagem: 'Reserva não encontrada' });
            
            console.log(`Reserva cancelada: ${id}`); 
            return res.json({ mensagem: 'Reserva cancelada com sucesso', reserva });
        } catch (error) {
            return res.status(500).json({ mensagem: 'Erro ao cancelar' });
        }
    }

    async listarMesas(req: Request, res: Response) {
        const mesas = await Mesa.find();
        return res.json(mesas);
    }
}