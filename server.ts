import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with required User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ADVISOR_SYSTEM_INSTRUCTION = `Eres "Don Celis", Asesor Senior Experto e Inteligencia de Atención al Cliente de Automotriz Nor Celis en Perú.

NOR CELIS AUTOMOTRIZ - IDENTIDAD Y PROPUESTA DE VALOR:
- Concesionario multimarca líder en Perú con más de 18 años de trayectoria oficial.
- Especialistas en venta de vehículos 0 KM 2025, Seminuevos Certificados (con historial 100% verificado y garantía), repuestos y accesorios originales de alta gama, y taller mecánico de precisión con tecnología computarizada.

SEDES Y CONTACTO OFICIAL:
- Sede Central & Showroom 360°: Av. Vía de Evitamiento Sur 6003, Cajamarca (amplio almacén de repuestos, banco de alineación 3D y taller integral).
- Sede Lima Norte: Av. Alfredo Mendiola 3600 (Showroom, venta y entregas).
- Horarios: Lunes a Sábado de 8:00 AM a 7:00 PM, Domingos de 9:00 AM a 2:00 PM.
- WhatsApp de Asesoría Inmediata: +51 987 654 321.

PORTAFOLIO DE VEHÍCULOS DESTACADOS:
1. Nuevos 2025 (0 KM con 5 Años de Garantía oficial o 100,000 km):
   - Toyota RAV4 2.5L Hybrid Limited AWD 2025: Desde $32,490 (S/ 121,830), Bono de descuento -S/ 5,630 (~$1,500), consumo 72 km/gal, 219 HP.
   - Nissan Frontier Pro-4X Bi-Turbo Diésel 2025: $36,200 (S/ 135,750), Bono de descuento -S/ 7,500 (~$2,000), 188 HP, torque 450 Nm, tracción 4x4 con bloqueo de diferencial.
   - Hyundai Tucson Limited Smartstream 2025: $31,800 (S/ 119,250), SUV espaciosa y tecnológica.
   - Toyota Yaris Cross, Toyota Hilux 2025, Ford Ranger Raptor.
2. Seminuevos Certificados Nor Celis (Inspección de 150 Puntos aprobada + 12 meses de garantía):
   - BMW 520i Executive 2021: $29,800 (S/ 111,750), TwinPower Turbo, único dueño.
   - Toyota Corolla Cross 2.0 2022: $21,900 (S/ 82,125), cámara 360°, 24,500 km.
   - Toyota Corolla 1.8L Hybrid XEI 2024: $23,000 (S/ 86,250), 82 km/gal, solo 14,200 km.
   - Toyota Hilux 2.4L Turbo Diésel 4x4 SR 2020: $20,400 (S/ 76,500).

PROGRAMAS ESTRELLA:
- PLAN RETOMA: El cliente entrega su vehículo actual como parte de pago. Tasación presencial o virtual en menos de 30 minutos + Bono Exclusivo de hasta S/ 7,500 aplicable directamente a su cuota inicial.
- FINANCIAMIENTO SIMULADO: Inicial mínima desde el 20%, plazos de 12 a 60 meses. Tasas preferenciales desde 9.99% TEA en convenio con BCP, BBVA, Santander Consumer e Interbank.
- TEST DRIVE GRATUITO: Pruebas de manejo a domicilio o en sede previa coordinación.

MARCAS OFICIALES DE REPUESTOS Y ACCESORIOS OEM/AFTERMARKET:
Trabajamos exclusivamente con fabricantes reconocidos mundialmente:
- MICKEY THOMPSON (M/T): Neumáticos All-Terrain y Mud-Terrain (Baja Boss A/T, Baja Legend MTZ) con carcasa reforzada PowerPly XD de 3 capas.
- KEKO: Accesorios off-road y utilitarios para pick-ups (barras antivuelco K1, estribos tubulares en acero al carbono, capotas marítimas con sellado hermético).
- MOBIL / MOBIL 1: Aceites 100% sintéticos (Mobil 1 Advanced Fuel Economy 0W-20, Mobil Super 5W-30, Mobil Delvac para diésel pesado).
- LLUMAR: Láminas de seguridad nanocerámicas y polarizadas antirrobo (IRX, AirBlue 80), máxima protección térmica (hasta 65% de rechazo de calor) y 99.9% de bloqueo UV.
- BLACK RHINO: Aros de aleación de aluminio reforzados estilo beadlock para 4x4 (17" y 18").
- 3M: Tratamiento cerámico Crystal Shield 9H, láminas PPF de protección de pintura contra piedras, polarizados de control solar FX.
- TRAKKO® AUTORUS: Pastillas de freno cerámicas japonesas de alto coeficiente de fricción, zapatas, discos ranurados y ventilados.
- HAVOLINE / TOYOTA GENUINE: Filtros, bujías y lubricantes de especificación original.
- K&N: Filtros de aire de alto flujo lavables y reutilizables (+5 HP garantizados).

TALLER MECÁNICO Y SERVICIOS POSTVENTA:
- Mantenimiento preventivo por kilometraje (5k, 10k, 20k, 50k km) con repuestos originales y sello en el libro de garantía.
- Diagnóstico computarizado avanzado multimarca mediante scanner OBD2 profesional.
- Rectificación de discos y mantenimiento integral de frenos.
- Alineación tridimensional computarizada 3D y balanceo dinámico.
- Instalación profesional certificada en taller de todos los repuestos y accesorios.

DIRECTRICES DE PERSONALIDAD Y RESPUESTA:
1. Actúa como un asesor comercial y técnico experimentado: amable, cortés, altamente profesional y apasionado por los autos.
2. Responde en español peruano neutro, elegante y acogedor.
3. Sé conciso y claro. Usa formato Markdown con viñetas cortas y negritas en datos clave (precios, marcas, modelos, bonos).
4. Si el cliente pregunta por un modelo, dale detalles técnicos relevantes, precio en $ y S/, el bono si aplica, y sugiérele probar el Simulador de Cuotas o agendar un Test Drive.
5. Si el cliente tiene un auto registrado en su Garaje Virtual o consulta por repuestos, valida compatibilidad con marcas oficiales (Mickey Thompson, Mobil, Keko, LLumar, Trakko, 3M, etc.).
6. Invítalo amablemente a explorar las secciones de la página web (Catálogo, Repuestos, Plan Retoma, Financiamiento, Citas de Taller) o a contactar a un asesor por WhatsApp si prefiere atención telefónica directa.`;

// Multi-turn chat route for the Automotive Advisor
app.post('/api/advisor/chat', async (req: Request, res: Response) => {
  try {
    const { messages, model = 'gemini-3.5-flash', context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Se requiere una lista de mensajes válida.',
      });
    }

    // Append runtime context if provided (e.g. active vehicle in virtual garage, current view)
    let dynamicSystemInstruction = ADVISOR_SYSTEM_INSTRUCTION;
    if (context?.activeGarage) {
      dynamicSystemInstruction += `\n\n[CONTEXTO EN VIVO DEL CLIENTE]\nVehículo en su Garaje Virtual: ${context.activeGarage.brand} ${context.activeGarage.model} (${context.activeGarage.year}), Motor: ${context.activeGarage.engine}, Placa: ${context.activeGarage.plate}. Ten en cuenta este modelo para sugerencias de repuestos, lubricantes Mobil, llantas M/T y mantenimientos preventivos.`;
    }
    if (context?.currentView) {
      dynamicSystemInstruction += `\nSección actual que el cliente está navegando: "${context.currentView}".`;
    }

    // Prepare contents array for GoogleGenAI SDK
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Choose model: gemini-3.5-flash for general tasks, gemini-3.1-flash-lite for fast tasks
    const selectedModel = model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash';

    if (!process.env.GEMINI_API_KEY) {
      // Fallback message if key is missing in environment
      return res.json({
        reply: `¡Hola! Soy Don Celis, Asesor Comercial de Automotriz Nor Celis.

Actualmente estoy listo para orientarte en:
- **Vehículos Nuevos 2025:** Toyota RAV4 Hybrid (Bono S/ 5,630), Nissan Frontier Pro-4X (Bono S/ 7,500), Hyundai Tucson.
- **Seminuevos Certificados:** Con 150 puntos de control técnico y 12 meses de garantía.
- **Plan Retoma:** Dejamos tu vehículo usado en parte de pago con bono de hasta S/ 7,500.
- **Repuestos Oficiales:** Mickey Thompson (M/T), LLumar, Mobil 1, Keko, Black Rhino, 3M y Trakko.
- **Financiamiento:** Cuotas desde 20% inicial y hasta 60 meses con BCP, BBVA y Santander.

¿Qué modelo, repuesto o cotización te gustaría revisar hoy?`,
        model: selectedModel,
      });
    }

    let reply = '';
    let usedModel = selectedModel;

    try {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: dynamicSystemInstruction,
          temperature: 0.7,
        },
      });
      reply = response.text || '';
    } catch (apiError: any) {
      console.warn(`Gemini API returned error (${apiError?.message || apiError}), falling back to Nor Celis advisor knowledge engine.`);
      
      // Fallback response generator tailored to user's question
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      reply = generateAdvisorKnowledgeReply(lastUserMsg, context);
    }

    if (!reply) {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      reply = generateAdvisorKnowledgeReply(lastUserMsg, context);
    }

    return res.json({
      reply,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/advisor/chat:', error);
    return res.status(500).json({
      error: error?.message || 'Ocurrió un error al consultar con el Asesor Nor Celis.',
    });
  }
});

// Intelligent Automotive Knowledge Engine when upstream Gemini API experiences demand spikes
function generateAdvisorKnowledgeReply(userText: string, context?: any): string {
  const query = userText.toLowerCase();

  // Active garage context
  const garageInfo = context?.activeGarage
    ? `\n\n*Nota:* Para tu **${context.activeGarage.brand} ${context.activeGarage.model} (${context.activeGarage.year})**, contamos con compatibilidad garantizada en stock central de Cajamarca y envíos en 24h.`
    : '';

  // 1. Plan Retoma
  if (query.includes('retoma') || query.includes('tasacion') || query.includes('tasación') || query.includes('usado') || query.includes('parte de pago') || query.includes('bono de s/ 7,500') || query.includes('bono')) {
    return `¡Excelente consulta! El **Plan Retoma Nor Celis** está diseñado para que renueves tu vehículo sin complicaciones:

• **Tasación en 30 minutos:** Evaluamos tu auto actual de forma física en nuestras sedes o de manera virtual con solo fotos y kilometraje.
• **Bono Exclusivo de hasta S/ 7,500:** Se suma directamente a tu favor para amortizar la cuota inicial de tu próximo **0 KM 2025** o Seminuevo Certificado.
• **Trámite Seguro:** Nos encargamos del levantamiento de gravámenes, peritaje legal y transferencia notarial inmediata.

¿Te gustaría que te ayude a calcular la tasación estimada de tu auto actual o prefieres ver las opciones de 0 KM?${garageInfo}`;
  }

  // 2. Mickey Thompson (M/T) & Tires
  if (query.includes('mickey') || query.includes('thompson') || query.includes('m/t') || query.includes('llanta') || query.includes('neumatico') || query.includes('neumático') || query.includes('all-terrain') || query.includes('mud-terrain')) {
    return `En Automotriz Nor Celis somos distribuidores oficiales de **Mickey Thompson (M/T)** en Perú:

• **Baja Boss A/T (265/65R17 & 285/70R17):** Construcción con tecnología **PowerPly XD de 3 capas**, ultra resistente a pinchazos y cortes en trocha o piedra.
• **Baja Legend MTZ:** Tracción extrema para barro, minería y rutas off-road difíciles.
• **Beneficios Nor Celis:** Instalación, alineación 3D computarizada y balanceo incluidos en nuestro taller por la compra del juego de 4 neumáticos.

Disponemos de stock con entrega inmediata en nuestra Sede Cajamarca (Av. Vía de Evitamiento Sur 6003). ¿Para qué vehículo buscas la medida exacta?${garageInfo}`;
  }

  // 3. LLumar, Keko, Mobil 1, 3M, Trakko, Black Rhino (Repuestos y Accesorios)
  if (query.includes('llumar') || query.includes('keko') || query.includes('mobil') || query.includes('3m') || query.includes('trakko') || query.includes('black rhino') || query.includes('repuesto') || query.includes('freno') || query.includes('aceite')) {
    return `Trabajamos exclusivamente con las marcas líderes mundiales de repuestos y personalización:

• **LLumar:** Láminas de seguridad nanocerámicas y polarizadas antirrobo (IRX y AirBlue 80), con hasta 65% de rechazo de calor y 99.9% de bloqueo UV.
• **Mobil / Mobil 1:** Aceites 100% sintéticos (0W-20 Advanced Fuel Economy para híbridos y 5W-30 para motores turbo).
• **Keko:** Barras antivuelco K1 en acero al carbono, estribos tubulares y capotas marítimas enrollables herméticas para pick-ups (Hilux, Frontier, Ranger).
• **Black Rhino:** Aros de aleación reforzados beadlock en 17" y 18" para 4x4.
• **Trakko® Autorus:** Pastillas y discos de freno cerámicos japoneses de bajo residuo con disipación térmica optimizada.
• **3M:** Tratamiento cerámico Crystal Shield 9H y películas PPF protectoras de pintura.

Todos cuentan con instalación certificada en nuestro taller. ¿Deseas cotizar algún repuesto específico?${garageInfo}`;
  }

  // 4. Financiamiento & Cuotas
  if (query.includes('financiam') || query.includes('cuota') || query.includes('credito') || query.includes('crédito') || query.includes('bcp') || query.includes('bbva') || query.includes('santander') || query.includes('inicial')) {
    return `¡Con gusto te explico las condiciones de nuestro **Simulador de Financiamiento Vehicular**!

• **Cuota Inicial:** Desde 20% (puedes completarla o reducirla con el Bono de Plan Retoma).
• **Plazos Flexibles:** De 12 a 60 meses para autos nuevos o hasta 48 meses para seminuevos.
• **Tasas Exclusivas:** TEA preferencial desde **9.99%** gracias a nuestros convenios institucionales con **BCP, BBVA, Santander Consumer e Interbank**.
• **Aprobación Rápida:** Pre-calificación en solo 15 minutos presentando únicamente tu DNI y sustentación de ingresos.

Por ejemplo, para una **Toyota RAV4 Hybrid 2025** ($32,490), las cuotas mensuales van desde aprox. **S/ 1,460** ($389 USD). ¿Deseas que simulemos un monto específico?`;
  }

  // 5. Vehículos Nuevos 2025
  if (query.includes('nuevo') || query.includes('2025') || query.includes('rav4') || query.includes('frontier') || query.includes('tucson') || query.includes('toyota') || query.includes('nissan') || query.includes('hyundai') || query.includes('0 km')) {
    return `Nuestros modelos estrella **0 KM 2025** cuentan con entrega inmediata y garantía oficial de **5 años o 100,000 km**:

1. **Toyota RAV4 2.5L Hybrid Limited AWD 2025:**
   • Precio: **$32,490** (S/ 121,830) • **Bono -S/ 5,630 (~$1,500)**
   • Rendimiento récord de 72 km/galón, tracción e-AWD y 219 HP.
2. **Nissan Frontier Pro-4X Bi-Turbo Diésel 2025:**
   • Precio: **$36,200** (S/ 135,750) • **Bono -S/ 7,500 (~$2,000)**
   • Motor 2.3L Bi-Turbo 188 HP, torque 450 Nm, bloqueo de diferencial y suspensión multilink.
3. **Hyundai Tucson Limited Smartstream 2025:**
   • Precio: **$31,800** (S/ 119,250) • Máxima seguridad ADAS y confort interior.

Además, puedes solicitar un **Test Drive gratuito** a domicilio o en nuestras sedes. ¿Te gustaría coordinar una prueba?`;
  }

  // 6. Seminuevos Certificados
  if (query.includes('seminuevo') || query.includes('usado') || query.includes('bmw') || query.includes('corolla') || query.includes('hilux') || query.includes('150 puntos')) {
    return `Todos los **Seminuevos Certificados Nor Celis** pasan por nuestra rigurosa **Inspección de 150 Puntos** mecánicos, eléctricos y legales:

• **BMW 520i Executive 2021:** $29,800 (S/ 111,750) • TwinPower Turbo, único dueño con récord oficial.
• **Toyota Corolla Cross 2.0 2022:** $21,900 (S/ 82,125) • Cámara 360°, solo 24,500 km.
• **Toyota Corolla 1.8L Hybrid XEI 2024:** $23,000 (S/ 86,250) • 82 km/galón, solo 14,200 km.
• **Toyota Hilux 4x4 SR Diésel 2020:** $20,400 (S/ 76,500) • Lista para trabajo pesado o faena.

**Garantía Incluida:** 12 meses o 20,000 km en motor y caja de transmisión, 100% libre de gravámenes o multas. ¿Deseas ver fotos detalladas o el informe técnico?`;
  }

  // 7. Citas de Taller & Mantenimiento
  if (query.includes('taller') || query.includes('mantenimiento') || query.includes('cita') || query.includes('scanner') || query.includes('alineacion') || query.includes('alineación') || query.includes('kilometraje') || query.includes('revision') || query.includes('revisión')) {
    return `En nuestro **Taller Mecánico Especializado Nor Celis** garantizamos el óptimo rendimiento de tu vehículo:

• **Mantenimientos Oficiales por Kilometraje:** Pautas de 5k, 10k, 20k y 50k km con insumos originales y sello en cartilla.
• **Scanner Computarizado Multimarca OBD2:** Diagnóstico profundo en tiempo real de motor, transmisión, híbridos y sensores ABS/ESP.
• **Frenos & Suspensión:** Rectificación de discos, instalación de pastillas Trakko® y amortiguación reforzada.
• **Alineación 3D y Balanceo:** Equipos láser de alta precisión.

Puedes reservar tu cita directamente en la sección **Taller & Citas** o indicarme qué servicio necesitas para ayudarte a coordinar el turno.${garageInfo}`;
  }

  // 8. Sedes, Ubicación y Horarios
  if (query.includes('sede') || query.includes('ubicacion') || query.includes('ubicación') || query.includes('direccion') || query.includes('dirección') || query.includes('horario') || query.includes('donde') || query.includes('dónde') || query.includes('cajamarca') || query.includes('lima')) {
    return `Nuestras sedes oficiales están a tu total disposición:

• **Sede Central Cajamarca:** Av. Vía de Evitamiento Sur 6003 (Showroom 360°, Taller Integral, Almacén de Repuestos y Banco de Pruebas).
• **Sede Lima Norte:** Av. Alfredo Mendiola 3600 (Exhibición comercial, venta 0 KM y entregas).
• **Horario de Atención:**
  - Lunes a Sábado: 8:00 AM – 7:00 PM
  - Domingos: 9:00 AM – 2:00 PM
• **Línea Directa / WhatsApp:** +51 987 654 321.

¿En cuál de nuestras sedes te gustaría que te recibamos?`;
  }

  // General Automotive Consultation default
  return `¡Con mucho gusto te asesoro! En **Automotriz Nor Celis** somos tu concesionario multimarca de confianza en Perú.

Te puedo orientar al instante en:
• **Vehículos 0 KM 2025:** Toyota RAV4 Hybrid (Bono S/ 5,630), Nissan Frontier Pro-4X (Bono S/ 7,500), Hyundai Tucson.
• **Seminuevos Garantizados:** 150 puntos de revisión y 12 meses de garantía.
• **Plan Retoma:** Tasación en 30 min y bono de hasta S/ 7,500 para tu cuota inicial.
• **Repuestos y Accesorios Oficiales:** Llantas Mickey Thompson M/T, láminas de seguridad LLumar, lubricantes Mobil 1, aros Black Rhino, frenos Trakko y accesorios Keko.
• **Simulación de Cuotas:** Convenios con BCP, BBVA y Santander desde 20% inicial.

¿Qué vehículo, repuesto o cotización te interesa conocer a detalle?${garageInfo}`;
}

// Configure Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nor Celis Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
