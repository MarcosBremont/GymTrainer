import re

text = """
Pecho (1 - 60)
Press de banca plano con barra - Pecho
Press de banca inclinado con barra - Pecho
Press de banca declinado con barra - Pecho
Press de banca plano con mancuernas - Pecho
Press de banca inclinado con mancuernas - Pecho
Press de banca declinado con mancuernas - Pecho
Press de banca en máquina Smith - Pecho
Press inclinado en máquina Smith - Pecho
Press declinado en máquina Smith - Pecho
Press de pecho en máquina convergente sentado - Pecho
Press inclinado en máquina convergente - Pecho
Press declinado en máquina convergente - Pecho
Press de suelo (Floor Press) con barra - Pecho
Press de suelo con mancuernas - Pecho
Press de suelo a una mano con kettlebell - Pecho
Press guillotina al cuello con barra - Pecho
Press Hexagonal (Squeeze press) con mancuernas - Pecho
Press Hexagonal inclinado con mancuernas - Pecho
Aperturas (Flyes) planas con mancuernas - Pecho
Aperturas inclinadas con mancuernas - Pecho
Aperturas declinadas con mancuernas - Pecho
Aperturas en máquina (Peck Deck) - Pecho
Aperturas en polea baja en banco plano - Pecho
Aperturas en polea baja en banco inclinado - Pecho
Cruces de cables en polea alta (hacia abajo) - Pecho
Cruces de cables en polea media (hacia el frente) - Pecho
Cruces de cables en polea baja (hacia arriba) - Pecho
Cruces de cables a una mano en polea - Pecho
Pullover con mancuerna en banco plano - Pecho / Espalda
Pullover con barra recta - Pecho / Espalda
Pullover con barra EZ - Pecho / Espalda
Fondos en paralelas (Dips) con peso corporal - Pecho / Tríceps
Fondos en paralelas lastrados - Pecho / Tríceps
Fondos en anillas - Pecho / Estabilidad
Fondos en máquina asistida - Pecho
Máquina de fondos sentado (Dip machine) - Pecho / Tríceps
Flexiones de pecho (Push-ups) clásicas - Pecho
Flexiones con pies elevados (declinadas) - Pecho (Superior)
Flexiones con manos elevadas (inclinadas) - Pecho (Inferior)
Flexiones diamante (manos juntas) - Pecho / Tríceps
Flexiones abiertas (brazos separados) - Pecho
Flexiones con palmada (Pliométricas) - Pecho
Flexiones asimétricas (una mano adelantada) - Pecho
Flexiones del arquero (Archer push-ups) - Pecho
Flexiones a una mano - Pecho / Core
Flexiones en anillas o TRX - Pecho / Estabilidad
Flexiones con banda de resistencia - Pecho
Flexiones con déficit (manos en discos o bloques) - Pecho
Flexiones Spiderman - Pecho / Core
Press Svend con discos - Pecho (Isométrico)
Press de pecho unilateral con banda elástica - Pecho
Press de banca agarre inverso - Pecho superior / Tríceps
Aperturas con cadenas o bandas elásticas - Pecho
Cruces con bandas de resistencia ancladas - Pecho
Press de pecho en máquina de palanca a una mano - Pecho
Lanzamiento de balón medicinal desde el pecho (Pase de pecho) - Pecho (Potencia)
Flexiones en parada de manos (Handstand push-ups) asistidas - Pecho superior / Hombros
Press de banca isométrico contra pines - Pecho
Aperturas deslizantes en el suelo (con toallas o discos deslizantes) - Pecho
Press de pecho con kettlebells con las bases hacia arriba (Bottoms-up) - Pecho / Estabilidad

Espalda (61 - 125)
Dominadas abiertas (Pull-ups) - Espalda
Dominadas abiertas lastradas - Espalda
Dominadas supinas (Chin-ups) - Espalda / Bíceps
Dominadas supinas lastradas - Espalda / Bíceps
Dominadas con agarre neutro - Espalda
Dominadas con agarre estrecho - Espalda
Dominadas en anillas - Espalda
Dominadas asistidas con banda elástica - Espalda
Dominadas en máquina asistida - Espalda
Dominadas a una mano (o asistidas a una mano) - Espalda
Dominadas excéntricas (negativas) - Espalda
Jalón al pecho con polea ancha (barra recta) - Espalda
Jalón al pecho con agarre supino estrecho - Espalda
Jalón al pecho con agarre neutro (triángulo) - Espalda
Jalón al pecho con agarre V ancho - Espalda
Jalón tras nuca con polea (requiere buena movilidad) - Espalda
Jalón al pecho unilateral en polea alta - Espalda
Jalón con brazos rectos (Straight-arm pulldown) con barra - Espalda
Jalón con brazos rectos con cuerda - Espalda
Remo con barra convencional (inclinado) - Espalda
Remo con barra agarre supino (Yates Row) - Espalda
Remo Pendlay (desde el suelo en cada repetición) - Espalda
Remo con mancuerna a una mano apoyado en banco - Espalda
Remo con dos mancuernas inclinado - Espalda
Remo en barra T (con soporte para pecho) - Espalda
Remo en barra T (libre, agarre estrecho) - Espalda
Remo en barra T (libre, agarre ancho) - Espalda
Remo en polea baja con triángulo (agarre estrecho) - Espalda
Remo en polea baja con barra recta (agarre ancho) - Espalda
Remo en polea baja a una mano - Espalda
Remo en máquina sentado (agarre prono) - Espalda
Remo en máquina sentado (agarre neutro) - Espalda
Remo unilateral en máquina convergente - Espalda
Remo Meadows (con un extremo de la barra) - Espalda
Remo renegado (Renegade Row) con mancuernas - Espalda / Core
Remo invertido (Australian pull-ups) en barra Smith - Espalda
Remo invertido en TRX o anillas - Espalda
Remo con mancuernas recostado boca abajo en banco inclinado (Seal Row) - Espalda
Remo con barra recostado en banco alto (Cambered bar row) - Espalda
Pullover en polea alta recostado en banco - Espalda
Pullover en máquina Nautilus - Espalda
Jalón unilateral en polea alta de rodillas - Espalda
Shrugs (Encogimientos de hombros) con barra - Trapecios (Espalda)
Shrugs con mancuernas - Trapecios
Shrugs en máquina Smith - Trapecios
Shrugs con barra hexagonal (Trap bar) - Trapecios
Shrugs en polea baja - Trapecios
Shrugs por detrás de la espalda con barra - Trapecios
Elevaciones en Y tumbado boca abajo - Trapecios inferiores / Espalda
Face pull en polea alta con cuerda - Trapecios / Deltoides posterior
Face pull sentado en polea baja - Trapecios
Peso muerto convencional con barra - Espalda baja / Piernas
Peso muerto en máquina Smith - Espalda baja / Piernas
Peso muerto con barra hexagonal - Espalda baja / Piernas
Hiperextensiones en banco a 45 grados - Espalda baja
Hiperextensiones a 90 grados (Silla romana) - Espalda baja
Hiperextensiones con disco lastrado - Espalda baja
Extensión de espalda en máquina sentada - Espalda baja
Buenos días (Good mornings) con barra libre - Espalda baja / Femorales
Buenos días en máquina Smith - Espalda baja
Buenos días sentado con barra - Espalda baja
Supermán en el suelo (elevación de brazos y piernas) - Espalda baja
Remo Gorila con kettlebells - Espalda
Paseo del granjero (Farmer's walk) pesado - Trapecios / Agarre / Core
Peso muerto desde bloques (Rack Pulls) - Espalda baja / Trapecios

Hombros (126 - 180)
Press militar de pie con barra (OHP) - Hombros
Press militar sentado con barra - Hombros
Press de hombros sentado con mancuernas - Hombros
Press de hombros de pie con mancuernas - Hombros
Press Arnold con mancuernas - Hombros
Press tras nuca con barra (sentado o de pie) - Hombros
Press de hombros en máquina Smith - Hombros
Press de hombros en máquina convergente - Hombros
Push press con barra (impulso de piernas) - Hombros / Potencia
Push press con mancuernas - Hombros
Press Bradford con barra - Hombros
Press Z (sentado en el suelo con las piernas estiradas) con barra - Hombros / Core
Press Z con mancuernas - Hombros / Core
Press unilateral de rodillas con kettlebell o mancuerna - Hombros / Core
Press cubano con barra o mancuernas - Hombros (Rotadores)
Elevaciones laterales con mancuernas de pie - Hombros
Elevaciones laterales con mancuernas sentado - Hombros
Elevaciones laterales estrictas recostado de lado en banco inclinado - Hombros
Elevaciones laterales en polea baja a una mano - Hombros
Elevaciones laterales en polea baja cruzando cables por detrás - Hombros
Elevaciones laterales en polea baja cruzando cables por delante - Hombros
Elevaciones laterales en máquina específica - Hombros
Elevaciones laterales con kettlebells - Hombros
Elevaciones frontales con mancuernas alternas - Hombros
Elevaciones frontales con mancuernas simultáneas - Hombros
Elevaciones frontales con barra recta - Hombros
Elevaciones frontales con disco (volante) - Hombros
Elevaciones frontales en polea baja con cuerda - Hombros
Elevaciones frontales en polea baja con barra recta - Hombros
Elevaciones frontales con agarre supino (barra o mancuernas) - Hombros
Elevaciones frontales recostado en banco inclinado (hacia arriba) - Hombros
Pájaros (Elevaciones posteriores) con mancuernas de pie inclinado - Hombros
Pájaros con mancuernas sentado e inclinado hacia adelante - Hombros
Pájaros recostado boca abajo en banco inclinado - Hombros
Vuelos posteriores en máquina (Peck Deck inverso) - Hombros
Cruces de cables inversos en polea alta para deltoides posterior - Hombros
Tirones faciales (Face pulls) recostado en el suelo con polea - Hombros / Trapecios
Remo al mentón (Upright row) con barra recta - Hombros / Trapecios
Remo al mentón con barra EZ - Hombros / Trapecios
Remo al mentón con mancuernas - Hombros
Remo al mentón en polea baja - Hombros
Remo al mentón en máquina Smith - Hombros
Rotación externa de manguito rotador con mancuerna recostado de lado - Hombros
Rotación externa de manguito rotador de pie con polea - Hombros
Rotación interna de manguito rotador de pie con polea - Hombros
Rotaciones cubanas en polea - Hombros
"Six-ways" con mancuernas (elevación lateral, frontal, arriba y vuelta) - Hombros
Elevación lateral a una mano agarrado a un poste (inclinando el cuerpo) - Hombros
Encogimiento y giro (Shrug and roll) con mancuernas - Hombros / Trapecios
Levantamiento de disco alrededor de la cabeza (Halos) - Hombros / Movilidad
Press de hombros a un brazo en máquina Smith (de lado) - Hombros
Caminata del camarero (Waiter's walk) con pesa arriba - Hombros / Core
Lanzamiento de balón medicinal vertical hacia arriba - Hombros
Pinos (Handstands) isométricos contra la pared - Hombros
Flexiones de hombros estilo hindú (Pike push-ups) - Hombros

Piernas - Cuádriceps (181 - 230)
Sentadilla libre con barra alta (High bar back squat) - Cuádriceps
Sentadilla libre con barra baja (Low bar back squat) - Piernas
Sentadilla frontal con barra cruzando los brazos - Cuádriceps
Sentadilla frontal con barra agarre olímpico - Cuádriceps
Sentadilla en máquina Smith - Cuádriceps
Sentadilla Hack en máquina (Hack squat) - Cuádriceps
Sentadilla Hack invertida en máquina - Cuádriceps / Glúteos
Sentadilla Hack con barra por detrás de las piernas libre - Cuádriceps
Sentadilla Goblet con kettlebell o mancuerna pesada - Cuádriceps
Sentadilla Sissy libre - Cuádriceps
Sentadilla Sissy en banco específico - Cuádriceps
Sentadilla Sissy lastrada con disco - Cuádriceps
Sentadilla Zercher con barra en el pliegue de los codos - Cuádriceps / Core
Sentadilla de copa (Goblet) con talones elevados (Cyclist squat) - Cuádriceps
Sentadilla Búlgara con mancuernas - Cuádriceps / Glúteos
Sentadilla Búlgara con barra - Cuádriceps
Sentadilla Búlgara en máquina Smith - Cuádriceps
Sentadilla Búlgara con pie trasero en TRX - Estabilidad / Cuádriceps
Prensa de piernas inclinada a 45 grados (pies centrados) - Cuádriceps
Prensa de piernas inclinada (pies bajos juntos) - Cuádriceps énfasis vasto externo
Prensa de piernas horizontal - Cuádriceps
Prensa de piernas vertical (acostado boca arriba) - Cuádriceps
Prensa de piernas a una sola pierna - Cuádriceps
Extensiones de cuádriceps en máquina sentado - Cuádriceps
Extensiones de cuádriceps unilaterales en máquina - Cuádriceps
Extensiones de cuádriceps con las puntas de los pies hacia adentro - Cuádriceps
Extensiones de cuádriceps con las puntas de los pies hacia afuera - Cuádriceps
Zancadas (Lunges) estáticas con barra - Cuádriceps / Glúteos
Zancadas estáticas con mancuernas - Cuádriceps
Zancadas caminando con mancuernas - Cuádriceps
Zancadas caminando con barra en la espalda - Cuádriceps
Zancadas caminando con barra frontal - Cuádriceps
Zancadas inversas con mancuernas (paso atrás) - Cuádriceps
Zancadas inversas en máquina Smith - Cuádriceps
Zancadas inversas desde un déficit (sobre un disco) - Cuádriceps
Zancadas laterales con mancuernas - Cuádriceps / Aductores
Zancadas pendulares (adelante y atrás sin apoyar) - Cuádriceps
Sentadilla Pistol (Pistol squat) asistida - Cuádriceps / Equilibrio
Sentadilla Pistol libre con peso corporal - Cuádriceps
Sentadilla Pistol lastrada con kettlebell - Cuádriceps
Sentadilla Skater (Skater squat) - Cuádriceps
Step-ups (Subidas al cajón) frontales con mancuernas - Cuádriceps
Step-ups laterales al cajón - Cuádriceps
Step-ups con barra libre - Cuádriceps
Step-ups en máquina Smith - Cuádriceps
Sentadilla isométrica apoyado en la pared (Wall sit) - Cuádriceps
Sentadilla isométrica en pared con disco sobre las piernas - Cuádriceps
Máquina de sentadilla pendular (Pendulum Squat) - Cuádriceps
Máquina Belt Squat (Sentadilla con cinturón) - Cuádriceps
Extensiones de pierna en polea baja con tobillera - Cuádriceps

Piernas - Femorales, Glúteos y Cadera (231 - 280)
Peso muerto rumano (RDL) con barra - Femorales / Glúteos
Peso muerto rumano con mancuernas - Femorales / Glúteos
Peso muerto rumano en máquina Smith - Femorales
Peso muerto rumano a una pierna con mancuernas - Femorales / Equilibrio
Peso muerto rumano con barra hexagonal - Femorales
Peso muerto piernas rígidas (Stiff-leg deadlift) con barra - Femorales
Peso muerto piernas rígidas con mancuernas - Femorales
Peso muerto sumo con barra - Femorales / Glúteos / Aductores
Peso muerto sumo con kettlebell pesado - Femorales / Aductores
Curl de isquiotibiales acostado en máquina (Lying leg curl) - Femorales
Curl de isquiotibiales acostado unilateral - Femorales
Curl de isquiotibiales sentado en máquina (Seated leg curl) - Femorales
Curl de isquiotibiales sentado unilateral - Femorales
Curl de isquiotibiales de pie en máquina a una pierna - Femorales
Curl de isquiotibiales con mancuerna (acostado boca abajo) - Femorales
Curl nórdico asistido (Nordic hamstring curl) - Femorales
Curl nórdico libre o con peso - Femorales
Curl de femorales deslizante en el suelo (con discos o toallas) - Femorales
Curl de femorales en pelota suiza (Fitball) - Femorales / Core
Curl de femorales en polea baja con tobillera (de pie) - Femorales
Curl de femorales en polea baja (acostado en el suelo) - Femorales
Hip thrust (Empuje de cadera) con barra en banco - Glúteos
Hip thrust en máquina específica - Glúteos
Hip thrust en máquina Smith - Glúteos
Hip thrust a una sola pierna con peso corporal o mancuerna - Glúteos
Hip thrust con banda de resistencia - Glúteos
Puente de glúteos en el suelo (Glute bridge) libre - Glúteos
Puente de glúteos lastrado con barra - Glúteos
Puente de glúteos a una pierna en el suelo - Glúteos
Frog pumps (Puente de glúteos con plantas de los pies juntas) - Glúteos
Patada de glúteo en polea baja de pie - Glúteos
Patada de glúteo en máquina específica (Glute kickback machine) - Glúteos
Patada de glúteo en cuadrupedia con tobilleras lastradas - Glúteos
Patada de glúteo en máquina Smith (empujando la barra con la planta) - Glúteos
Extensiones de cadera en máquina de hiperextensiones (énfasis glúteo) - Glúteos
Abducción de cadera en máquina sentada - Glúteos (Medio) / Abductores
Abducción de cadera en máquina (inclinado hacia adelante) - Glúteos
Abducción de cadera en polea baja de pie - Glúteos (Medio)
Abducción de cadera acostado de lado con tobillera lastrada - Glúteos
Caminata lateral con banda elástica (Monster walks) - Glúteos
Sentadilla lateral con banda (Side steps) - Glúteos
Conchas (Clamshells) recostado con banda elástica - Glúteos (Rotadores externos)
Pull-through en polea baja con cuerda (de espaldas a la polea) - Glúteos / Femorales
Kettlebell swing (Balanceo) a dos manos - Glúteos / Femorales
Kettlebell swing a una mano - Glúteos / Core
Buenos días con banda elástica gruesa - Femorales / Glúteos
Aducción de cadera en máquina sentada - Aductores (Parte interna del muslo)
Aducción de cadera en polea baja de pie - Aductores
Sentadilla Cossack libre o con kettlebell - Aductores / Movilidad
Copenhague planks (Planchas de aductor en banco) - Aductores / Core

Pantorrillas y Tibiales (281 - 305)
Elevación de talones de pie en máquina - Pantorrillas
Elevación de talones de pie con barra libre - Pantorrillas
Elevación de talones en máquina Smith (sobre un step) - Pantorrillas
Elevación de talones a una pierna con mancuerna - Pantorrillas
Elevación de talones sentado en máquina - Pantorrillas (Sóleo)
Elevación de talones sentado con barra sobre las rodillas - Pantorrillas
Elevación de talones sentado con mancuernas sobre rodillas - Pantorrillas
Elevación de talones en prensa de piernas a 45 grados - Pantorrillas
Elevación de talones en prensa horizontal - Pantorrillas
Elevación de talones tipo burro (Donkey calf raises) en máquina - Pantorrillas
Elevación de talones tipo burro libre (con compañero encima) - Pantorrillas
Elevación de talones tipo burro en máquina Smith (flexionado a 90º) - Pantorrillas
Elevaciones de talones de pie con puntas hacia adentro - Pantorrillas
Elevaciones de talones de pie con puntas hacia afuera - Pantorrillas
Saltos estáticos de tobillo (Pogo jumps) - Pantorrillas (Pliometría)
Andar de puntillas con mancuernas pesadas - Pantorrillas
Elevación de talones excéntrica a una pierna en escalón - Pantorrillas
Máquina de pantorrillas rotatoria (Rotary calf machine) - Pantorrillas
Elevaciones tibiales con banda de resistencia - Tibial anterior
Elevaciones tibiales apoyado de espaldas a la pared - Tibial anterior
Máquina de elevación tibial sentada - Tibial anterior
Elevaciones tibiales con barra Tib (Tib bar) - Tibial anterior
Elevaciones tibiales con kettlebell en la punta del pie - Tibial anterior
Elevaciones de talón en sentadilla profunda (Sissy calf raises) - Pantorrillas
Pasos de ganso (caminar sobre los talones) - Tibiales

Bíceps y Antebrazos (306 - 350)
Curl de bíceps de pie con barra recta - Bíceps
Curl de bíceps de pie con barra EZ - Bíceps
Curl de bíceps alterno con mancuernas de pie - Bíceps
Curl de bíceps simultáneo con mancuernas de pie - Bíceps
Curl inclinado con mancuernas en banco a 45 grados - Bíceps (Cabeza larga)
Curl declinado boca abajo en banco (Spider curl) con barra EZ - Bíceps
Curl Spider con mancuernas - Bíceps
Curl de concentración sentado con mancuerna apoyando codo en muslo - Bíceps
Curl de concentración de pie inclinado libre - Bíceps
Curl predicador (Scott) en banco con barra EZ - Bíceps
Curl predicador con mancuerna a una mano - Bíceps
Curl predicador en máquina de placas - Bíceps
Curl de bíceps en polea baja con barra recta - Bíceps
Curl de bíceps en polea baja con barra EZ - Bíceps
Curl de bíceps en polea baja a una mano con anilla (D-handle) - Bíceps
Curl doble en polea alta (Cristos o pose de doble bíceps) - Bíceps
Curl de bíceps tumbado en el suelo con polea baja - Bíceps
Curl cruzado al pecho con mancuernas (Pinwheel curl) - Bíceps / Braquial
Curl arrastre (Drag curl) con barra (codos hacia atrás) - Bíceps
Curl arrastre con máquina Smith - Bíceps
Curl arrastre con mancuernas - Bíceps
Curl bayesiano en polea (de espaldas a la polea baja) - Bíceps
Curl martillo (Hammer curl) con mancuernas simultáneo - Bíceps / Braquiorradial
Curl martillo con mancuernas alterno - Bíceps / Braquiorradial
Curl martillo con cuerda en polea baja - Bíceps / Braquiorradial
Curl martillo en banco predicador con mancuerna - Bíceps
Curl inverso (agarre prono) con barra recta - Bíceps / Antebrazos
Curl inverso con barra EZ - Bíceps / Antebrazos
Curl inverso en polea baja con barra recta - Bíceps / Antebrazos
Curl Zottman con mancuernas (subida supina, bajada prona) - Bíceps / Antebrazos
Curl de bíceps estricto apoyando espalda y tríceps en la pared - Bíceps
Flexión de muñeca con barra (supinación) apoyado en banco - Antebrazos (Flexores)
Flexión de muñeca con mancuernas - Antebrazos (Flexores)
Flexión de muñeca por detrás de la espalda con barra - Antebrazos
Flexión de muñeca en polea baja - Antebrazos
Extensión de muñeca con barra (pronación) apoyado en banco - Antebrazos (Extensores)
Extensión de muñeca con mancuernas - Antebrazos (Extensores)
Extensión de muñeca en polea baja - Antebrazos (Extensores)
Rodillo de muñeca (Wrist roller) hacia arriba (flexión) - Antebrazos
Rodillo de muñeca hacia abajo (extensión) - Antebrazos
Retenciones isométricas de discos por pinzamiento (Plate pinches) - Antebrazos / Agarre
Colgar de la barra a una o dos manos (Dead hangs) - Antebrazos / Agarre
Paseo del granjero con agarre de pinza (discos) - Antebrazos
Rotación de antebrazos con maza pesada (Macebell) o mancuerna unilateral - Antebrazos
Fat Gripz curls (cualquier curl con adaptadores de agarre grueso) - Bíceps / Agarre

Tríceps (351 - 390)
Extensión de tríceps en polea alta con cuerda - Tríceps
Extensión de tríceps en polea alta con barra recta - Tríceps
Extensión de tríceps en polea alta con barra V - Tríceps
Extensión de tríceps en polea alta con agarre inverso (supino) - Tríceps
Extensión de tríceps en polea alta a una mano con anilla prono - Tríceps
Extensión de tríceps en polea alta a una mano con anilla supino - Tríceps
Extensión de tríceps en polea alta sin accesorio (agarrando la bola del cable) - Tríceps
Press francés (Skullcrushers o Rompecráneos) con barra EZ recostado - Tríceps
Press francés con barra recta recostado - Tríceps
Press francés con mancuernas recostado - Tríceps
Press francés declinado con barra EZ - Tríceps
Extensión de tríceps tras nuca con barra EZ sentado o de pie - Tríceps
Extensión de tríceps tras nuca con mancuerna a dos manos - Tríceps
Extensión de tríceps tras nuca con mancuerna a una mano - Tríceps
Extensión de tríceps tras nuca en polea baja con cuerda - Tríceps
Extensión de tríceps tras nuca en polea alta (de espaldas a la máquina) - Tríceps
Extensión de tríceps katana en polea (cruzado por detrás de la cabeza) - Tríceps
Patada de tríceps (Triceps kickback) con mancuerna apoyado en banco - Tríceps
Patada de tríceps con dos mancuernas inclinado de pie - Tríceps
Patada de tríceps en polea baja sin accesorio - Tríceps
Fondos entre bancos (Bench dips) con peso corporal - Tríceps
Fondos entre bancos lastrados (discos en las piernas) - Tríceps
Press de banca agarre cerrado (Close-grip bench press) - Tríceps / Pecho
Press de banca agarre cerrado en máquina Smith - Tríceps
Press de banca declinado agarre cerrado - Tríceps
Press JM (JM Press) con barra (híbrido entre press cerrado y francés) - Tríceps
Press JM en máquina Smith - Tríceps
Press Tate con mancuernas recostado en banco - Tríceps
Extensión cruzada en polea alta a una mano (tirando en diagonal) - Tríceps
Extensión de tríceps acostado en el suelo (Floor skullcrushers) con barra - Tríceps
Extensión de tríceps acostado en el suelo con kettlebells o mancuernas - Tríceps
Extensión de tríceps en máquina sentado (Triceps extension machine) - Tríceps
Flexiones diamante o de esfinge (Sphinx push-ups) - Tríceps
Extensión de tríceps con peso corporal contra barra Smith, TRX o mesa - Tríceps
Rolling triceps extensions con mancuernas en banco plano - Tríceps
Extensiones PJR (Pull-over + extensión) con mancuerna pesada - Tríceps
Press Spoto con agarre cerrado - Tríceps
Extensión de tríceps a una mano apoyado de lado en el suelo - Tríceps
Extensión de tríceps con banda de resistencia atada en alto - Tríceps
Fondos en anillas manteniendo las correas tocando los bíceps (Bulgarian dips) - Tríceps / Pecho

Antebrazos y Cuello (391 - 415)
Curl de muñeca con barra por la espalda (Behind the back wrist curl) - Antebrazos
Sostén de mancuerna pesada estático por tiempo - Agarre
Curl de dedos con barra (dejando rodar la barra hasta las puntas y subiendo) - Antebrazos
Extensión de dedos con gomas o red de resistencia - Extensores de los dedos
Flexiones sobre la punta de los dedos - Antebrazos / Dedos
Dominadas con toallas (Towel pull-ups) - Antebrazos / Agarre
Sostener peso colgado de toallas - Agarre
Paseo del granjero asimétrico (unilateral) - Agarre / Core
Flexiones de muñecas con barra Z en banco predicador - Antebrazos
Sostén de hex-bar (Trap bar) isométrico pesado - Agarre
Levantamiento de pincho (Pinch block deadlift) - Fuerza de pellizco
Levantamiento con Rolling Thunder o mango giratorio - Fuerza de agarre
Cierre de grippers (Captain of Crush o similares) - Fuerza de aplastamiento
Levantamiento de barra gruesa (Axle bar deadlift) - Agarre
Extensiones de cuello recostado boca arriba con disco en la frente - Cuello (Flexores)
Extensiones de cuello recostado boca abajo con arnés o disco en nuca - Cuello (Extensores)
Flexión lateral del cuello con disco apoyado a un lado de la cabeza - Cuello
Extensiones de cuello en máquina de cuello en 4 direcciones - Cuello
Extensiones de cuello con banda elástica (resistidas) - Cuello
Isométricos de cuello contra resistencia manual - Cuello
Puentes de luchador (Wrestler's bridge) para cuello (Avanzado) - Cuello
Rotaciones isométricas de cuello contra la pared - Cuello
Curl de bíceps con barra de tronco (Log curl) si está disponible - Antebrazos / Bíceps
Paseo del granjero con barra olímpica (requiere mucho balance) - Agarre
Dejar caer el disco de peso y atraparlo antes de que caiga al suelo (Plate flips) - Agarre explosivo

Core y Abdomen (416 - 465)
Crunch abdominal clásico en el suelo - Abdomen superior
Crunch con piernas elevadas a 90 grados - Abdomen
Crunch en banco declinado - Abdomen
Crunch declinado con peso (disco en el pecho o nuca) - Abdomen
Crunch en polea alta con cuerda de rodillas (Cable crunch) - Abdomen
Crunch en máquina sentada - Abdomen
Elevación de piernas colgado en barra (toes to bar o a 90º) - Abdomen inferior
Elevación de rodillas colgado en barra - Abdomen inferior
Elevación de piernas en silla romana (Captain's chair) - Abdomen inferior
Elevación de piernas acostado en el suelo (Leg raises) - Abdomen inferior
Elevación de piernas acostado en banco plano o declinado - Abdomen inferior
Plancha frontal isométrica (Plank) en antebrazos - Core
Plancha frontal con brazos estirados - Core
Plancha frontal lastrada con disco en la espalda - Core
Plancha frontal con deslizamiento hacia adelante y atrás (Body saw) - Core
Plancha lateral apoyado en antebrazo - Core / Oblicuos
Plancha lateral con elevación de pierna (Estrella) - Core / Oblicuos
Rueda abdominal de rodillas (Ab wheel rollout) - Abdomen / Core
Rueda abdominal de pie (Avanzado) - Abdomen / Core
Rollout con barra de pesas en el suelo - Abdomen
Rollout en pelota suiza (Fitball) - Abdomen / Estabilidad
Giros rusos (Russian twists) sin peso - Oblicuos
Giros rusos con balón medicinal, disco o kettlebell - Oblicuos
Toques de talón alternos recostado (Heel touches) - Oblicuos
Crunch bicicleta (Bicycle crunches) - Abdomen / Oblicuos
Tijeras horizontales (Flutter kicks) acostado - Abdomen inferior
Tijeras verticales (Scissor kicks) acostado - Abdomen inferior
V-ups (Abdominales en V o navajas) - Abdomen completo
V-ups alternos a una pierna - Abdomen
Bicho muerto (Dead bug) clásico - Core (Estabilización)
Bicho muerto con resistencia de banda elástica - Core
Pájaro-perro (Bird-dog) o Supermán en cuadrupedia - Core / Espalda baja
Leñador (Woodchopper) en polea alta (de arriba hacia abajo diagonal) - Oblicuos
Leñador en polea baja (de abajo hacia arriba diagonal) - Oblicuos
Leñador horizontal en polea media - Oblicuos
Paseo de maleta (Suitcase carry - paseo de granjero a una mano) - Core (Antiflexión lateral)
Flexión lateral del tronco con mancuerna de pie - Oblicuos
Extensión lateral de tronco en silla romana a 45 grados - Oblicuos
Dragon flag clásico o en progresiones (piernas encogidas) - Core completo
Abdominales estilo mariposa (Butterfly sit-ups) - Abdomen
Hollow body hold (Posición de canoa isométrica) - Core
Hollow body rocks (Balanceos en canoa) - Core
Plancha Copenhague (Copenhagen plank) para aductores y oblicuos - Core
Press Pallof isométrico en polea o con banda (Antirrotación) - Core
Press Pallof con empuje o elevación vertical - Core
Elevación de pelvis en el suelo a una pierna isométrico - Core / Glúteos
Escaladores cruzados (Cross-body mountain climbers) - Core / Oblicuos
Bandera humana (Human flag) - progresiones - Core (Extremo)
L-sit isométrico en paralelas o suelo - Core / Flexores cadera
L-sit en barra de dominadas colgado - Core

Cuerpo Completo, Halterofilia, Pliometría y Cardio funcional (466 - 500)
Burpees clásicos sin flexión - Full Body / Cardio
Burpees con flexión de pecho y salto - Full Body / Cardio
Mountain climbers (Escaladores) frontales rápidos - Abdomen / Cardio
Levantamiento turco (Turkish Get-Up) con kettlebell o mancuerna - Full Body
Arrancada (Snatch) con barra olímpica - Halterofilia / Potencia
Arrancada de potencia (Power snatch) - Halterofilia
Arrancada con mancuerna a una mano - Potencia / Full Body
Arrancada con kettlebell - Potencia
Cargada y envión (Clean and Jerk) - Halterofilia / Full Body
Cargada de potencia (Power clean) con barra - Halterofilia
Cargada colgante (Hang clean) con barra - Halterofilia
Push Jerk con barra - Halterofilia / Hombros
Thruster (Sentadilla frontal + press militar en un movimiento continuo) con barra - Full Body
Thruster con mancuernas o kettlebells - Full Body
Balón medicinal contra la pared (Wall balls) - Piernas / Hombros / Cardio
Golpes de balón medicinal contra el suelo (Slam balls) - Core / Potencia
Cuerdas de batalla (Battle ropes) ondulaciones simultáneas - Hombros / Cardio
Cuerdas de batalla ondulaciones alternas - Hombros / Cardio
Cuerdas de batalla con golpe (Slams) - Full Body / Core
Empuje de trineo (Prowler o Sled push) - Piernas / Full Body / Cardio
Arrastre de trineo (Sled pull) de espaldas - Cuádriceps
Arrastre de trineo tirando con los brazos - Espalda / Full Body
Remo en ergómetro (Rowing machine) - Espalda / Piernas / Cardio
Saltos al cajón (Box jumps) frontales - Pliometría / Potencia
Saltos al cajón desde sentado (Seated box jumps) - Pliometría explosiva
Saltos en profundidad (Depth jumps) - Pliometría
Saltos largos sin carrera (Broad jumps) - Potencia
Saltos de rodillas al pecho (Tuck jumps) - Pliometría
Volteo de neumático pesado (Tire flip) - Full Body / Strongman
Caminata del oso (Bear crawl) pesada o de distancia - Core / Hombros
Golpe de maza sobre neumático (Sledgehammer strikes) - Core / Potencia
Caminata en cinta con chaleco lastrado y máxima inclinación - Cardio / Piernas
Máquina de escaleras (Stairmaster) o subida de escaleras lastrado - Cardio / Piernas
Saltos dobles a la comba (Double unders) - Cardio / Pantorrillas
SkiErg (Máquina de esquí) - Espalda / Core / Cardio
"""

lines = text.strip().split("\n")
current_category = ""
exercises_by_cat = {
    "pecho": [],
    "espalda": [],
    "piernas": [],
    "hombros": [],
    "brazos": [],
    "core": [],
    "cardio": []
}

def idify(name):
    _accents = str.maketrans("áéíóúüñàèìòùâêîôûäëïöü", "aeiouunaeiouaeiouaeiou")
    name = name.split(" -")[0].strip()
    return name.lower().replace(" ", "-").replace("(", "").replace(")", "").translate(_accents)

def get_category(cat_name: str) -> str:
    mapping: dict[str, str] = {
        "Pecho": "pecho",
        "Espalda": "espalda",
        "Hombros": "hombros",
        "Piernas - Cuádriceps": "piernas",
        "Piernas - Femorales, Glúteos y Cadera": "piernas",
        "Pantorrillas y Tibiales": "piernas",
        "Bíceps y Antebrazos": "brazos",
        "Tríceps": "brazos",
        "Antebrazos y Cuello": "brazos",
        "Core y Abdomen": "core",
        "Cuerpo Completo, Halterofilia, Pliometria y Cardio funcional": "cardio",
    }
    return mapping.get(cat_name, "")

for line in lines:
    line = line.strip()
    if not line: continue

    # Category headers look like: "Pecho (1 - 60)" — a number range at the end
    cat_match = re.match(r"^(.+?)\s*\(\d+\s*-\s*\d+\)\s*$", line)
    if cat_match:
        cat_name = cat_match.group(1).strip()
        mapped: str = get_category(cat_name)
        if mapped:
            current_category = mapped
    elif " - " in line:
        ex_name = line.split(" - ")[0].strip()
        ex_id = idify(ex_name)
        if current_category:
            exercises_by_cat[current_category].append({
                "id": ex_id,
                "name": ex_name,
                "sets": 3,
                "reps": "10-12",
                "rest": 60,
                "instructions": ""
            })

import json
print(json.dumps(exercises_by_cat, indent=2, ensure_ascii=False))
