# PokerCoach ♠

> **"Aprende. Juega. Mejora."**
> Aplicación web real y educativa para aprender y dominar el póker Texas Hold'em desde cero.

---

## 📌 ¿Qué es PokerCoach?

**PokerCoach** es una plataforma interactiva diseñada para personas que quieren aprender y mejorar en Texas Hold'em. La aplicación combina:
1. **Tutorial interactivo** estructurado en 17 lecciones paso a paso.
2. **Juego de Texas Hold'em contra bots** con 3 niveles de dificultad (Principiante, Intermedio, Difícil).
3. **Multijugador privado con amigos** mediante salas con código.
4. **Analizador matemático de manos** para calcular desempates y kickers exactos.
5. **Analizador visual mediante foto** para identificar cartas con IA y evaluar el resultado con motor determinista.
6. **Chat con entrenador IA** para resolver dudas de reglas, apuestas y estrategia.
7. **Entrenamiento de toma de decisiones** en situaciones preflop y postflop.
8. **Historial y estadísticas reales** sin datos inventados ni simulaciones falsas.

> ⚠️ **Aviso de Juego Responsable:**
> PokerCoach es una aplicación **estrictamente formativa y de entretenimiento**. **NO** utiliza dinero real, no permite depósitos ni retiradas, y las fichas son 100% virtuales sin valor monetario.

---

## 🛠 Tecnologías Utilizadas

- **Frontend:** React 19 + TypeScript + Vite.
- **Estilos:** Tailwind CSS v4 con paleta oscura premium de tapete de póker.
- **Iconografía & Animaciones:** Lucide React + Motion.
- **Efectos de Sonido:** Web Audio API sintético (cero dependencias externas pesadas).
- **Backend / API:** Express + `@google/genai` (Gemini 3.8 Flash para el chat de entrenador y análisis de imagen).
- **Persistencia:** LocalStorage estructurado + soporte preparado para Supabase.

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
- Node.js 18 o superior.
- npm o pnpm.

### Pasos

1. Clonar el repositorio o descargar el proyecto:
```bash
git clone <url-del-repositorio>
cd pokercoach
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará accesible en: `http://localhost:3000`.

---

## 🔑 Variables de Entorno

Configura en tu archivo `.env`:

```env
# Clave para Gemini AI (Entrenador IA y escáner de fotos)
GEMINI_API_KEY="tu_clave_de_gemini_aqui"

# URL base de la aplicación
APP_URL="http://localhost:3000"

# Configuración opcional de Supabase (FASE 5 y 6)
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

---

## 🧪 Ejecución de Tests

Para validar la sintaxis, tipos y lógica del motor:
```bash
npm run lint
```

Para compilar el proyecto para producción:
```bash
npm run build
```

---

## 🌐 Despliegue en Vercel

1. Sube tu repositorio a GitHub / GitLab.
2. Importa el proyecto en [Vercel](https://vercel.com).
3. Vercel detectará la configuración de Vite/React automáticamente (`npm run build`, directorio `dist`).
4. En **Settings > Environment Variables**, añade `GEMINI_API_KEY`.
5. Haz clic en **Deploy**.

---

## 📋 Plan de Desarrollo por Fases

- [x] **FASE 1: Inicialización del proyecto** (Estructura modular, diseño base, navegación responsiva, perfil de usuario, sonido y dashboard sin datos falsos).
- [ ] **FASE 2: Motor determinista de Texas Hold'em** (Evaluador de 7 a 5 cartas, comparador de manos, kickers, side pots, ciegas, turnos y suite de tests unitarios exhaustivos).
- [ ] **FASE 3: Interfaz visual de la mesa y bots** (Mesa completa, botones dinámicos Fold/Check/Call/Bet/Raise/All-in, slider y 3 niveles de bots).
- [ ] **FASE 4: Tutorial interactivo** (17 lecciones completas con ejercicios evaluados).
- [ ] **FASE 5: Autenticación y base de datos** (Sincronización en la nube y persistencia de cuentas).
- [ ] **FASE 6: Multijugador realtime** (Salas privadas con código).
- [ ] **FASE 7: Analizador manual de manos** (Selector de 52 cartas con explicación de kickers).
- [ ] **FASE 8: Chat IA de entrenador** (Integración server-side con Gemini).
- [ ] **FASE 9: Analizador mediante fotografía** (Modelo de visión con confirmación de cartas).
- [ ] **FASE 10: Entrenamiento y estadísticas avanzadas**.
- [ ] **FASE 11: Pulido visual, animaciones y auditoría final**.
