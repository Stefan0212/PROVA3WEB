import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/reserva');
        console.log('MongoDB Conectado (Banco: reserva)');
        
        const Mesa = mongoose.model('Mesa'); 
        
        const count = await Mesa.countDocuments();
        
        if (count === 0) {
            console.log('Criando mesas iniciais...');
            await Mesa.insertMany([
                { numero: 1, nmesa: 1, capacidade: 2, localizacao: 'Varanda' },
                { numero: 2, nmesa: 2, capacidade: 4, localizacao: 'Salão' },
                { numero: 3, nmesa: 3, capacidade: 6, localizacao: 'Salão' },
                { numero: 4, nmesa: 4, capacidade: 2, localizacao: 'Interna' },
                { numero: 5, nmesa: 5, capacidade: 4, localizacao: 'Varanda' }
            ]);
            console.log('Mesas iniciais cadastradas com sucesso.');
        }
    } catch (error) {
        console.error('Erro ao conectar ou semear o MongoDB:', error);
        process.exit(1);
    }
};

export default connectDB;