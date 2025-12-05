
import express from 'express';
import cors from 'cors';
import path from 'path';
import connectDB from './config/database';
import Mesa from './models/Mesa'; 
import { ReservaController } from './controllers/ReservaController';

const app = express();
const PORT = 3000; 

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); 

connectDB();

const reservaController = new ReservaController();

app.get('/api/mesas', reservaController.listarMesas);
app.get('/api/reservas', reservaController.listar);
app.post('/api/reservas', reservaController.criar);
app.patch('/api/reservas/:id/cancelar', reservaController.cancelar);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

export default (app);