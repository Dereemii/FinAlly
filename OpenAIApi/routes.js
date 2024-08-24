const OpenAI = require('openai');
const express = require('express');
const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const { FinancialDiagnosis, Data, Diagnosis, Item, Priority } = require('./classes/FinancialDiagnosis');

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
 *               userInfo:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: 'Daniela'
 *                   age:
 *                     type: integer
 *                     example: 29
 *                   mail:
 *                     type: string
 *                     example: 'danielacortezvaras@gmail.com'
 *               incomes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category:
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
 *                     category:
 *                       type: string
 *                       example: 'tarjeta de credito'
 *                     total_ammount:
 *                       type: number
 *                       example: 800000
 *                     total_quotas:
 *                       type: integer
 *                       example: 3
 *                     paid_quotas:
 *                       type: integer
 *                       example: 0,
 *                     file:
 *                       type: string
 *                       example: 'Aqui iría un base64'
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     diagnosis:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: string
 *                           example: 'Daniela'
 *                         total_income:
 *                           type: number
 *                           example: 1000000
 *                         total_outcomes:
 *                           type: number
 *                           example: 1000000
 *                         balance:
 *                           type: number
 *                           example: 0
 *                         outcome_analysis:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               ammount:
 *                                 type: number
 *                                 example: 800000
 *                               total_quotas:
 *                                 type: integer
 *                                 example: 3
 *                               paid_quotas:
 *                                 type: integer
 *                                 example: 0
 *                               remaining_quotas:
 *                                 type: integer
 *                                 example: 3
 *                               monthly_payment:
 *                                 type: number
 *                                 example: 266666.67
 *                     priorities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: 'tarjeta de credito'
 *                           reason:
 *                             type: string
 *                             example: 'Alta tasa de interés'
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ['Ajustar el presupuesto', 'Considerar consolidar deuda']
 */
app.post('/', async (req, res) => {
    const { prompt } = req.body;

    const dummy = {
        userInfo:{
           name: 'Daniela',
           age: 29,
           mail: 'danielacortezvaras@gmail.com'
        },
        incomes: [
            {
                category: 'sueldo',
                ammount: 1000000
            }
        ],
        outcomes: [
            {
                category: 'tarjeta de credito',
                total_ammount: 800000,
                total_quotas: 3,
                paid_quotas: 0,
                file: ''

            },
            {
                category: 'alimentación',
                total_ammount: 200000,
                total_quotas: 1,
                paid_quotas: 0,
                file: ''
            },
        ]
    }

    const rules =
        `1. Eres un asesor financiero chileno y amable llamado FinAlly que diagnostica, prioriza y optimiza las finanzas de los usuarios que pidan tu asesoría.
         2. Tu respuesta debe ser un JSON válido, no una cadena de texto, sin saltos de línea innecesarios, ni comillas escapadas.
         3. Haz un diagnóstico y evaluación del contenido proporcionado.
         4. La respuesta debe tener la siguiente estructura de clases:
            class FinancialDiagnosis {
                constructor(success, data) {
                this.success = success;
                this.data = new Data(data);
                }
            }
            
            class Data {
                constructor({ diagnosis, priorities, recommendations }) {
                this.diagnosis = new Diagnosis(diagnosis);
                this.priorities = priorities.map(priority => new Priority(priority));
                this.recommendations = recommendations;
                }
            }
            
            class Diagnosis {
                constructor({ user, total_income, total_outcomes, balance, outcome_analysis }) {
                this.user = user;
                this.total_income = total_income;
                this.total_outcomes = total_outcomes;
                this.balance = balance;
                this.outcome_analysis = outcome_analysis.map(item => new Item(item)); 
                }
            }
            
            class Item {
                constructor({ ammount, total_quotas, paid_quotas, remaining_quotas, monthly_payment }) {
                this.ammount = ammount;
                this.total_quotas = total_quotas;
                this.paid_quotas = paid_quotas;
                this.remaining_quotas = remaining_quotas;
                this.monthly_payment = monthly_payment;
                }
            }
            
            class Priority {
                constructor({ name, reason }) {
                this.name = name;
                this.reason = reason;
                }
            }`;

    const userContent =
        `${rules}
         6. Este es el contenido a analizar: ${JSON.stringify(dummy)}`;

    const messages = [
        {
            'role': 'system',
            'content': rules
        },
        {
            'role': 'user',
            'content': userContent
        },
    ];

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0,
        top_p: 1,
    });

    let formattedResponse = response.choices[0].message.content.trim();

    try {
        const jsonResponse = JSON.parse(formattedResponse);
        return res.status(200).json({
            success: true,
            data: jsonResponse
        });
    } catch (parseError) {
        console.error('Parsing Error: ', parseError);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate a valid JSON response.',
            error: parseError.message,
        });
    }
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log('Listening to port ' + port));
