# Temps - Guia del Temps i Ruba

Una aplicació web meteorològica moderna i professional que ofereix recomanacions intel·ligents de roba basades en dades meteorològiques en temps real per a Coma-ruga i Calafell, Espanya.

## Funcionalitats

- **Dades meteorològiques en temps real** - Alimentada per l'API d'Open-Meteo (gratuïta, sense clau API)
- **Dues ubicacions** - Coma-ruga (ciutat natal) i Calafell (lloc d'estudis)
- **Recomanacions intel·ligents de roba** - Suggeriments per a roba exterior, parts superiors, parts inferiors, equip de pluja i accessoris
- **Previsió horària** - Previsió de 24 hores amb temperatura, probabilitat de pluja i vent
- **Previsió de 7 dies** - Previsions diàries amb temperatures màximes/mínimes, condicions, pluja i vent
- **Gràfics interactius** - Tendències de temperatura i prediccions de pluja/vent
- **Mode fosc/clar** - Detecció automàtica del tema amb commutador manual
- **Disseny adaptatiu** - Funciona perfectament a ordinador i mòbil
- **Actualització automàtica** - S'actualitza cada 10 minuts automàticament
- **Gestió d'errors** - Visualització gràciosa d'errors amb capacitat de reintent

## Inici ràpid

### Opció 1: VS Code Live Server (Recomanat)
1. Obrir la carpeta `Temps` al VS Code
2. Instal·lar l'extensió "Live Server" si no l'heu fet
3. Botó dret a `index.html` → "Open with Live Server"
4. L'aplicació s'obrirà al vostre navegador per defecte

### Opció 2: Servidor HTTP de Python
```bash
cd C:\Users\User\Desktop\Temps
python -m http.server 8000
```
Aleshores obriu `http://localhost:8000` al navegador

### Opció 3: http-server de Node.js
```bash
cd C:\Users\User\Desktop\Temps
npx http-server
```

### Opció 4: Obrir directament l'arxiu (Limitat)
Simplement feu doble clic a `index.html` - Nota: Alguns navegadors poden bloquejar les crides a l'API per CORS en obrir arxius directament. Utilitzeu un servidor local per als millors resultats.

## Estructura del projecte

```
Temps/
├── index.html          # Arxiu HTML principal
├── README.md           # Aquest arxiu
├── css/
│   └── styles.css      # Tots els estils (18KB)
└── js/
    ├── api.js          # Integració API meteorològica (Open-Meteo)
    ├── clothing.js     # Motor de recomanacions de roba
    ├── ui.js           # Renderització UI i manipulació DOM
    └── app.js          # Coordinador principal de l'aplicació
```

## Tecnologies utilitzades

- **JavaScript pur** (patró mòduls ES6 amb IIFE)
- **Propietats personalitzades CSS** per temes
- **Chart.js** per gràfics interactius (carregat via CDN)
- **API d'Open-Meteo** per dades meteorològiques (gratuïta, sense clau)
- **Font Inter** de Google Fonts
- **Icones SVG** - Totes les icones són SVG inline per rendiment

## Font de dades API

Dades meteorològiques proporcionades per [Open-Meteo](https://open-meteo.com/) - una API meteorològica gratuïta i de codi obert amb:
- Condicions meteorològiques actuals
- Previsions horàries (temperatura, humitat, precipitacions, vent, etc.)
- Previsions diàries de 7 dies
- Sense clau API necessària
- Límits de taxa generosos

## Personalització

### Afegir noves ubicacions
Editeu `js/api.js` i afegiu a l'objecte `LOCATIONS`:
```javascript
const LOCATIONS = {
    comaruga: { name: "Coma-ruga", lat: 41.1833, lon: 1.5667, timezone: "Europe/Madrid", type: "Ciutat natal" },
    calafell: { name: "Calafell", lat: 41.2000, lon: 1.5667, timezone: "Europe/Madrid", type: "Lloc d'estudis" },
    // Afegiu noves ubicacions aquí
    novaciutat: { name: "Nova Ciutat", lat: 0.0000, lon: 0.0000, timezone: "Europe/Madrid", type: "Personalitzada" }
};
```

Afegiu els elements `<option>` corresponents a `index.html` per als tres selectors d'ubicació.

### Modificar llindars de roba
Editeu `js/clothing.js` - ajusteu els valors `threshold` a `CLOTHING_ITEMS` per canviar les recomanacions de temperatura.

### Canviar l'interval d'actualització
Editeu `js/app.js` - modifiqueu `UPDATE_INTERVAL_MS` (per defecte: 10 minuts).

## Suport de navegadors

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## Resolució de problemes

### "Error en carregar dades meteorològiques"
- Comproveu la connexió a internet
- Open-Meteo pot estar temporalment no disponible
- Feu clic al botó d'actualitzar (↻) per reintentar

### Els gràfics no es mostren
- Assegureu-vos que JavaScript està habilitat
- Chart.js es carrega des de CDN - requereix connexió a internet
- Comproveu la consola del navegador per errors

### L'ubicació mostra l'hora incorrecta
- L'aplicació utilitza el fus horari de l'API (Europe/Madrid)
- El fus horari del navegador s'utilitza per al format de visualització

## Llicència

Llicència MIT - Sentiu-vos lliures d'utilitzar i modificar per projectes personals o comercials.

## Crèdits

- Dades meteorològiques: [Open-Meteo](https://open-meteo.com/)
- Gràfics: [Chart.js](https://www.chartjs.org/)
- Font: [Inter](https://fonts.google.com/specimen/Inter)
- Icones: SVG personalitzats basats en símbols meteorològics/de roba comuns
- Guillem Gimeno Martí
- Abdul Rahman Maricon

---

**Gaudeix de les teves matins perfectament vestides! 🌤️👕**
