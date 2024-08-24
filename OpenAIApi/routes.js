const OpenAI = require('openai');
const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

require('dotenv').config();

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});



/**
 * @swagger
 * /:
 *   post:
 *     summary: Llamado POST a la API de OpenAi
 *     description: Obtiene una respuesta en base a un presupuesto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: string
 *                 example: 'Daniela'
 *               incomes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: 'sueldo'
 *                     ammount:
 *                       type: number
 *                       example: 1000000
 *               outcomes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: 'tarjeta de credito'
 *                     ammount:
 *                       type: number
 *                       example: 800000
 *                     total_quotas:
 *                       type: integer
 *                       example: 3
 *                     paid_quotas:
 *                       type: integer
 *                       example: 0
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 */
app.post('/', async (req, res) => {
    try {        
        const { prompt } = req.body;
        console.log('Received prompt: ', prompt);

        const dummy = {
            user: 'Daniela',
            incomes: [
                {
                    name: 'sueldo',
                    ammount: 1000000
                }              
            ],
            outcomes: [
                {
                    name: 'tarjeta de credito',
                    ammount: 800000,
                    total_quotas: 3,
                    paid_quotas: 0
                },  
                {
                    name: 'alimentación',
                    ammount: 200000,
                    total_quotas: 1,
                    paid_quotas: 0
                },  
            ]
        }

        // Instrucciones y reglas de cómo debe responder Gepeto, mientras más abajo la instrucción, menos prioritaria
        const rules = '1. Haz un plan de pago con el contenido enviado. 2. Responde en español.'; 

        const messages = [
            {
                'role': 'system',
                'content': rules
            },
            {
                'role': 'user',
                'content': 'Este es el contenido a analizar : ' + JSON.stringify(dummy)
            }
        ]

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0, //maneja la alucinación del modelo, 0 a 2
            top_p: 1,
            // n: 1
        });

        let formattedResponse = '<p>' + response.choices[0].message.content.replace(/\n/g, '</p><p>') + '</p>';

        return res.status(200).json({
            success: true,
            data: formattedResponse
        });
    } catch (error) {
        console.error('Error: ', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request.',
            error: error.message,
        });
    }
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Listening to port ' + port));
